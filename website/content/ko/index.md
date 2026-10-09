---
layout: home
title: Native 쿠키를 하나의 API로.
titleTemplate: Nitro Cookies
---

<div class="cookie-home">
<a class="home-release" href="./start/installation.html">NEXT 문서 · 아직 출시하지 않은 API 포함 <span aria-hidden="true">↗</span></a>
<div class="hero-grid">
<div class="hero-copy">
<p class="eyebrow">REACT NATIVE / NITRO MODULES</p>
<h1>Native 쿠키를<br><span>하나의 API로.</span></h1>
<p class="hero-description">Native HTTP 쿠키를 읽고 저장하고 관리하세요. 값이 바로 필요하면 sync API를, WebKit이나 네트워크 작업에는 async API를 사용하세요.</p>
<div class="hero-actions">
<a class="primary-action" href="./start/installation.html">시작하기 <span aria-hidden="true">&nbsp;→</span></a>
<a class="secondary-action" href="./reference/">API 살펴보기</a>
</div>
<p class="platform-line">iOS &nbsp;/&nbsp; Android &nbsp;/&nbsp; tvOS<br>TypeScript · Native cookie store · MIT 라이선스</p>
</div>
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
// 저장 결과가 반영되면: session=demo-token
```

<div class="code-result"><b>Cookie</b> &nbsp; session=demo-token</div>
</div>
</div>
<div class="principle-strip">
<div class="principle"><p class="eyebrow">01 / DIRECT</p><h2>필요할 때 바로 조회</h2><p>Sync JavaScript 호출로 저장된 쿠키를 읽거나 request header를 만듭니다.</p></div>
<div class="principle"><p class="eyebrow">02 / EXPLICIT</p><h2>Cookie store를 명확하게</h2><p>Apple shared cookie store와 iOS WebKit cookie store 중에서 선택하세요. Android는 CookieManager를 사용합니다.</p></div>
<div class="principle"><p class="eyebrow">03 / TYPED</p><h2>쿠키의 scope까지 확인</h2><p>TypeScript 타입으로 쿠키를 다루고, list API와 scope를 지정하는 삭제 API로 domain과 path를 구분하세요.</p></div>
</div>
<div class="section-heading"><div><p class="eyebrow">문서 둘러보기</p><h2>지금 필요한 작업부터 시작하세요.</h2></div><p>첫 쿠키를 저장하는 방법부터 실제 앱에서 확인해야 할 동작까지 안내합니다.</p></div>
<div class="path-grid">
<a class="path-card" href="./start/first-cookie.html"><span class="path-number">01 &nbsp; 시작하기</span><h3>첫 쿠키 저장하기</h3><p>Native module을 설치하고 앱을 다시 빌드한 뒤, 쿠키가 저장되고 조회되는지 확인하세요.</p><span class="path-link">튜토리얼 따라 하기 →</span></a>
<a class="path-card" href="./guides/webviews.html"><span class="path-number">02 &nbsp; 기능 구현</span><h3>WebView에서 쿠키 사용하기</h3><p>Cookie store를 선택하고 로그인 쿠키를 어디서 읽을 수 있는지 확인하세요.</p><span class="path-link">가이드 읽기 →</span></a>
<a class="path-card" href="./reference/"><span class="path-number">03 &nbsp; 찾아보기</span><h3>API 확인하기</h3><p>메서드 signature, 반환값, 지원 플랫폼, 오류를 한곳에서 확인하세요.</p><span class="path-link">API Reference 열기 →</span></a>
</div>
<div class="home-note"><p>Cookie store는 플랫폼마다 다릅니다. <a href="./reference/platforms.html">지원 플랫폼 확인 →</a></p><a href="https://github.com/l2hyunwoo/react-native-nitro-cookies">GitHub에서 소스 보기 ↗</a></div>
</div>
