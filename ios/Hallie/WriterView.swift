import SwiftUI

/// Hallie Writer, on-device: drafts emails and DMs as Hallie or as Tyler. Same prompts as the site's writer.
@MainActor
final class WriterModel: ObservableObject {
    @Published var draft = ""
    @Published var busy = false
    private var task: Task<Void, Never>?

    func run(brain: Brain, message: String, context: String, channel: String, mode: String, persona: String) {
        guard brain.ready, !busy, !message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        draft = ""; busy = true
        let system = WriterPrompts.build(persona: persona, channel: channel, mode: mode, context: context)
        let turns = [ChatTurn(role: "system", content: system), ChatTurn(role: "user", content: message)]
        task = Task {
            do {
                try await brain.engine.reply(to: turns, maxTokens: channel == "email" ? 700 : 400) { piece in
                    Task { @MainActor in self.draft += piece }
                }
            } catch { draft = error.localizedDescription }
            busy = false
        }
    }
    func stop() { task?.cancel() }
}

struct WriterView: View {
    @ObservedObject var brain: Brain
    @StateObject private var w = WriterModel()
    @State private var persona = "hallie"
    @State private var channel = "email"
    @State private var mode = "reply"
    @State private var message = ""
    @State private var context = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text("Drafts only. You review and send everything yourself. Do not paste TikTok-sourced content here.")
                    .font(.footnote).foregroundStyle(.secondary)
                Picker("Write as", selection: $persona) { Text("Hallie").tag("hallie"); Text("Tyler").tag("tyler") }.pickerStyle(.segmented)
                Picker("Channel", selection: $channel) { Text("Email").tag("email"); Text("DM").tag("dm") }.pickerStyle(.segmented)
                Picker("Mode", selection: $mode) { Text("Reply").tag("reply"); Text("Compose").tag("compose") }.pickerStyle(.segmented)
                Text(mode == "reply" ? "What they sent" : "What needs to be said").font(.subheadline.bold())
                TextEditor(text: $message).frame(minHeight: 120).overlay(RoundedRectangle(cornerRadius: 8).stroke(.gray.opacity(0.4)))
                TextField("Extra context (optional)", text: $context).textFieldStyle(.roundedBorder)
                HStack {
                    if w.busy { Button("Stop") { w.stop() } }
                    else {
                        Button("Write draft") { w.run(brain: brain, message: message, context: context, channel: channel, mode: mode, persona: persona) }
                            .buttonStyle(.borderedProminent).tint(.purple).disabled(!brain.ready)
                    }
                    if !brain.ready { Text(brain.status).font(.footnote).foregroundStyle(.secondary) }
                }
                if !w.draft.isEmpty {
                    Text(w.draft).textSelection(.enabled).padding(10)
                        .background(Color.gray.opacity(0.2)).clipShape(RoundedRectangle(cornerRadius: 12))
                    Button("Copy") { UIPasteboard.general.string = w.draft }
                }
            }.padding()
        }
    }
}

enum WriterPrompts {
    static let styleGuide = """
    Concrete writing mechanics for this draft, not just vibes:
    - Never open with "I hope this email finds you well," "Great question!," "I'd be happy to help," or any other stock filler. Start with the actual point.
    - Never use corporate-speak: "circling back," "per my last message," "just following up," "touching base," "reaching out to." Say the plain version instead.
    - Short sentences over long ones. Break up anything that would take two breaths to say out loud.
    - Contractions are normal (I'm, that's, don't) — this isn't formal correspondence.
    - No hedging padding ("I just wanted to," "I was wondering if maybe"). State things directly.
    - It's fine to have a take, a preference, or a bit of dry humor if it fits naturally — don't flatten every sentence into neutral customer-service tone.
    - Think it through in Hallie's voice first. The draft is only what she would actually send. No thinking, no notes, no preamble.
    """
    static let dmSignoff = "All the best,\n-✨Hallie✨"
    static let emailSignoff = "All the best,\n✨ℍ𝕒𝕝𝕝𝕚𝕖✨\n(Tyler’s A.I. Assistant.)"

    static func build(persona: String, channel: String, mode: String, context: String) -> String {
        let kind = channel == "email" ? "email" : "DM"
        let taskLine = mode == "reply"
            ? "Tyler received the following \(kind) and you are drafting the reply. The user message below is what the OTHER person sent."
            : "Tyler wants a new \(kind) written. The user message below is Tyler describing what needs to be said and to whom — turn it into the actual message."
        let ctx = context.trimmingCharacters(in: .whitespacesAndNewlines)
        let contextLine = ctx.isEmpty ? "" : "Additional context from Tyler: \(ctx)"
        let subject = mode == "compose"
            ? "Start with a subject line on its own first line, formatted exactly as \"Subject: ...\", then a blank line, then the email body."
            : "Draft only the reply body — no subject line."

        if persona == "tyler" {
            let numbered = tylerVoiceBaseline.enumerated().map { "[\($0.offset + 1)] \($0.element)" }.joined(separator: "\n")
            let channelRules = channel == "email"
                ? "This is an EMAIL. \(subject) Sign off the way Tyler's samples suggest he would."
                : "This is a DM (Snapchat, Instagram, etc.). Keep it short like a real DM — most of Tyler's real DMs above are ONE line. If one sharp line already lands the point, stop there. Only go to 2-3 sentences when there's a genuinely separate piece of information to add."
            return """
            You are drafting a message for Tyler to send AS HIMSELF, in first person. Tyler is a TikTok LIVE Creator Manager and agency founder with direct industry connections at TikTok.

            \(taskLine) This is a DRAFT ONLY — Tyler reviews it and sends it himself; nothing is sent automatically.

            MOST IMPORTANT — write in Tyler's own voice, not a generic professional voice. Below are \(tylerVoiceBaseline.count) real things Tyler has actually said or written, numbered. Study the full range: sentence length, capitalization, punctuation, filler words, and how his tone shifts depending on who he's talking to and how he feels about it. Match that range for THIS situation. Do not clean up or formalize his grammar/punctuation if the samples show he doesn't bother with it.

            --- TYLER'S ACTUAL WORDS (numbered) ---
            \(numbered)
            --- END ---
            \(channelRules)

            Rules:
            - Write in first person as Tyler. Never mention Hallie, never refer to yourself as an assistant, never say "I'll pass this along" — Tyler IS the one replying.
            - Match Tyler's real voice and real reaction to the situation above every other instruction here.
            - Never make promises Tyler hasn't authorized (signing deals, guarantees, etc.)
            - Output ONLY the draft itself — no quotes around it, no explanation, no preamble

            \(contextLine)
            """
        }

        let channelRules = channel == "email"
            ? "This is an EMAIL. \(subject) Keep it tight — a few short paragraphs at most."
            : "This is a DM (Snapchat, Instagram, etc.). Keep it short like a real DM — usually 1-3 sentences."
        let signoff = channel == "email" ? emailSignoff : dmSignoff
        return """
        \(halliePersonaFull)

        \(styleGuide)

        Tyler is a TikTok LIVE Creator Manager and agency founder with direct industry connections at TikTok. You manage emails, DMs, and responses across his platforms.

        \(taskLine) This is a DRAFT ONLY — Tyler reviews every draft and sends it himself; nothing you write is sent automatically.

        \(channelRules)

        Rules:
        - Never write in Tyler's first person or imply the reader is talking to Tyler
        - End every message with exactly this sign-off on its own line(s) at the very end: "\(signoff)" — unless the message you're replying to was itself addressed to Hallie by name, in which case you can close more naturally instead.
        - If something genuinely needs Tyler's direct attention, say you'll make sure it gets to him
        - If someone wants to reach Tyler for business, the link is tjbmanagementinc.com/tyler/contact/tyler
        - Never make promises Tyler hasn't authorized (signing deals, guarantees, etc.)
        - If replying to something hostile or inappropriate, decline politely but firmly
        - Output ONLY the draft itself — no quotes around it, no explanation, no preamble

        \(contextLine)
        """
    }
}
