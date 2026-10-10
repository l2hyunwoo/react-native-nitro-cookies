# WebView cookie store 사용하기

iOS에서 기본 WebKit cookie store에 접근하려면 `useWebKit` 인자에 `true`를 전달하세요.
WebView에서 페이지를 열기 전에 쿠키 저장이 끝날 때까지 기다리세요.

```ts
import NitroCookies from "react-native-nitro-cookies";

const url = "https://example.com";
await NitroCookies.set(
  url,
  {
    name: "session",
    value: "server-issued-token",
    secure: true,
    path: "/",
  },
  true,
);

const cookies = await NitroCookies.get(url, true);
```

`useWebKit`은 `set`의 세 번째 인자이자 `get`의 두 번째 인자이며, WebKit cookie store를 선택합니다. 생략하면 Apple shared cookie store를 사용합니다.
로그인 쿠키를 읽고 저장하고 삭제할 때는 같은 cookie store를 사용하세요.

## WebView 설정 시 확인할 점

이 패키지는 쿠키를 관리합니다. WebView를 생성하거나 설정하는 기능, store 사이에서 쿠키를 복사하는 기능, ephemeral WKWebsiteDataStore에 접근하는 기능은 제공하지 않습니다.
사용 중인 WebView 라이브러리에서 data store와 쿠키 옵션을 별도로 설정하세요.
Sync 메서드로는 WebKit cookie store에 접근할 수 없습니다.

## Android와 TV

Android에서는 항상 CookieManager를 사용합니다. `useWebKit` 인자로 Android의 다른 cookie store를 선택할 수는 없습니다.
WebView provider가 없거나, 비활성 상태이거나, 업데이트 중이면 cookie store 작업이 `WEBVIEW_UNAVAILABLE`로 실패할 수 있습니다.
일부 Android TV 기기에는 WebView provider가 없습니다. 이 오류를 감지하더라도 대신 사용할 cookie store를 제공하지는 않습니다.

tvOS는 shared cookie store를 지원하지만, 이 라이브러리에는 tvOS용 WebKit 구현이 없습니다.
`useWebKit: true`를 요청하면 `WEBKIT_UNAVAILABLE`로 실패합니다. tvOS에서는 기본 cookie store를 사용하세요.

여러 플랫폼에서 같은 코드를 사용하려면 먼저 [플랫폼 지원](../reference/platforms)을 확인하세요.
