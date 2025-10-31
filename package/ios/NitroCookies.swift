import Foundation
import WebKit
import NitroModules

/**
 * NitroCookies - iOS implementation of cookie management
 *
 * Provides high-performance cookie operations using NSHTTPCookieStorage
 * and WKHTTPCookieStore with Nitro Modules JSI architecture.
 */
public class NitroCookies: HybridNitroCookiesSpec {

    // MARK: - Initialization

    public required override init() {
        super.init()
    }

    // MARK: - Date Formatters

    /// ISO 8601 date formatter for cookie expires (yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ)
    private static let iso8601Formatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    // MARK: - Helper Functions

    /**
     * Convert Cookie struct to NSHTTPCookie
     */
    private func makeHTTPCookie(from cookie: Cookie, url: URL) throws -> HTTPCookie {
        let host = url.host ?? ""
        let cookieDomain = cookie.domain ?? host
        let cookiePath = cookie.path ?? "/"

        var properties: [HTTPCookiePropertyKey: Any] = [
            .name: cookie.name,
            .value: cookie.value,
            .domain: cookieDomain,
            .path: cookiePath
        ]

        // Add expires if provided
        if let expiresString = cookie.expires,
           let expiresDate = Self.iso8601Formatter.date(from: expiresString) {
            properties[.expires] = expiresDate
        }

        // Add secure flag
        if cookie.secure == true {
            properties[.secure] = "TRUE"
        }

        // Note: HttpOnly is handled via the isHTTPOnly property, not in properties dict

        guard let httpCookie = HTTPCookie(properties: properties) else {
            throw NSError(domain: "NitroCookies", code: 1,
                         userInfo: [NSLocalizedDescriptionKey: "Failed to create HTTPCookie"])
        }

        return httpCookie
    }

    /**
     * Convert NSHTTPCookie to Cookie struct
     */
    private func createCookieData(from httpCookie: HTTPCookie) -> Cookie {
        let expiresString = httpCookie.expiresDate.map {
            Self.iso8601Formatter.string(from: $0)
        }

        return Cookie(
            name: httpCookie.name,
            value: httpCookie.value,
            path: httpCookie.path,
            domain: httpCookie.domain,
            version: String(httpCookie.version),
            expires: expiresString,
            secure: httpCookie.isSecure,
            httpOnly: httpCookie.isHTTPOnly
        )
    }

    /**
     * Check if cookie domain matches or is subdomain of URL host
     */
    private func isMatchingDomain(cookieDomain: String, urlHost: String) -> Bool {
        // Exact match
        if cookieDomain == urlHost {
            return true
        }

        // Wildcard match (.example.com matches api.example.com)
        if cookieDomain.hasPrefix(".") {
            let domain = String(cookieDomain.dropFirst())
            return urlHost.hasSuffix(domain) || urlHost == domain
        }

        // Subdomain match (example.com matches api.example.com)
        return urlHost.hasSuffix("." + cookieDomain)
    }

    /**
     * Validate that cookie domain matches URL host
     */
    private func validateDomain(cookie: Cookie, url: URL) throws {
        guard let host = url.host else {
            throw NSError(domain: "INVALID_URL", code: 1,
                         userInfo: [NSLocalizedDescriptionKey: "URL has no host"])
        }

        let cookieDomain = cookie.domain ?? host

        if !isMatchingDomain(cookieDomain: cookieDomain, urlHost: host) {
            throw NSError(domain: "DOMAIN_MISMATCH", code: 2,
                         userInfo: [NSLocalizedDescriptionKey:
                            "Cookie domain '\(cookieDomain)' does not match URL host '\(host)'"])
        }
    }

    /**
     * Validate URL has protocol (http:// or https://)
     */
    private func validateURL(_ urlString: String) throws -> URL {
        guard let url = URL(string: urlString),
              let scheme = url.scheme,
              (scheme == "http" || scheme == "https") else {
            throw NSError(domain: "INVALID_URL", code: 1,
                         userInfo: [NSLocalizedDescriptionKey:
                            "Invalid URL: '\(urlString)'. URLs must include protocol (http:// or https://)"])
        }
        return url
    }

    // MARK: - Main Cookie Operations

    /**
     * Set a single cookie
     */
    public func set(url urlString: String, cookie: Cookie, useWebKit: Bool?) throws -> Promise<Bool> {
        return Promise.async {
            let url = try self.validateURL(urlString)
            try self.validateDomain(cookie: cookie, url: url)

            // Apply defaults
            var cookieWithDefaults = cookie
            if cookieWithDefaults.path == nil {
                cookieWithDefaults.path = "/"
            }
            if cookieWithDefaults.domain == nil {
                cookieWithDefaults.domain = url.host
            }

            let httpCookie = try self.makeHTTPCookie(from: cookieWithDefaults, url: url)

            if useWebKit == true {
                // Use WKHTTPCookieStore
                if #available(iOS 11.0, *) {
                    return await MainActor.run {
                        let store = WKWebsiteDataStore.default().httpCookieStore
                        return await withCheckedContinuation { continuation in
                            store.setCookie(httpCookie) {
                                continuation.resume(returning: true)
                            }
                        }
                    }
                } else {
                    throw NSError(domain: "WEBKIT_UNAVAILABLE", code: 3,
                                 userInfo: [NSLocalizedDescriptionKey:
                                    "WebKit requires iOS 11 or higher"])
                }
            } else {
                // Use NSHTTPCookieStorage
                HTTPCookieStorage.shared.setCookie(httpCookie)
                return true
            }
        }
    }

    /**
     * Get all cookies for a URL
     */
    public func get(url urlString: String, useWebKit: Bool?) throws -> Promise<[Cookie]> {
        return Promise.async {
            let url = try self.validateURL(urlString)

            if useWebKit == true {
                if #available(iOS 11.0, *) {
                    return await MainActor.run {
                        let store = WKWebsiteDataStore.default().httpCookieStore
                        return await withCheckedContinuation { continuation in
                            store.getAllCookies { cookies in
                                let filteredCookies = cookies.filter { cookie in
                                    self.isMatchingDomain(cookieDomain: cookie.domain,
                                                         urlHost: url.host ?? "")
                                }
                                continuation.resume(returning: filteredCookies.map { self.createCookieData(from: $0) })
                            }
                        }
                    }
                } else {
                    throw NSError(domain: "WEBKIT_UNAVAILABLE", code: 3,
                                 userInfo: [NSLocalizedDescriptionKey:
                                    "WebKit requires iOS 11 or higher"])
                }
            } else {
                let allCookies = HTTPCookieStorage.shared.cookies ?? []
                let filteredCookies = allCookies.filter { cookie in
                    self.isMatchingDomain(cookieDomain: cookie.domain,
                                         urlHost: url.host ?? "")
                }
                return filteredCookies.map { self.createCookieData(from: $0) }
            }
        }
    }

    /**
     * Clear all cookies
     */
    public func clearAll(useWebKit: Bool?) throws -> Promise<Bool> {
        return Promise.async {
            if useWebKit == true {
                if #available(iOS 11.0, *) {
                    return await MainActor.run {
                        let store = WKWebsiteDataStore.default().httpCookieStore
                        return await withCheckedContinuation { continuation in
                            store.getAllCookies { cookies in
                                Task {
                                    for cookie in cookies {
                                        await withCheckedContinuation { (innerContinuation: CheckedContinuation<Void, Never>) in
                                            store.delete(cookie) {
                                                innerContinuation.resume(returning: ())
                                            }
                                        }
                                    }
                                    continuation.resume(returning: true)
                                }
                            }
                        }
                    }
                } else {
                    throw NSError(domain: "WEBKIT_UNAVAILABLE", code: 3,
                                  userInfo: [NSLocalizedDescriptionKey:
                                    "WebKit requires iOS 11 or higher"])
                }
            } else {
                let storage = HTTPCookieStorage.shared
                let cookies = storage.cookies ?? []
                for cookie in cookies {
                    storage.deleteCookie(cookie)
                }
                return true
            }
        }
    }

    /**
     * Parse and set cookies from Set-Cookie header
     */
    public func setFromResponse(url urlString: String, value: String) throws -> Promise<Bool> {
        return Promise.async {
            let url = try self.validateURL(urlString)
            let headerFields = ["Set-Cookie": value]
            let cookies = HTTPCookie.cookies(withResponseHeaderFields: headerFields, for: url)

            let storage = HTTPCookieStorage.shared
            for cookie in cookies {
                storage.setCookie(cookie)
            }
            return true
        }
    }

    /**
     * Make HTTP request and get cookies from response
     */
    public func getFromResponse(url urlString: String) throws -> Promise<[Cookie]> {
        return Promise.async {
            let url = try self.validateURL(urlString)

            let (_, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw NSError(domain: "NETWORK_ERROR", code: 4,
                              userInfo: [NSLocalizedDescriptionKey: "Not HTTP response"])
            }

            let cookies = HTTPCookie.cookies(
                withResponseHeaderFields: httpResponse.allHeaderFields as! [String: String],
                for: url
            )

            return cookies.map { self.createCookieData(from: $0) }
        }
    }

    /**
     * Get all cookies regardless of domain (iOS only)
     */
    public func getAll(useWebKit: Bool?) throws -> Promise<[Cookie]> {
        return Promise.async {
            if useWebKit == true {
                if #available(iOS 11.0, *) {
                    return await MainActor.run {
                        let store = WKWebsiteDataStore.default().httpCookieStore
                        return await withCheckedContinuation { continuation in
                            store.getAllCookies { cookies in
                                continuation.resume(returning: cookies.map { self.createCookieData(from: $0) })
                            }
                        }
                    }
                } else {
                    throw NSError(domain: "WEBKIT_UNAVAILABLE", code: 3,
                                  userInfo: [NSLocalizedDescriptionKey:
                                    "WebKit requires iOS 11 or higher"])
                }
            } else {
                let cookies = HTTPCookieStorage.shared.cookies ?? []
                return cookies.map { self.createCookieData(from: $0) }
            }
        }
    }

    /**
     * Clear specific cookie by name (iOS only)
     */
    public func clearByName(url urlString: String, name: String, useWebKit: Bool?) throws -> Promise<Bool> {
        return Promise.async {
            let url = try self.validateURL(urlString)

            if useWebKit == true {
                if #available(iOS 11.0, *) {
                    return await MainActor.run {
                        let store = WKWebsiteDataStore.default().httpCookieStore
                        return await withCheckedContinuation { continuation in
                            store.getAllCookies { cookies in
                                let matchingCookie = cookies.first { cookie in
                                    cookie.name == name &&
                                    self.isMatchingDomain(cookieDomain: cookie.domain,
                                                         urlHost: url.host ?? "")
                                }

                                if let cookie = matchingCookie {
                                    store.delete(cookie) {
                                        continuation.resume(returning: true)
                                    }
                                } else {
                                    continuation.resume(returning: false)
                                }
                            }
                        }
                    }
                } else {
                    throw NSError(domain: "WEBKIT_UNAVAILABLE", code: 3,
                                 userInfo: [NSLocalizedDescriptionKey:
                                    "WebKit requires iOS 11 or higher"])
                }
            } else {
                let storage = HTTPCookieStorage.shared
                let cookies = storage.cookies ?? []
                let matchingCookie = cookies.first { cookie in
                    cookie.name == name &&
                    self.isMatchingDomain(cookieDomain: cookie.domain,
                                         urlHost: url.host ?? "")
                }

                if let cookie = matchingCookie {
                    storage.deleteCookie(cookie)
                    return true
                } else {
                    return false
                }
            }
        }
    }

    /**
     * Flush cookies (Android only - no-op on iOS)
     */
    public func flush() throws -> Promise<Void> {
        return Promise.async {
            throw NSError(domain: "PLATFORM_UNSUPPORTED", code: 5,
                          userInfo: [NSLocalizedDescriptionKey:
                            "flush() is only available on Android"])
        }
    }

    /**
     * Remove session cookies (Android only - no-op on iOS)
     */
    public func removeSessionCookies() throws -> Promise<Bool> {
        return Promise.async {
            throw NSError(domain: "PLATFORM_UNSUPPORTED", code: 5,
                          userInfo: [NSLocalizedDescriptionKey:
                            "removeSessionCookies() is only available on Android"])
        }
    }
}
