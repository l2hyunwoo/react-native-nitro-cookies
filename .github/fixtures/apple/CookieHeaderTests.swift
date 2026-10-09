import XCTest
import NitroCookies
import NitroModules
#if canImport(WebKit)
import WebKit
#endif

@MainActor
final class CookieHeaderTests: XCTestCase {
    private let host = "nitro-cookie-header-\(UUID().uuidString.lowercased()).example"
    private let cookies = HybridNitroCookies()

    override func tearDown() async throws {
        for cookie in HTTPCookieStorage.shared.cookies ?? [] where belongsToTest(cookie) {
            HTTPCookieStorage.shared.deleteCookie(cookie)
        }
        #if canImport(WebKit)
        let store = WKWebsiteDataStore.default().httpCookieStore
        let stored = await withCheckedContinuation { continuation in
            store.getAllCookies { continuation.resume(returning: $0) }
        }
        for cookie in stored where belongsToTest(cookie) {
            await withCheckedContinuation { continuation in
                store.delete(cookie) { continuation.resume() }
            }
        }
        #endif
        try await super.tearDown()
    }

    func testSharedRequestHeaderScope() async throws {
        for cookie in try fixtureCookies() {
            HTTPCookieStorage.shared.setCookie(cookie)
        }
        try await assertRequestHeaders(useWebKit: false)
        let header = try await cookies.getCookieHeader(url: "https://\(host)/admin", useWebKit: nil).await()
        XCTAssertEqual(parts(header), parts(try cookies.getCookieHeaderSync(url: "https://\(host)/admin")))

        // Dictionary queries remain domain-based even when the request URL excludes these cookies.
        let listed = try cookies.getSync(url: "http://\(host)/public")
        XCTAssertTrue(listed.contains { $0.name == "admin" })
        XCTAssertTrue(listed.contains { $0.name == "secure" })
        let asyncListed = try await cookies.get(url: "http://\(host)/public", useWebKit: false).await()
        XCTAssertEqual(listed.map(\.name).sorted(), asyncListed.map(\.name).sorted())
    }

    #if canImport(WebKit)
    func testWebKitRequestHeaderScope() async throws {
        let store = WKWebsiteDataStore.default().httpCookieStore
        for cookie in try fixtureCookies() {
            await withCheckedContinuation { continuation in
                store.setCookie(cookie) { continuation.resume() }
            }
        }
        try await assertRequestHeaders(useWebKit: true)
        let listed = try await cookies.get(url: "http://\(host)/public", useWebKit: true).await()
        XCTAssertTrue(listed.contains { $0.name == "admin" })
        XCTAssertTrue(listed.contains { $0.name == "secure" })
    }
    #endif

    private func fixtureCookies() throws -> [HTTPCookie] {
        let url = try XCTUnwrap(URL(string: "https://\(host)/"))
        let future = DateFormatter()
        future.locale = Locale(identifier: "en_US_POSIX")
        future.timeZone = TimeZone(secondsFromGMT: 0)
        future.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
        let headers = [
            "root=public; Path=/",
            "token=root; Path=/",
            "token=admin; Path=/admin",
            "admin=private; Path=/admin",
            "trailing=child; Path=/admin/",
            "case=upper; Path=/Admin",
            "encoded=opaque; Path=/admin%2Fsecret",
            "secure=secret; Path=/; Secure",
            "httpOnly=secret; Path=/; HttpOnly",
            "domain=children; Domain=\(host); Path=/",
            "future=valid; Path=/; Expires=\(future.string(from: Date().addingTimeInterval(3600)))",
            "expired=stale; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT"
        ]
        let parsed = try headers.map { header in
            try XCTUnwrap(HTTPCookie.cookies(withResponseHeaderFields: ["Set-Cookie": header], for: url).first)
        }
        XCTAssertEqual(parsed.first { $0.name == "root" }?.domain, host)
        XCTAssertEqual(parsed.first { $0.name == "domain" }?.domain, "." + host)
        XCTAssertEqual(parsed.first { $0.name == "httpOnly" }?.isHTTPOnly, true)
        XCTAssertLessThan(try XCTUnwrap(parsed.first { $0.name == "expired" }?.expiresDate), Date())
        return parsed
    }

    private func assertRequestHeaders(useWebKit: Bool) async throws {
        let base = ["root=public", "token=root", "secure=secret", "httpOnly=secret", "domain=children", "future=valid"]
        let admin = base + ["token=admin", "admin=private"]
        let cases: [(String, [String])] = [
            ("https://\(host)/admin", admin),
            ("http://\(host)/admin", admin.filter { $0 != "secure=secret" }),
            ("https://\(host)/admin/child", admin + ["trailing=child"]),
            ("https://\(host)/administrator", base),
            ("https://\(host)/public?next=/admin", base),
            ("https://\(host)/Admin", base + ["case=upper"]),
            ("https://\(host)/admin%2Fsecret", base + ["encoded=opaque"]),
            ("https://\(host)", base),
            ("https://\(host.uppercased())/admin", admin),
            ("https://sub.\(host)/admin", ["domain=children"]),
            ("https://other\(host)/admin", []),
            ("https://unrelated.example/admin", [])
        ]
        for (url, expected) in cases {
            if !useWebKit {
                XCTAssertEqual(parts(try cookies.getCookieHeaderSync(url: url)), expected.sorted(), url)
            }
            let header = try await cookies.getCookieHeader(url: url, useWebKit: useWebKit).await()
            XCTAssertEqual(parts(header), expected.sorted(), url)
        }
    }

    private func parts(_ header: String) -> [String] {
        header.isEmpty ? [] : header.components(separatedBy: "; ").sorted()
    }

    private func belongsToTest(_ cookie: HTTPCookie) -> Bool {
        cookie.domain == host || cookie.domain == "." + host
    }
}
