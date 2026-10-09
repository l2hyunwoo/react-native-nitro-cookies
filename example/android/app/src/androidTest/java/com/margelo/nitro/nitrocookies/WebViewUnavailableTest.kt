package com.margelo.nitro.nitrocookies

import android.webkit.WebView
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.SdkSuppress
import com.margelo.nitro.JNIOnLoad
import com.margelo.nitro.core.Promise
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assert.assertThrows
import org.junit.BeforeClass
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
@SdkSuppress(minSdkVersion = 28)
class WebViewUnavailableTest {
  private val cookies = NitroCookies()
  private val url = "https://example.com"
  private val cookie = Cookie("session", "value", "/", null, null, null, null, null)

  @Test
  fun synchronousOperationsThrowWhenWebViewIsUnavailable() {
    val operations = listOf<() -> Any>(
      { cookies.getSync(url) },
      { cookies.setSync(url, cookie) },
      { cookies.setFromResponseSync(url, "session=value") },
      { cookies.clearByNameSync(url, "session") },
      { cookies.getCookieHeaderSync(url) },
      { cookies.setManySync(url, arrayOf(cookie)) },
    )
    for (operation in operations) {
      assertUnavailable(assertThrows(Exception::class.java) { operation() })
    }
  }

  @Test
  fun asynchronousOperationsRejectWhenWebViewIsUnavailable() {
    val operations = listOf<() -> Promise<*>>(
      { cookies.set(url, cookie, false) },
      { cookies.setMany(url, arrayOf(cookie), false) },
      { cookies.getCookieHeader(url, false) },
      { cookies.get(url, false) },
      { cookies.setFromResponse(url, "session=value") },
      { cookies.clearByName(url, "session", false) },
      { cookies.flush() },
      { cookies.clearAll(false) },
      { cookies.removeSessionCookies() },
    )
    for (operation in operations) {
      val completed = CountDownLatch(1)
      var rejection: Throwable? = null
      operation().then { completed.countDown() }.catch {
        rejection = it
        completed.countDown()
      }
      assertTrue("Cookie operation did not settle", completed.await(10, TimeUnit.SECONDS))
      assertNotNull("Cookie operation resolved instead of rejecting", rejection)
      assertUnavailable(rejection!!)
    }
  }

  private fun assertUnavailable(error: Throwable) {
    assertTrue(error.message.orEmpty().startsWith("WEBVIEW_UNAVAILABLE:"))
    assertNotNull("The original initialization error must be preserved", error.cause)
  }

  companion object {
    @BeforeClass
    @JvmStatic
    fun disableWebView() {
      // Disable this test process only, without changing the device's WebView package.
      WebView.disableWebView()
      JNIOnLoad.initializeNativeNitro()
    }
  }
}
