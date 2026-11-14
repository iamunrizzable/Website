import SwiftUI

struct Bubble: Identifiable { let id = UUID(); let role: String; var text: String }

@MainActor
final class ChatModel: ObservableObject {
    @Published var bubbles: [Bubble] = []
    @Published var busy = false
    var brain: Brain!
    private var task: Task<Void, Never>?

    func newChat() {
        task?.cancel()
        bubbles = []
        busy = false
    }

    func stop() { task?.cancel() }

    func send(_ text: String) {
        guard brain.ready, !busy, !text.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        bubbles.append(Bubble(role: "user", text: text))
        bubbles.append(Bubble(role: "assistant", text: ""))
        busy = true
        var turns = [ChatTurn(role: "system", content: halliePersona)]
        // Last 8 messages, same as the website.
        turns += bubbles.dropLast().suffix(8).map { ChatTurn(role: $0.role, content: $0.text) }
        let idx = bubbles.count - 1
        task = Task {
            do {
                try await brain.engine.reply(to: turns) { piece in
                    Task { @MainActor in self.bubbles[idx].text += piece }
                }
            } catch { bubbles[idx].text = error.localizedDescription }
            busy = false
        }
    }
}

struct ChatView: View {
    @ObservedObject var brain: Brain
    @StateObject private var m = ChatModel()
    @State private var input = ""

    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                Text("Hallie").font(.headline)
                HStack {
                    Spacer()
                    Button("New chat") { m.newChat() }
                        .font(.footnote)
                        .disabled(m.bubbles.isEmpty)
                }
            }.padding(10)
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
            if !brain.ready {
                VStack(spacing: 6) {
                    if brain.store.downloading { ProgressView(value: brain.store.progress) }
                    Text(brain.store.downloading ? "Downloading Hallie (one time, about 800 MB) \(Int(brain.store.progress * 100))%" : brain.status)
                        .font(.footnote).foregroundStyle(.secondary)
                    if brain.failed { Button("Try again") { Task { await brain.start() } } }
                }.padding()
            }
            HStack {
                TextField("Message Hallie", text: $input).textFieldStyle(.roundedBorder).disabled(!brain.ready)
                if m.busy {
                    Button("Stop") { m.stop() }
                } else {
                    Button("Send") { m.send(input); input = "" }.disabled(!brain.ready)
                }
            }.padding()
        }
        .onAppear { m.brain = brain }
    }
}
