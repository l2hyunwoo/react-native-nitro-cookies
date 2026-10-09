---
layout: home
title: 네이티브 쿠키를 하나의 API로.
titleTemplate: Nitro Cookies
---

<div class="cookie-home">
<a class="home-release" href="./start/installation.html">NEXT 문서 · 미출시 API 포함 <span aria-hidden="true">↗</span></a>
<div class="hero-grid">
<div class="hero-copy">
<p class="eyebrow">REACT NATIVE / NITRO MODULES</p>
<h1>네이티브 쿠키를<br><span>하나의 API로.</span></h1>
<p class="hero-description">네이티브 HTTP 쿠키를 읽고 저장하고 관리하세요. 즉시 값이 필요할 때는 동기 API를, WebKit과 네트워크 작업에는 비동기 API를 사용합니다.</p>
<div class="hero-actions">
<a class="primary-action" href="./start/installation.html">시작하기 <span aria-hidden="true">&nbsp;→</span></a>
<a class="secondary-action" href="./reference/">API 살펴보기</a>
</div>
<p class="platform-line">iOS &nbsp;/&nbsp; Android &nbsp;/&nbsp; tvOS<br>TypeScript · 네이티브 저장소 · MIT 라이선스</p>
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
// After storage: session=demo-token
```

<div class="code-result"><b>Cookie</b> &nbsp; session=demo-token</div>
</div>
</div>
<div class="principle-strip">
<div class="principle"><p class="eyebrow">01 / DIRECT</p><h2>필요할 때 바로 조회</h2><p>동기 JavaScript 호출로 저장된 쿠키를 읽거나 요청 헤더를 만듭니다.</p></div>
<div class="principle"><p class="eyebrow">02 / EXPLICIT</p><h2>사용할 저장소를 명확하게</h2><p>Apple 공유 저장소와 iOS WebKit 저장소를 선택합니다. Android는 CookieManager를 사용합니다.</p></div>
<div class="principle"><p class="eyebrow">03 / TYPED</p><h2>쿠키 범위를 확인하며 관리</h2><p>타입이 있는 쿠키, 목록 조회, 범위 삭제 API로 도메인과 경로를 명시합니다.</p></div>
</div>
<div class="section-heading"><div><p class="eyebrow">THE DOCUMENTATION</p><h2>지금 필요한 작업부터 시작하세요.</h2></div><p>첫 쿠키 저장부터 실제 앱에서 필요한 세부 동작까지 안내합니다.</p></div>
<div class="path-grid">
<a class="path-card" href="./start/first-cookie.html"><span class="path-number">01 &nbsp; 시작하기</span><h3>첫 쿠키 저장하기</h3><p>네이티브 모듈을 설치하고 앱을 다시 빌드한 뒤, 쿠키 저장과 조회를 확인합니다.</p><span class="path-link">튜토리얼 따라 하기 →</span></a>
<a class="path-card" href="./guides/webviews.html"><span class="path-number">02 &nbsp; 기능 구현</span><h3>WebView 연결하기</h3><p>저장소를 선택하고 로그인 쿠키를 어느 곳에서 읽을 수 있는지 확인합니다.</p><span class="path-link">가이드 읽기 →</span></a>
<a class="path-card" href="./reference/"><span class="path-number">03 &nbsp; 찾아보기</span><h3>API 확인하기</h3><p>메서드 시그니처, 반환값, 플랫폼 지원 범위, 오류를 한곳에서 확인합니다.</p><span class="path-link">참조 문서 열기 →</span></a>
</div>
<div class="home-note"><p>플랫폼마다 쿠키 저장소가 다릅니다. <a href="./reference/platforms.html">플랫폼 지원 확인 →</a></p><a href="https://github.com/l2hyunwoo/react-native-nitro-cookies">GitHub에서 소스 보기 ↗</a></div>
</div>
