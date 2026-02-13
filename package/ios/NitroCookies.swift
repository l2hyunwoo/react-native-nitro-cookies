import Foundation
import WebKit
import NitroModules

/**
 * HybridNitroCookies - iOS implementation of cookie management
 *
 * Provides high-performance cookie operations using NSHTTPCookieStorage
 * and WKHTTPCookieStore with Nitro Modules JSI architecture.
 */
public class HybridNitroCookies: HybridNitroCookiesSpec {

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

    /// RFC 1123 date formatter for Set-Cookie Expires attribute
    private static let rfc1123Formatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(abbreviation: "GMT")
        formatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
        return formatter
    }()

    /// Remove CR, LF, and NUL characters that could enable header injection
    private static func sanitizeCookieToken(_ value: String) -> String {
        var result = ""
        result.reserveCapacity(value.count)
        for scalar in value.unicodeScalars {
            if scalar != "\r" && scalar != "\n" && scalar != "\0" {
                result.append(String(scalar))
            }
        }
        return result
    }

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

        if let expiresString = cookie.expires,
           let expiresDate = Self.iso8601Formatter.date(from: expiresString) {
            properties[.expires] = expiresDate
        }

        if cookie.secure == true {
            properties[.secure] = "TRUE"
        }

        guard let httpCookie = HTTPCookie(properties: properties) else {
            throw NSError(domain: "NitroCookies", code: 1,
                         userInfo: [NSLocalizedDescriptionKey: "Failed to create HTTPCookie"])
        }

        // HTTPCookie(properties:) ignores httpOnly — there is no property key for it.
        // When httpOnly is requested, rebuild via Set-Cookie header parsing which
        // correctly handles the HttpOnly attribute, while preserving the original domain.
        if cookie.httpOnly == true {
            let originalDomain = httpCookie.domain
            let safeName = Self.sanitizeCookieToken(httpCookie.name)
            let safeValue = Self.sanitizeCookieToken(httpCookie.value)
            var parts: [String] = ["\(safeName)=\(safeValue)"]
            parts.append("Domain=\(originalDomain)")
            parts.append("Path=\(httpCookie.path)")
            if let expires = httpCookie.expiresDate {
                parts.append("Expires=\(Self.rfc1123Formatter.string(from: expires))")
            }
            if httpCookie.isSecure {
                parts.append("Secure")
            }
            parts.append("HttpOnly")

            let setCookieHeader = parts.joined(separator: "; ")
            let headerFields = ["Set-Cookie": setCookieHeader]
            let parsed = HTTPCookie.cookies(withResponseHeaderFields: headerFields, for: url)

            guard let httpOnlyCookie = parsed.first else {
                throw NSError(domain: "NitroCookies", code: 1,
                             userInfo: [NSLocalizedDescriptionKey: "Failed to create HTTPCookie with HttpOnly"])
            }
            return httpOnlyCookie
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

        // Strip leading dot from domain — NSHTTPCookieStorage and Set-Cookie
        // parsing add a dot prefix per RFC 6265, but callers expect the bare domain.
        var domain = httpCookie.domain
        if domain.hasPrefix(".") {
            domain = String(domain.dropFirst())
        }

        return Cookie(
            name: httpCookie.name,
            value: httpCookie.value,
            path: httpCookie.path,
            domain: domain,
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
            return urlHost.hasSuffix("." + domain) || urlHost == domain
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

    // MARK: - Synchronous Cookie Operations

    /**
     * Get cookies synchronously for a URL
     * Uses NSHTTPCookieStorage only (WebKit not supported for sync operations)
     */
    public func getSync(url urlString: String) throws -> [Cookie] {
        let url = try validateURL(urlString)
        let allCookies = HTTPCookieStorage.shared.cookies ?? []
        let filteredCookies = allCookies.filter { cookie in
            self.isMatchingDomain(cookieDomain: cookie.domain,
                                 urlHost: url.host ?? "")
        }
        return filteredCookies.map { self.createCookieData(from: $0) }
    }

    /**
     * Set a cookie synchronously
     * Uses NSHTTPCookieStorage only (WebKit not supported for sync operations)
     */
    public func setSync(url urlString: String, cookie: Cookie) throws -> Bool {
        let url = try validateURL(urlString)
        try validateDomain(cookie: cookie, url: url)

        // Apply defaults
        var cookieWithDefaults = cookie
        if cookieWithDefaults.path == nil {
            cookieWithDefaults.path = "/"
        }
        if cookieWithDefaults.domain == nil {
            cookieWithDefaults.domain = url.host
        }

        let httpCookie = try makeHTTPCookie(from: cookieWithDefaults, url: url)
        HTTPCookieStorage.shared.setCookie(httpCookie)
        return true
    }

    /**
     * Parse and set cookies from Set-Cookie header synchronously
     */
    public func setFromResponseSync(url urlString: String, value: String) throws -> Bool {
        let url = try validateURL(urlString)
        let headerFields = ["Set-Cookie": value]
        let cookies = HTTPCookie.cookies(withResponseHeaderFields: headerFields, for: url)

        let storage = HTTPCookieStorage.shared
        for cookie in cookies {
            storage.setCookie(cookie)
        }
        return true
    }

    /**
     * Clear a specific cookie by name synchronously
     */
    public func clearByNameSync(url urlString: String, name: String) throws -> Bool {
        let url = try validateURL(urlString)
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

    // MARK: - Asynchronous Cookie Operations

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
                    // Accessing WKWebsiteDataStore.default() inside MainActor.run is necessary for iOS 11-12 compatibility,
                    // since it is not marked @MainActor in those versions.
                    // For iOS 13+, WKWebsiteDataStore.default() is already @MainActor, so wrapping in MainActor.run is redundant.
                    // This workaround is safe for iOS 13+ and does not introduce any performance penalty or behavioral change,
                    // as MainActor.run is a no-op when already on the main actor. This ensures compatibility across all supported iOS versions.
                    let store = await MainActor.run {
                        WKWebsiteDataStore.default().httpCookieStore
                    }
                    await withCheckedContinuation { continuation in
                        store.setCookie(httpCookie) {
                            continuation.resume(returning: ())
                        }
                    }
                    return true
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
                    let store = await MainActor.run {
                        WKWebsiteDataStore.default().httpCookieStore
                    }
                    let httpCookies = await withCheckedContinuation { continuation in
                        store.getAllCookies { cookies in
                            continuation.resume(returning: cookies)
                        }
                    }
                    let filteredCookies = httpCookies.filter { cookie in
                        self.isMatchingDomain(cookieDomain: cookie.domain,
                                             urlHost: url.host ?? "")
                    }
                    return filteredCookies.map { self.createCookieData(from: $0) }
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
                    let store = await MainActor.run {
                        WKWebsiteDataStore.default().httpCookieStore
                    }
                    let cookies = await withCheckedContinuation { continuation in
                        store.getAllCookies { cookies in
                            continuation.resume(returning: cookies)
                        }
                    }
                    for cookie in cookies {
                        await withCheckedContinuation { continuation in
                            store.delete(cookie) {
                                continuation.resume(returning: ())
                            }
                        }
                    }
                    return true
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

            let headerFields = httpResponse.allHeaderFields as? [String: String] ?? [:]
            let cookies = HTTPCookie.cookies(withResponseHeaderFields: headerFields, for: url)

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
                    let store = await MainActor.run {
                        WKWebsiteDataStore.default().httpCookieStore
                    }
                    let cookies = await withCheckedContinuation { continuation in
                        store.getAllCookies { cookies in
                            continuation.resume(returning: cookies)
                        }
                    }
                    return cookies.map { self.createCookieData(from: $0) }
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
                    let store = await MainActor.run {
                        WKWebsiteDataStore.default().httpCookieStore
                    }
                    let cookies = await withCheckedContinuation { continuation in
                        store.getAllCookies { cookies in
                            continuation.resume(returning: cookies)
                        }
                    }
                    let matchingCookie = cookies.first { cookie in
                        cookie.name == name &&
                        self.isMatchingDomain(cookieDomain: cookie.domain,
                                             urlHost: url.host ?? "")
                    }

                    if let cookie = matchingCookie {
                        await withCheckedContinuation { continuation in
                            store.delete(cookie) {
                                continuation.resume(returning: ())
                            }
                        }
                        return true
                    } else {
                        return false
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
            // No-op on iOS - cookies are automatically persisted
        }
    }

    /**
     * Remove session cookies (Android only - no-op on iOS)
     */
    public func removeSessionCookies() throws -> Promise<Bool> {
        return Promise.async {
            return false
        }
    }
}
