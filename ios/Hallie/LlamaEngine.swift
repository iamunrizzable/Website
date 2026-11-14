import Foundation
import LlamaSwift

struct ChatTurn { let role: String; let content: String }

/// Runs Llama 3.2 1B on-device (Metal) through llama.cpp. One actor so calls never overlap.
actor LlamaEngine {
    private var model: OpaquePointer?
    private var ctx: OpaquePointer?
    private var vocab: OpaquePointer?

    func load(path: String) throws {
        llama_backend_init()
        var mp = llama_model_default_params()
        mp.n_gpu_layers = 99
        guard let m = llama_model_load_from_file(path, mp) else { throw EngineError.load }
        var cp = llama_context_default_params()
        cp.n_ctx = 4096
        cp.n_batch = 512
        guard let c = llama_init_from_model(m, cp) else { throw EngineError.load }
        model = m; ctx = c; vocab = llama_model_get_vocab(m)
    }

    /// Streams the reply token by token. Re-reads the whole prompt each call (simple and correct).
    func reply(to turns: [ChatTurn], maxTokens: Int = 400, onText: @Sendable (String) -> Void) throws {
        guard let model, let ctx, let vocab else { throw EngineError.load }
        llama_memory_clear(llama_get_memory(ctx), true)

        // Build the prompt with the model's own chat template.
        var cStrings: [(UnsafeMutablePointer<CChar>, UnsafeMutablePointer<CChar>)] = []
        defer { for (r, c) in cStrings { free(r); free(c) } }
        var msgs: [llama_chat_message] = turns.map { t in
            let r = strdup(t.role)!, c = strdup(t.content)!
            cStrings.append((r, c))
            return llama_chat_message(role: UnsafePointer(r), content: UnsafePointer(c))
        }
        let tmpl = llama_model_chat_template(model, nil)
        var buf = [CChar](repeating: 0, count: 32768)
        let n = llama_chat_apply_template(tmpl, &msgs, msgs.count, true, &buf, Int32(buf.count))
        guard n > 0, Int(n) <= buf.count else { throw EngineError.template }
        let prompt = String(cString: buf)

        // Tokenize.
        var toks = [llama_token](repeating: 0, count: prompt.utf8.count + 8)
        let nt = llama_tokenize(vocab, prompt, Int32(prompt.utf8.count), &toks, Int32(toks.count), false, true)
        guard nt > 0 else { throw EngineError.tokenize }
        toks = Array(toks.prefix(Int(nt)))
        guard toks.count < 4096 - 64 else { throw EngineError.tooLong }

        let chain = llama_sampler_chain_init(llama_sampler_chain_default_params())
        defer { llama_sampler_free(chain) }
        llama_sampler_chain_add(chain, llama_sampler_init_temp(0.7))
        llama_sampler_chain_add(chain, llama_sampler_init_top_p(0.9, 1))
        llama_sampler_chain_add(chain, llama_sampler_init_dist(UInt32.random(in: 0...UInt32.max)))

        var batch = llama_batch_get_one(&toks, Int32(toks.count))
        var pending = [UInt8]()
        for _ in 0..<maxTokens {
            if Task.isCancelled { break }
            guard llama_decode(ctx, batch) == 0 else { throw EngineError.decode }
            var tok = llama_sampler_sample(chain, ctx, -1)
            if llama_vocab_is_eog(vocab, tok) { break }
            var piece = [CChar](repeating: 0, count: 64)
            let len = llama_token_to_piece(vocab, tok, &piece, 64, 0, false)
            if len > 0 {
                pending += piece.prefix(Int(len)).map { UInt8(bitPattern: $0) }
                if let s = String(validatingUTF8: pending.map { CChar(bitPattern: $0) } + [0]) {
                    onText(s); pending.removeAll()
                }
            }
            batch = llama_batch_get_one(&tok, 1)
        }
    }
}

enum EngineError: LocalizedError {
    case load, template, tokenize, tooLong, decode
    var errorDescription: String? {
        switch self {
        case .load: return "The model could not be loaded."
        case .template: return "The prompt could not be prepared."
        case .tokenize: return "The message could not be read."
        case .tooLong: return "This conversation is too long. Start a new one."
        case .decode: return "The model stopped unexpectedly."
        }
    }
}
