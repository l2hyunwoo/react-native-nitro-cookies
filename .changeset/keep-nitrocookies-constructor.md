---
'react-native-nitro-cookies': patch
---

Keep the `NitroCookies` constructor in R8-minified Android release builds. Without it, apps crash at launch on Android 7.1 (API 25) with `NoSuchMethodError` when Nitro creates the HybridObject.
