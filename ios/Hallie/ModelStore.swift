import Foundation

/// Downloads the GGUF once into Application Support and reports progress.
@MainActor
final class ModelStore: NSObject, ObservableObject, URLSessionDownloadDelegate {
    static let url = URL(string: "https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf")!
    @Published var progress: Double = 0
    @Published var downloading = false
    private var continuation: CheckedContinuation<URL, Error>?

    static var fileURL: URL {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("Llama-3.2-1B-Instruct-Q4_K_M.gguf")
    }

    func ensureModel() async throws -> URL {
        let dest = Self.fileURL
        if FileManager.default.fileExists(atPath: dest.path) { return dest }
        downloading = true
        defer { downloading = false }
        let tmp: URL = try await withCheckedThrowingContinuation { c in
            continuation = c
            let s = URLSession(configuration: .default, delegate: self, delegateQueue: nil)
            s.downloadTask(with: Self.url).resume()
        }
        try? FileManager.default.removeItem(at: dest)
        try FileManager.default.moveItem(at: tmp, to: dest)
        return dest
    }

    nonisolated func urlSession(_ s: URLSession, downloadTask: URLSessionDownloadTask, didWriteData _: Int64, totalBytesWritten w: Int64, totalBytesExpectedToWrite t: Int64) {
        guard t > 0 else { return }
        Task { @MainActor in self.progress = Double(w) / Double(t) }
    }

    nonisolated func urlSession(_ s: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
        // The system deletes `location` after this returns, so move it first.
        let keep = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        do {
            try FileManager.default.moveItem(at: location, to: keep)
            Task { @MainActor in self.continuation?.resume(returning: keep); self.continuation = nil }
        } catch {
            Task { @MainActor in self.continuation?.resume(throwing: error); self.continuation = nil }
        }
    }

    nonisolated func urlSession(_ s: URLSession, task: URLSessionTask, didCompleteWithError e: Error?) {
        guard let e else { return }
        Task { @MainActor in self.continuation?.resume(throwing: e); self.continuation = nil }
    }
}
