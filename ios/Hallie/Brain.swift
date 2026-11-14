import Foundation

/// The on-device model, shared by Chat and Writer: one download, one load.
@MainActor
final class Brain: ObservableObject {
    @Published var ready = false
    @Published var failed = false
    @Published var status = "Getting Hallie ready…"
    let store = ModelStore()
    let engine = LlamaEngine()
    private var starting = false

    func start() async {
        guard !ready, !starting else { return }
        starting = true; defer { starting = false }
        status = "Getting Hallie ready…"; failed = false
        do {
            let path = try await store.ensureModel()
            status = "Waking Hallie up…"
            try await engine.load(path: path.path)
            ready = true; status = ""
        } catch { status = error.localizedDescription; failed = true }
    }
}
