# Cookie store와 scope

쿠키를 구분하려면 저장된 cookie store와 scope를 알아야 합니다. 이름만으로는 쿠키 하나를 특정할 수 없습니다.
로그인 상태를 공유하거나 쿠키를 삭제하기 전에 두 개념을 확인하세요.

## Cookie store 선택

| 플랫폼  | 기본 cookie store              | `useWebKit: true`                                          |
| ------- | ------------------------------ | ---------------------------------------------------------- |
| iOS     | `HTTPCookieStorage.shared`     | `WKWebsiteDataStore.default().httpCookieStore`             |
| tvOS    | `HTTPCookieStorage.shared`     | `WEBKIT_UNAVAILABLE`로 실패                                |
| Android | `android.webkit.CookieManager` | 같은 CookieManager 사용. 이 인자는 동작에 영향을 주지 않음 |

Sync 메서드는 기본 cookie store를 사용합니다. iOS WebKit cookie store에 접근하려면 async 메서드를 사용해야 합니다.
Cookie store를 선택하는 것만으로는 다른 store와 쿠키가 자동으로 동기화되지 않습니다. 네트워크 라이브러리의 설정도 바뀌지 않습니다.
Ephemeral WKWebView는 별도의 data store를 사용하므로 이 API가 접근하는 기본 WebKit cookie store와 다릅니다.

## Name, domain, path로 쿠키 구분

`/`의 `session`과 `/admin`의 `session`은 함께 저장할 수 있습니다. 상위 domain의 쿠키와 host-only 쿠키도 함께 존재할 수 있습니다.
Apple의 list 결과에서는 `domain` 앞의 점으로 domain 쿠키와 host-only 쿠키를 구분합니다.

같은 이름의 쿠키를 모두 유지하려면 `getList`를 사용하세요. `get`은 dictionary를 만들면서 같은 이름의 쿠키 중 native 결과에서 마지막에 나온 항목만 남깁니다.
Native 결과의 순서를 앱에서 사용할 쿠키의 우선순위로 해석하지 마세요.

Android는 저장된 쿠키 객체 전체가 아니라 요청에 사용할 `Cookie` header를 반환합니다. 따라서 URL로 조회한 list에는 `name`과 `value`만 있으며, 확인할 수 없는 scope 필드는 생략합니다.
기존 Android dictionary API가 반환하는 `domain`과 `/` path는 요청 URL을 기준으로 만든 값입니다. 쿠키를 처음 저장한 scope로 간주하면 안 됩니다.

## 조회 결과와 request header의 차이

Apple의 `get`, `getList`와 각각의 sync 메서드는 기존 domain 선택 규칙을 사용합니다.
이 조회 API들은 `getCookieHeader`가 적용하는 요청 path, Secure, 만료 조건을 모두 적용하지는 않습니다.
Android의 URL 조회는 CookieManager의 URL 선택 규칙을 따릅니다.

실제 요청에 쿠키를 보낼 때는 [request header API](../guides/request-headers)를 사용하세요.
쿠키의 식별 정보를 확인하거나 [scope를 지정해 삭제](../guides/scoped-deletion)하려면 list API를 사용하세요.

## Secure와 HttpOnly

`secure`는 HTTPS 요청에만 쿠키를 보내도록 제한합니다. `httpOnly`는 브라우저의 JavaScript가 쿠키에 접근하지 못하게 하는 flag입니다.
Native cookie API로는 HttpOnly 쿠키의 값을 React Native 코드에서 읽을 수 있습니다. 두 flag는 쿠키를 암호화하거나 별도의 보안 저장소에 보관하는 기능을 제공하지 않습니다.
인증 값은 로그나 진단 데이터에 남기지 마세요.
