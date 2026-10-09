package com.margelo.nitro.nitrocookies

import android.webkit.CookieManager
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.margelo.nitro.JNIOnLoad
import com.margelo.nitro.core.Promise
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import org.junit.Assert.*
import org.junit.Before
import org.junit.BeforeClass
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class CookieScopeTest {
  private val cookies = NitroCookies()
  private val url = "https://api.nitro-scope.example/admin"

  @Before
  fun clearStorage() {
    await(cookies.clearAll(false))
    CookieManager.getInstance().setAcceptCookie(true)
  }

  @Test
  fun listsPreserveDuplicatesWithoutInventingScope() {
    set("session=root; Path=/")
    set("session=admin; Path=/admin; Secure; HttpOnly")
    val sync = cookies.getListSync(url)
    val async = await(cookies.getList(url, false))
    for (list in listOf(sync, async)) {
      assertEquals(setOf("root", "admin"), list.map { it.value }.toSet())
      assertEquals(2, list.size)
      for (cookie in list) {
        assertEquals("session", cookie.name)
        assertNull(cookie.domain)
        assertNull(cookie.path)
        assertNull(cookie.secure)
        assertNull(cookie.httpOnly)
        assertNull(cookie.expires)
      }
    }
    assertTrue(cookies.getSync(url).all { it.domain == "api.nitro-scope.example" && it.path == "/" })
    val error = assertThrows(AssertionError::class.java) { await(cookies.getAllList(false)) }
    assertTrue(error.cause!!.message!!.startsWith("PLATFORM_UNSUPPORTED:"))
  }

  @Test
  fun deletingOnePathPreservesSiblingsAndIsIdempotent() {
    set("session=root; Path=/")
    set("session=admin; Path=/admin; Secure; HttpOnly")
    set("session=adjacent; Path=/administrator")
    await(cookies.clearCookie(url, CookieIdentifier("session", "/admin", null), false))
    assertEquals(listOf("root"), cookies.getListSync(url).map { it.value })
    assertEquals(setOf("root", "adjacent"), cookies.getListSync("https://api.nitro-scope.example/administrator").map { it.value }.toSet())
    await(cookies.clearCookie(url, CookieIdentifier("session", "/admin", null), false))
    assertEquals(listOf("root"), cookies.getListSync(url).map { it.value })
    cookies.clearCookieSync(url, CookieIdentifier("session", "/", null))
    await(cookies.flush())
    assertTrue(cookies.getListSync(url).isEmpty())
  }

  @Test
  fun deletingOneDomainPreservesOtherDomains() {
    set("session=parent; Domain=.nitro-scope.example; Path=/")
    set("session=child; Domain=api.nitro-scope.example; Path=/")
    set("session=host; Path=/")
    await(cookies.clearCookie(url, CookieIdentifier("session", "/", ".nitro-scope.example"), false))
    assertEquals(setOf("child", "host"), cookies.getListSync(url).map { it.value }.toSet())
    cookies.clearCookieSync(url, CookieIdentifier("session", "/", "api.nitro-scope.example"))
    await(cookies.flush())
    assertEquals(listOf("host"), cookies.getListSync(url).map { it.value })
    await(cookies.clearCookie(url, CookieIdentifier("session", "/", null), false))
    assertTrue(cookies.getListSync(url).isEmpty())
  }

  @Test
  fun deletionAcceptsSpacesInPaths() {
    set("session=root; Path=/")
    val identifier = CookieIdentifier("session", "/with space", null)
    cookies.clearCookieSync(url, identifier)
    await(cookies.flush())
    await(cookies.clearCookie(url, identifier, false))
    assertEquals(listOf("root"), cookies.getListSync(url).map { it.value })
  }

  @Test
  fun invalidSelectorsDoNotMutateStorage() {
    set("session=kept; Path=/")
    val identifiers = listOf(
      CookieIdentifier("session; injected=x", "/", null),
      CookieIdentifier("session", "/; Domain=elsewhere.example", null),
      CookieIdentifier("session", "relative", null),
      CookieIdentifier("session", "/", "elsewhere.example"),
      CookieIdentifier("session", "/", "..nitro-scope.example"),
      CookieIdentifier("session\r\n", "/", null),
    )
    for (identifier in identifiers) {
      assertThrows(Exception::class.java) { cookies.clearCookieSync(url, identifier) }
      assertThrows(AssertionError::class.java) { await(cookies.clearCookie(url, identifier, false)) }
    }
    assertThrows(Exception::class.java) { cookies.clearCookieSync("https:///", CookieIdentifier("session", "/", null)) }
    assertEquals(listOf("kept"), cookies.getListSync(url).map { it.value })
  }

  private fun set(header: String) {
    val completed = CountDownLatch(1)
    var accepted = false
    InstrumentationRegistry.getInstrumentation().runOnMainSync {
      CookieManager.getInstance().setCookie(url, header) {
        accepted = it
        completed.countDown()
      }
    }
    assertTrue(completed.await(10, TimeUnit.SECONDS))
    assertTrue("Cookie write rejected: $header", accepted)
  }

  private fun <T> await(promise: Promise<T>): T {
    val completed = CountDownLatch(1)
    var result: T? = null
    var error: Throwable? = null
    promise.then { result = it; completed.countDown() }.catch { error = it; completed.countDown() }
    assertTrue("Cookie operation did not settle", completed.await(10, TimeUnit.SECONDS))
    error?.let { throw AssertionError("Cookie operation rejected", it) }
    @Suppress("UNCHECKED_CAST")
    return result as T
  }

  companion object {
    @BeforeClass
    @JvmStatic
    fun loadNitro() { JNIOnLoad.initializeNativeNitro() }
  }
}
