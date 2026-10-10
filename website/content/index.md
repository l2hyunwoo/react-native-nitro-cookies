---
layout: home
title: Native cookies. One typed API.
titleTemplate: Nitro Cookies
---

<div class="cookie-home">
<a class="home-release" href="./start/installation.html">NEXT DOCUMENTATION · UNRELEASED APIS INCLUDED <span aria-hidden="true">↗</span></a>
<div class="hero-grid">
<div class="hero-copy">
<p class="eyebrow">NITRO COOKIES / REACT NATIVE</p>
<h1>Native cookies.<br><span>One typed API.</span></h1>
<p class="hero-description">Read, write, and manage native HTTP cookies. Use synchronous calls when you need a value now, or await WebKit and network operations.</p>
<div class="hero-actions">
<a class="primary-action" href="./start/installation.html">Get started <span aria-hidden="true">&nbsp;→</span></a>
<a class="secondary-action" href="./reference/">Explore the API</a>
</div>
<p class="platform-line">iOS &nbsp;/&nbsp; Android &nbsp;/&nbsp; tvOS<br>TypeScript · Native storage · MIT licensed</p>
</div>
<div class="hero-art" aria-hidden="true"><img src="/nitro-cookies.png" alt="" width="1254" height="1254" fetchpriority="high" decoding="async"></div>
</div>
<div class="principle-strip">
<div class="principle"><p class="eyebrow">01 / DIRECT</p><h2>Sync when you need it</h2><p>Read a stored value or build a request header with a direct JavaScript call.</p></div>
<div class="principle"><p class="eyebrow">02 / EXPLICIT</p><h2>Know your cookie store</h2><p>Choose Apple shared storage or the iOS WebKit store. Android uses CookieManager.</p></div>
<div class="principle"><p class="eyebrow">03 / TYPED</p><h2>Keep the scope in view</h2><p>Typed cookies, list results, and scoped deletion make domain and path choices explicit.</p></div>
</div>
<div class="example-grid">
<div class="example-copy"><p class="eyebrow">FROM JAVASCRIPT TO NATIVE</p><h2>A cookie store.<br>A familiar API.</h2><p>Write a session cookie, then build a header from stored cookies that match the request URL.</p><a href="./guides/request-headers.html">Read the request header guide →</a></div>
<div class="hero-code">
<div class="code-caption"><span>session.ts</span><span>JavaScript → native</span></div>

```ts
import NitroCookies from "react-native-nitro-cookies";

const url = "https://api.example.com";

await NitroCookies.set(url, {
  name: "session",
  value: "demo-token",
  path: "/",
  secure: true,
});

const header = NitroCookies.getCookieHeaderSync(url);
// After storage: session=demo-token
```

<div class="code-result"><b>Cookie</b> &nbsp; session=demo-token</div>
</div>
</div>
<div class="section-heading"><div><p class="eyebrow">THE DOCUMENTATION</p><h2>Start with what you need to do.</h2></div><p>From your first cookie to the details that matter in production.</p></div>
<div class="path-grid">
<a class="path-card" href="./start/first-cookie.html"><span class="path-number">01 &nbsp; GET STARTED</span><h3>Store your first cookie</h3><p>Install the native modules, rebuild your app, and verify a complete write and read.</p><span class="path-link">Follow the tutorial →</span></a>
<a class="path-card" href="./guides/webviews.html"><span class="path-number">02 &nbsp; BUILD A FLOW</span><h3>Connect a WebView</h3><p>Pick the right store and understand where your login cookie can be read.</p><span class="path-link">Read the guide →</span></a>
<a class="path-card" href="./reference/"><span class="path-number">03 &nbsp; LOOK IT UP</span><h3>Find an API</h3><p>Check signatures, return values, platform support, and errors in one place.</p><span class="path-link">Open the reference →</span></a>
</div>
<div class="home-note"><p>Different platforms have different cookie stores. <a href="./reference/platforms.html">Check platform support →</a></p><a href="https://github.com/l2hyunwoo/react-native-nitro-cookies">View the source on GitHub ↗</a></div>
</div>
