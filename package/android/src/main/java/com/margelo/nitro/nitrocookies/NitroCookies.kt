package com.margelo.nitro.nitrocookies

import android.webkit.CookieManager
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.Promise
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/** HybridNitroCookies - Android implementation of cookie management */
@DoNotStrip
class NitroCookies : HybridNitroCookiesSpec() {

  /** Convert Cookie struct to Set-Cookie header string */
  private fun toRFC6265String(cookie: Cookie): String {
    val parts = mutableListOf<String>()

    // Name=Value (required)
    parts.add("${cookie.name}=${cookie.value}")

    // Path attribute
    cookie.path?.let { parts.add("Path=$it") }

    // Domain attribute
    cookie.domain?.let { parts.add("Domain=$it") }

    // Expires attribute (convert ISO 8601 to RFC 1123)
    cookie.expires?.let { expiresISO ->
      try {
        val date = iso8601Formatter.parse(expiresISO)
        date?.let {
          val expiresRFC = rfc1123Formatter.format(it)
          parts.add("Expires=$expiresRFC")
        }
      } catch (e: Exception) {
        // Invalid date format, skip expires
      }
    }

    // Secure flag
    if (cookie.secure == true) {
      parts.add("Secure")
    }

    // HttpOnly flag
    if (cookie.httpOnly == true) {
      parts.add("HttpOnly")
    }

    return parts.joinToString("; ")
  }

  /** Parse a Set-Cookie header string into Cookie struct */
  private fun createCookieData(setCookieHeader: String, url: URL): Cookie? {
    val parts = setCookieHeader.split(";").map { it.trim() }
    if (parts.isEmpty()) return null

    // First part is name=value
    val nameValue = parts[0].split("=", limit = 2)
    if (nameValue.size != 2) return null

    val name = nameValue[0].trim()
    val value = nameValue[1].trim()

    var path: String? = null
    var domain: String? = null
    var expires: String? = null
    var secure: Boolean? = null
    var httpOnly: Boolean? = null

    // Parse attributes
    for (i in 1 until parts.size) {
      val part = parts[i]
      when {
        part.startsWith("Path=", ignoreCase = true) -> {
          path = part.substring(5).trim()
        }

        part.startsWith("Domain=", ignoreCase = true) -> {
          domain = part.substring(7).trim()
        }

        part.startsWith("Expires=", ignoreCase = true) -> {
          val expiresRFC = part.substring(8).trim()
          try {
            val date = rfc1123Formatter.parse(expiresRFC)
            date?.let { expires = iso8601Formatter.format(it) }
          } catch (e: Exception) {
            // Invalid date, skip
          }
        }

        part.equals("Secure", ignoreCase = true) -> {
          secure = true
        }

        part.equals("HttpOnly", ignoreCase = true) -> {
          httpOnly = true
        }
      }
    }

    // Apply defaults
    if (path == null) path = "/"
    if (domain == null) domain = url.host

    return Cookie(
      name = name,
      value = value,
      path = path,
      domain = domain,
      version = null,
      expires = expires,
      secure = secure,
      httpOnly = httpOnly
    )
  }

  /** Check if cookie domain matches or is subdomain of URL host Similar to iOS isMatchingDomain */
  private fun isMatchingDomain(cookieDomain: String, urlHost: String): Boolean {
    // Exact match
    if (cookieDomain == urlHost) {
      return true
    }

    // Wildcard match (.example.com matches api.example.com)
    if (cookieDomain.startsWith(".")) {
      val domain = cookieDomain.substring(1)
      return urlHost.endsWith(domain) || urlHost == domain
    }

    // Subdomain match (example.com matches api.example.com)
    return urlHost.endsWith(".$cookieDomain")
  }

  /** Validate that cookie domain matches URL host */
  private fun validateDomain(cookie: Cookie, url: URL) {
    val host = url.host ?: throw Exception("INVALID_URL: URL has no host")
    val cookieDomain = cookie.domain ?: host

    if (!isMatchingDomain(cookieDomain, host)) {
      throw Exception(
        "DOMAIN_MISMATCH: Cookie domain '$cookieDomain' does not match URL host '$host'"
      )
    }
  }

  /** Validate URL has protocol (http:// or https://) */
  private fun validateURL(urlString: String): URL {
    val url =
      try {
        URL(urlString)
      } catch (e: Exception) {
        throw Exception(
          "INVALID_URL: Invalid URL: '$urlString'. URLs must include protocol (http:// or https://)"
        )
      }

    if (url.protocol != "http" && url.protocol != "https") {
      throw Exception(
        "INVALID_URL: Invalid URL: '$urlString'. URLs must include protocol (http:// or https://)"
      )
    }

    return url
  }

  // MARK: - Synchronous Cookie Operations

  /** Get cookies synchronously for a URL */
  override fun getSync(url: String): Array<Cookie> {
    val urlObj = validateURL(url)
    val cookieManager = CookieManager.getInstance()
    val cookieString = cookieManager.getCookie(url)

    if (cookieString.isNullOrEmpty()) {
      return emptyArray()
    }

    // Parse cookie string (format: "name1=value1; name2=value2")
    val cookies = mutableListOf<Cookie>()
    val cookiePairs = cookieString.split(";").map { it.trim() }

    for (pair in cookiePairs) {
      val nameValue = pair.split("=", limit = 2)
      if (nameValue.size == 2) {
        cookies.add(
          Cookie(
            name = nameValue[0].trim(),
            value = nameValue[1].trim(),
            path = "/",
            domain = urlObj.host,
            version = null,
            expires = null,
            secure = null,
            httpOnly = null
          )
        )
      }
    }

    return cookies.toTypedArray()
  }

  /** Set a cookie synchronously */
  override fun setSync(url: String, cookie: Cookie): Boolean {
    val urlObj = validateURL(url)
    validateDomain(cookie, urlObj)

    // Apply defaults
    val cookieWithDefaults =
      cookie.copy(path = cookie.path ?: "/", domain = cookie.domain ?: urlObj.host)

    val cookieManager = CookieManager.getInstance()
    cookieManager.setAcceptCookie(true)

    val setCookieString = toRFC6265String(cookieWithDefaults)
    cookieManager.setCookie(url, setCookieString)

    return true
  }

  /** Parse and set cookies from Set-Cookie header synchronously */
  override fun setFromResponseSync(url: String, value: String): Boolean {
    val urlObj = validateURL(url)
    val cookieManager = CookieManager.getInstance()
    cookieManager.setAcceptCookie(true)

    // Set-Cookie header can contain multiple cookies
    val setCookieHeaders = value.split("\n").map { it.trim() }
    for (header in setCookieHeaders) {
      if (header.isNotEmpty()) {
        cookieManager.setCookie(url, header)
      }
    }

    return true
  }

  /** Clear a specific cookie by name synchronously */
  override fun clearByNameSync(url: String, name: String): Boolean {
    val urlObj = validateURL(url)
    val cookieManager = CookieManager.getInstance()

    // Android CookieManager doesn't support removing specific cookies by name
    // We can only expire them by setting a past expiration date
    val expiredCookie =
      "$name=; Path=/; Domain=${urlObj.host}; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    cookieManager.setCookie(url, expiredCookie)

    return true
  }

  // MARK: - Asynchronous Cookie Operations

  /** Set a single cookie */
  override fun set(url: String, cookie: Cookie, useWebKit: Boolean?): Promise<Boolean> {
    return Promise.async {
      val urlObj = validateURL(url)
      validateDomain(cookie, urlObj)

      // Apply defaults
      val cookieWithDefaults =
        cookie.copy(path = cookie.path ?: "/", domain = cookie.domain ?: urlObj.host)

      val cookieManager = CookieManager.getInstance()
      cookieManager.setAcceptCookie(true)

      val setCookieString = toRFC6265String(cookieWithDefaults)
      cookieManager.setCookie(url, setCookieString)

      true
    }
  }

  /** Get all cookies for a URL */
  override fun get(url: String, useWebKit: Boolean?): Promise<Array<Cookie>> {
    return Promise.async {
      val urlObj = validateURL(url)
      val cookieManager = CookieManager.getInstance()
      val cookieString = cookieManager.getCookie(url)

      if (cookieString.isNullOrEmpty()) {
        return@async emptyArray()
      }

      // Parse cookie string (format: "name1=value1; name2=value2")
      val cookies = mutableListOf<Cookie>()
      val cookiePairs = cookieString.split(";").map { it.trim() }

      for (pair in cookiePairs) {
        val nameValue = pair.split("=", limit = 2)
        if (nameValue.size == 2) {
          cookies.add(
            Cookie(
              name = nameValue[0].trim(),
              value = nameValue[1].trim(),
              path = "/",
              domain = urlObj.host,
              version = null,
              expires = null,
              secure = null,
              httpOnly = null
            )
          )
        }
      }

      cookies.toTypedArray()
    }
  }

  /** Clear all cookies */
  override fun clearAll(useWebKit: Boolean?): Promise<Boolean> {
    return Promise.async {
      val cookieManager = CookieManager.getInstance()
      suspendCoroutine { continuation ->
        cookieManager.removeAllCookies { success -> continuation.resume(success) }
      }
    }
  }

  /** Parse and set cookies from Set-Cookie header */
  override fun setFromResponse(url: String, value: String): Promise<Boolean> {
    return Promise.async {
      val urlObj = validateURL(url)
      val cookieManager = CookieManager.getInstance()
      cookieManager.setAcceptCookie(true)

      // Set-Cookie header can contain multiple cookies
      val setCookieHeaders = value.split("\n").map { it.trim() }
      for (header in setCookieHeaders) {
        if (header.isNotEmpty()) {
          cookieManager.setCookie(url, header)
        }
      }

      true
    }
  }

  /** Make HTTP request and get cookies from response */
  override fun getFromResponse(url: String): Promise<Array<Cookie>> {
    return Promise.async {
      try {
        val urlObj = validateURL(url)
        val connection = urlObj.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        connection.connect()

        val cookies = mutableListOf<Cookie>()
        val setCookieHeaders = connection.headerFields["Set-Cookie"] ?: emptyList()

        for (header in setCookieHeaders) {
          val cookie = createCookieData(header, urlObj)
          cookie?.let { cookies.add(it) }
        }

        connection.disconnect()
        cookies.toTypedArray()
      } catch (e: Exception) {
        throw Exception("NETWORK_ERROR: ${e.message}")
      }
    }
  }

  /** Get all cookies regardless of domain (iOS only - not supported on Android) */
  override fun getAll(useWebKit: Boolean?): Promise<Array<Cookie>> {
    return Promise.async {
      throw Exception("PLATFORM_UNSUPPORTED: getAll() is only available on iOS")
    }
  }

  /** Clear specific cookie by name (iOS only - not fully supported on Android) */
  override fun clearByName(url: String, name: String, useWebKit: Boolean?): Promise<Boolean> {
    return Promise.async {
      val urlObj = validateURL(url)
      val cookieManager = CookieManager.getInstance()

      // Android CookieManager doesn't support removing specific cookies by name
      // We can only expire them by setting a past expiration date
      val expiredCookie =
        "$name=; Path=/; Domain=${urlObj.host}; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
      cookieManager.setCookie(url, expiredCookie)

      true
    }
  }

  /** Flush cookies to persistent storage (Android only) */
  override fun flush(): Promise<Unit> {
    return Promise.async {
      val cookieManager = CookieManager.getInstance()
      cookieManager.flush()
      Unit
    }
  }

  /** Remove session cookies (Android only) */
  override fun removeSessionCookies(): Promise<Boolean> {
    return Promise.async {
      val cookieManager = CookieManager.getInstance()
      suspendCoroutine { continuation ->
        cookieManager.removeSessionCookies { success -> continuation.resume(success) }
      }
    }
  }

  companion object {
    /** ISO 8601 date formatter for cookie expires (yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ) */
    private val iso8601Formatter =
      SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
      }

    /** RFC 1123 date formatter for Set-Cookie headers (EEE, dd MMM yyyy HH:mm:ss z) */
    private val rfc1123Formatter =
      SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("GMT")
      }
  }
}
