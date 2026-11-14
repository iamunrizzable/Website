import SwiftUI

struct SignInView: View {
    @ObservedObject var admin: AdminSession
    @State private var username = ""
    @State private var password = ""
    @State private var code = ""
    @State private var busy = false

    var body: some View {
        VStack(spacing: 14) {
            Text("Hallie").font(.largeTitle.bold())
            Text("Admin sign-in").foregroundStyle(.secondary)
            TextField("Username", text: $username).textInputAutocapitalization(.never).autocorrectionDisabled()
                .textFieldStyle(.roundedBorder)
            SecureField("Password", text: $password).textFieldStyle(.roundedBorder)
            TextField("6-digit code", text: $code).keyboardType(.numberPad).textFieldStyle(.roundedBorder)
            if !admin.error.isEmpty { Text(admin.error).foregroundStyle(.red).font(.footnote) }
            Button(busy ? "Signing in…" : "Sign in") {
                busy = true
                Task { await admin.signIn(username: username, password: password, code: code); busy = false }
            }
            .buttonStyle(.borderedProminent).tint(.purple)
            .disabled(busy || username.isEmpty || password.isEmpty || code.count < 6)
        }
        .padding(28).frame(maxWidth: 420)
    }
}
