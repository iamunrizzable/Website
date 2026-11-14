import Foundation
import Security

/// Admin sign-in for the app: same username + password + authenticator code as the website.
/// The session cookie lives only in the Keychain on this device.
@MainActor
final class AdminSession: ObservableObject {
    static let base = URL(string: "https://tjbmanagementinc.com")!
    @Published var signedIn = false
    @Published var checking = true
    @Published var error = ""

    private let account = "admin_session"

    func restore() async {
        defer { checking = false }
        guard let token = Keychain.read(account) else { return }
        signedIn = await verify(token)
        if !signedIn { Keychain.delete(account) }
    }

    func signIn(username: String, password: String, code: String) async {
        error = ""
        var req = URLRequest(url: Self.base.appendingPathComponent("api/admin/login"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["username": username, "password": password, "code": code])
        do {
            let (data, resp) = try await URLSession.shared.data(for: req)
            guard let http = resp as? HTTPURLResponse else { error = "No response."; return }
            if http.statusCode == 200,
               let cookie = HTTPCookie.cookies(withResponseHeaderFields: http.allHeaderFields as! [String: String], for: Self.base)
                   .first(where: { $0.name == "admin_session" }) {
                Keychain.save(account, cookie.value)
                signedIn = true
            } else {
                let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["error"] as? String
                error = msg ?? "Sign-in failed (\(http.statusCode))."
            }
        } catch { error = "Could not reach the site." }
    }

    func signOut() {
        Keychain.delete(account)
        signedIn = false
    }

    private func verify(_ token: String) async -> Bool {
        var req = URLRequest(url: Self.base.appendingPathComponent("api/admin/me"))
        req.setValue("admin_session=\(token)", forHTTPHeaderField: "Cookie")
        guard let (data, resp) = try? await URLSession.shared.data(for: req),
              (resp as? HTTPURLResponse)?.statusCode == 200,
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return false }
        return json["key"] as? String == "session"
    }
}

enum Keychain {
    private static func query(_ account: String) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: "com.tjbmanagementinc.hallie",
         kSecAttrAccount as String: account]
    }
    static func save(_ account: String, _ value: String) {
        delete(account)
        var q = query(account)
        q[kSecValueData as String] = Data(value.utf8)
        q[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        SecItemAdd(q as CFDictionary, nil)
    }
    static func read(_ account: String) -> String? {
        var q = query(account)
        q[kSecReturnData as String] = true
        var out: AnyObject?
        guard SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let d = out as? Data else { return nil }
        return String(data: d, encoding: .utf8)
    }
    static func delete(_ account: String) { SecItemDelete(query(account) as CFDictionary) }
}
