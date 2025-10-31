package com.margelo.nitro.nitrocookies
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class NitroCookies : HybridNitroCookiesSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
