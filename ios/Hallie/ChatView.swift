import SwiftUI

struct Bubble: Identifiable { let id = UUID(); let role: String; var text: String }

@MainActor
final class ChatModel: ObservableObject {
    @Published var bubbles: [Bubble] = []
    @Published var status = "Getting Hallie ready…"
    @Published var ready = false
    @Published var busy = false
    let store = ModelStore()
    private let engine = LlamaEngine()
    private var task: Task<Void, Never>?

    func start() async {
        do {
            let path = try await store.ensureModel()
            status = "Waking Hallie up…"
            try await engine.load(path: path.path)
            ready = true; status = ""
        } catch { status = error.localizedDescription }
    }

    func send(_ text: String) {
        guard ready, !busy, !text.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        bubbles.append(Bubble(role: "user", text: text))
        bubbles.append(Bubble(role: "assistant", text: ""))
        busy = true
        var turns = [ChatTurn(role: "system", content: halliePersona)]
        // Last 8 messages, same as the website.
        turns += bubbles.dropLast().suffix(8).map { ChatTurn(role: $0.role, content: $0.text) }
        let idx = bubbles.count - 1
        task = Task {
            do {
                try await engine.reply(to: turns) { piece in
                    Task { @MainActor in self.bubbles[idx].text += piece }
                }
            } catch { bubbles[idx].text = error.localizedDescription }
            busy = false
        }
    }
}

struct ChatView: View {
    @StateObject private var m = ChatModel()
    @State private var input = ""

    var body: some View {
        VStack(spacing: 0) {
            Text("Hallie").font(.headline).padding(10)
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 10) {
                        ForEach(m.bubbles) { b in
                            Text(b.text.isEmpty ? "…" : b.text)
                                .padding(10)
                                .background(b.role == "user" ? Color.purple.opacity(0.85) : Color.gray.opacity(0.25))
                                .foregroundStyle(b.role == "user" ? .white : .primary)
                                .clipShape(RoundedRectangle(cornerRadius: 14))
                                .frame(maxWidth: .infinity, alignment: b.role == "user" ? .trailing : .leading)
                                .id(b.id)
                        }
                    }.padding()
                }
                .onChange(of: m.bubbles.last?.text) { _ in
                    if let id = m.bubbles.last?.id { proxy.scrollTo(id, anchor: .bottom) }
                }
            }
            if !m.ready {
                VStack(spacing: 6) {
                    if m.store.downloading { ProgressView(value: m.store.progress) }
                    Text(m.store.downloading ? "Downloading Hallie (one time, about 800 MB) \(Int(m.store.progress * 100))%" : m.status)
                        .font(.footnote).foregroundStyle(.secondary)
                }.padding()
            }
            HStack {
                TextField("Message Hallie", text: $input).textFieldStyle(.roundedBorder).disabled(!m.ready)
                Button("Send") { m.send(input); input = "" }.disabled(!m.ready || m.busy)
            }.padding()
        }
        .task { await m.start() }
    }
}
