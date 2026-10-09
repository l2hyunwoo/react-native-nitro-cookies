# WebView 저장소 사용

iOS에서는 `true`를 전달해 기본 WebKit 쿠키 저장소에 접근합니다.
WebView를 이동시키기 전에 저장이 끝날 때까지 기다리세요.

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

세 번째 인자는 두 작업 모두에서 WebKit 저장소를 선택합니다. 생략하면 Apple 공유 저장소를 사용합니다.
로그인 쿠키를 읽고 저장하고 삭제할 때 같은 저장소를 사용하세요.

## 통합 범위

이 패키지는 쿠키를 관리합니다. WebView를 만들거나 설정하지 않으며, 저장소 간 쿠키 복사나 임시 WKWebsiteDataStore 접근도 제공하지 않습니다.
사용 중인 WebView 라이브러리의 데이터 저장소와 쿠키 옵션은 별도로 설정하세요.
동기 메서드로는 WebKit 저장소에 접근할 수 없습니다.

## Android와 TV

Android 작업은 항상 CookieManager를 사용합니다. `useWebKit` 인자로 다른 Android 저장소를 선택할 수는 없습니다.
WebView 제공자가 없거나 비활성화되었거나 업데이트 중이면 저장소 작업이 `WEBVIEW_UNAVAILABLE`로 실패할 수 있습니다.
일부 Android TV 기기에는 제공자가 없습니다. 오류를 식별하는 기능이 대체 쿠키 저장소를 제공하는 것은 아닙니다.

tvOS는 공유 저장소를 지원하지만, 이 라이브러리의 WebKit 구현은 제공하지 않습니다.
`true`를 전달하면 `WEBKIT_UNAVAILABLE`로 거부합니다. tvOS에서는 기본 저장소를 사용하세요.

여러 기기에서 코드를 공유하기 전에 [플랫폼 지원](../reference/platforms)을 확인하세요.
