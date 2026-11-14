import SwiftUI

@main
struct HallieApp: App {
    @StateObject private var admin = AdminSession()
    @StateObject private var brain = Brain()

    var body: some Scene {
        WindowGroup {
            Group {
                if admin.checking { ProgressView() }
                else if !admin.signedIn { SignInView(admin: admin) }
                else {
                    TabView {
                        ChatView(brain: brain).tabItem { Label("Chat", systemImage: "bubble.left.and.bubble.right") }
                        WriterView(brain: brain).tabItem { Label("Writer", systemImage: "square.and.pencil") }
                        VStack(spacing: 16) {
                            Text("Signed in as admin").foregroundStyle(.secondary)
                            Button("Sign out", role: .destructive) { admin.signOut() }
                        }.tabItem { Label("Account", systemImage: "person.crop.circle") }
                    }
                    .task { await brain.start() }
                }
            }
            .task { await admin.restore() }
        }
    }
}
