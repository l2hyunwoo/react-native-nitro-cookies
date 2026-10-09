import XCTest
import NitroCookies
import NitroModules

final class CookieScopeTests: XCTestCase {
    private let cookies = HybridNitroCookies()
    private let url = "https://api.nitro-scope.example/admin"

    private var variants: [Cookie] {
        [
            Cookie(name: "session", value: "root", path: "/", domain: ".nitro-scope.example",
                   version: nil, expires: nil, secure: true, httpOnly: true),
            Cookie(name: "session", value: "admin", path: "/admin", domain: ".nitro-scope.example",
                   version: nil, expires: nil, secure: true, httpOnly: true),
            Cookie(name: "session", value: "child", path: "/", domain: "api.nitro-scope.example",
                   version: nil, expires: nil, secure: true, httpOnly: true)
        ]
    }

    private func identifier(_ cookie: Cookie) -> CookieIdentifier {
        CookieIdentifier(name: cookie.name, path: cookie.path!, domain: cookie.domain)
    }

    func testSynchronousListsAndScopedDeletion() throws {
        defer {
            for cookie in (try? cookies.getListSync(url: url)) ?? [] {
                try? cookies.clearCookieSync(url: url, identifier: identifier(cookie))
            }
        }
        XCTAssertTrue(try cookies.setManySync(url: url, cookies: variants))
        let list = try cookies.getListSync(url: url)
        XCTAssertEqual(Set(list.map { $0.value }), Set(["root", "admin", "child"]))
        XCTAssertEqual(list.count, 3)
        let admin = try XCTUnwrap(list.first { $0.value == "admin" })
        XCTAssertEqual(admin.domain, ".nitro-scope.example")
        try cookies.clearCookieSync(url: url, identifier: identifier(admin))
        try cookies.clearCookieSync(url: url, identifier: identifier(admin))
        XCTAssertEqual(Set(try cookies.getListSync(url: url).map { $0.value }), Set(["root", "child"]))
        let root = try XCTUnwrap(cookies.getListSync(url: url).first { $0.value == "root" })
        try cookies.clearCookieSync(url: url, identifier: identifier(root))
        XCTAssertEqual(try cookies.getListSync(url: url).map { $0.value }, ["child"])
        let legacy = try cookies.getSync(url: url)
        XCTAssertEqual(legacy.first?.domain, "api.nitro-scope.example")
        let child = try XCTUnwrap(cookies.getListSync(url: url).first)
        try cookies.clearCookieSync(url: url, identifier: identifier(child))
        XCTAssertTrue(try cookies.getListSync(url: url).isEmpty)

        let hostOnly = try XCTUnwrap(HTTPCookie.cookies(
            withResponseHeaderFields: ["Set-Cookie": "host=only; Path=/"], for: URL(string: url)!
        ).first)
        XCTAssertEqual(hostOnly.domain, "api.nitro-scope.example")
        HTTPCookieStorage.shared.setCookie(hostOnly)
        try cookies.clearCookieSync(url: url, identifier: CookieIdentifier(name: "host", path: "/", domain: nil))
        XCTAssertTrue(try cookies.getListSync(url: url).isEmpty)
    }

    func testAsynchronousListsAndScopedDeletion() async throws {
        #if canImport(WebKit)
        let stores = [false, true]
        #else
        let stores = [false]
        #endif
        for useWebKit in stores {
            _ = try await cookies.setMany(url: url, cookies: variants, useWebKit: useWebKit).await()
            let list = try await cookies.getList(url: url, useWebKit: useWebKit).await()
            XCTAssertEqual(Set(list.map { $0.value }), Set(["root", "admin", "child"]))
            let all = try await cookies.getAllList(useWebKit: useWebKit).await()
            XCTAssertEqual(all.filter { $0.name == "session" && $0.domain?.contains("nitro-scope.example") == true }.count, 3)
            let admin = try XCTUnwrap(list.first { $0.value == "admin" })
            try await cookies.clearCookie(url: url, identifier: identifier(admin), useWebKit: useWebKit).await()
            try await cookies.clearCookie(url: url, identifier: identifier(admin), useWebKit: useWebKit).await()
            let remaining = try await cookies.getList(url: url, useWebKit: useWebKit).await()
            XCTAssertEqual(Set(remaining.map { $0.value }), Set(["root", "child"]))
            for cookie in remaining {
                try await cookies.clearCookie(url: url, identifier: identifier(cookie), useWebKit: useWebKit).await()
            }
            let empty = try await cookies.getList(url: url, useWebKit: useWebKit).await()
            XCTAssertTrue(empty.isEmpty)
        }
    }

    func testInvalidIdentifiersDoNotMutateStorage() async throws {
        _ = try cookies.setManySync(url: url, cookies: variants)
        defer {
            for cookie in (try? cookies.getListSync(url: url)) ?? [] {
                try? cookies.clearCookieSync(url: url, identifier: identifier(cookie))
            }
        }
        let invalid = [
            CookieIdentifier(name: "session; injected=x", path: "/", domain: nil),
            CookieIdentifier(name: "session", path: "/; Domain=elsewhere.example", domain: nil),
            CookieIdentifier(name: "session", path: "relative", domain: nil),
            CookieIdentifier(name: "session", path: "/", domain: "elsewhere.example"),
            CookieIdentifier(name: "session", path: "/", domain: "..nitro-scope.example"),
            CookieIdentifier(name: "session\r\n", path: "/", domain: nil)
        ]
        for value in invalid {
            XCTAssertThrowsError(try cookies.clearCookieSync(url: url, identifier: value))
            do {
                try await cookies.clearCookie(url: url, identifier: value, useWebKit: false).await()
                XCTFail("Expected an invalid identifier error")
            } catch {
                XCTAssertTrue(["PARSE_ERROR", "DOMAIN_MISMATCH"].contains((error as NSError).domain))
            }
        }
        XCTAssertThrowsError(try cookies.clearCookieSync(url: "https:///", identifier: CookieIdentifier(name: "session", path: "/", domain: nil)))
        XCTAssertEqual(try cookies.getListSync(url: url).count, 3)
    }

    #if !canImport(WebKit)
    func testNewWebKitOperationsAreUnavailable() async throws {
        let operations: [() async throws -> Void] = [
            { _ = try await self.cookies.getList(url: self.url, useWebKit: true).await() },
            { _ = try await self.cookies.getAllList(useWebKit: true).await() },
            { try await self.cookies.clearCookie(url: self.url, identifier: CookieIdentifier(name: "session", path: "/", domain: nil), useWebKit: true).await() }
        ]
        for operation in operations {
            do {
                try await operation()
                XCTFail("Expected WEBKIT_UNAVAILABLE")
            } catch {
                XCTAssertEqual((error as NSError).domain, "WEBKIT_UNAVAILABLE")
            }
        }
    }
    #endif
}
