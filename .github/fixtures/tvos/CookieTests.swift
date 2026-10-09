import XCTest
import NitroCookies
import NitroModules

final class CookieTests: XCTestCase {
    func testSharedStorageRoundTrip() async throws {
        let cookies = HybridNitroCookies()
        let url = "https://nitro-cookies-tvos.example"
        let cookie: Cookie = .init(name: "session", value: "tv", path: "/", domain: nil,
                            version: nil, expires: nil, secure: true, httpOnly: true)
        defer { _ = try? cookies.clearByNameSync(url: url, name: cookie.name) }

        XCTAssertTrue(try cookies.setSync(url: url, cookie: cookie))
        let stored = try XCTUnwrap(cookies.getSync(url: url).first { $0.name == cookie.name })
        XCTAssertEqual(stored.value, "tv")
        XCTAssertEqual(stored.httpOnly, true)
        XCTAssertEqual(HTTPCookieStorage.shared.cookies(for: URL(string: url)!)?.first?.value, "tv")
        XCTAssertTrue(try cookies.clearByNameSync(url: url, name: cookie.name))
        XCTAssertTrue(try cookies.getSync(url: url).isEmpty)

        let set = try await cookies.set(url: url, cookie: cookie, useWebKit: false).await()
        XCTAssertTrue(set)
        let fetched = try await cookies.get(url: url, useWebKit: false).await()
        XCTAssertEqual(fetched.first?.value, "tv")
        let cleared = try await cookies.clearAll(useWebKit: false).await()
        XCTAssertTrue(cleared)
        XCTAssertTrue(try cookies.getSync(url: url).isEmpty)
    }

    func testWebKitIsUnavailable() async throws {
        let cookies = HybridNitroCookies()
        let url = "https://nitro-cookies-tvos.example"
        let cookie: Cookie = .init(name: "session", value: "tv", path: nil, domain: nil,
                            version: nil, expires: nil, secure: nil, httpOnly: nil)

        // Each WebKit entry point must reject instead of silently using shared storage.
        let operations: [() async throws -> Void] = [
            { _ = try await cookies.set(url: url, cookie: cookie, useWebKit: true).await() },
            { _ = try await cookies.setMany(url: url, cookies: [cookie], useWebKit: true).await() },
            { _ = try await cookies.getCookieHeader(url: url, useWebKit: true).await() },
            { _ = try await cookies.get(url: url, useWebKit: true).await() },
            { _ = try await cookies.clearAll(useWebKit: true).await() },
            { _ = try await cookies.getAll(useWebKit: true).await() },
            { _ = try await cookies.clearByName(url: url, name: cookie.name, useWebKit: true).await() }
        ]
        for operation in operations {
            do {
                try await operation()
                XCTFail("Expected WEBKIT_UNAVAILABLE")
            } catch {
                XCTAssertEqual((error as NSError).domain, "WEBKIT_UNAVAILABLE")
                XCTAssertEqual((error as NSError).code, 3)
            }
        }
    }
}
