# 저장소와 범위

쿠키는 네이티브 저장소와 범위에 속합니다. 이름만으로 쿠키를 고유하게 식별할 수는 없습니다.
로그인 상태를 공유하거나 쿠키를 삭제하기 전에 두 개념을 확인하세요.

## 저장소 선택

| 플랫폼  | 기본 저장소                    | `useWebKit: true`                              |
| ------- | ------------------------------ | ---------------------------------------------- |
| iOS     | `HTTPCookieStorage.shared`     | `WKWebsiteDataStore.default().httpCookieStore` |
| tvOS    | `HTTPCookieStorage.shared`     | `WEBKIT_UNAVAILABLE`로 거부                    |
| Android | `android.webkit.CookieManager` | 같은 CookieManager 사용. 플래그는 영향 없음    |

동기 메서드는 기본 저장소를 사용합니다. iOS WebKit 저장소에는 비동기 메서드로 접근해야 합니다.
저장소를 선택해도 다른 저장소와 자동으로 동기화되거나 네트워크 라이브러리가 설정되지는 않습니다.
임시 WKWebView는 별도 데이터 저장소를 사용하므로 이 API의 기본 WebKit 저장소 접근 범위에 포함되지 않습니다.

## 이름, 도메인, 경로

`/`의 `session`과 `/admin`의 `session`은 함께 존재할 수 있습니다. 상위 도메인 쿠키와 호스트 전용 쿠키도 공존할 수 있습니다.
Apple 목록 결과에서는 저장된 도메인 앞의 점으로 도메인 쿠키와 호스트 전용 쿠키를 구별합니다.

이름이 같은 쿠키를 보존하려면 `getList`를 사용하세요. `get`은 딕셔너리를 만들면서 이름별 마지막 네이티브 결과만 남깁니다.
네이티브 결과 순서를 앱의 우선순위 규칙으로 사용하지 마세요.

Android는 저장된 객체 전체가 아닌 요청 Cookie 헤더를 반환합니다. URL 목록은 이름과 값만 제공하며 알 수 없는 범위 필드는 생략합니다.
기존 Android 딕셔너리 조회의 도메인과 `/` 경로는 요청 URL에서 만든 값입니다. 원래 저장 범위를 나타내는 값으로 사용해서는 안 됩니다.

## 조회 결과와 요청 헤더의 차이

Apple의 `get`, `getList`, 동기 조회 메서드는 기존 도메인 선택 방식을 사용합니다.
`getCookieHeader`가 적용하는 요청 경로, Secure, 만료 조건을 모두 적용하지는 않습니다.
Android URL 조회는 CookieManager의 URL 선택 방식을 따릅니다.

실제 요청에 쿠키를 보낼 때는 [요청 헤더 API](../guides/request-headers)를 사용하세요.
쿠키 식별자를 확인하거나 [범위 삭제](../guides/scoped-deletion)를 준비할 때는 목록을 사용하세요.

## 보안 플래그

`secure`는 HTTPS로만 쿠키를 보내도록 제한합니다. `httpOnly`는 브라우저 스크립트 접근을 제한하는 플래그입니다.
네이티브 쿠키 API는 HttpOnly 값을 React Native 코드에 노출할 수 있습니다. 두 플래그는 쿠키를 암호화하거나 비밀 저장소로 만들지 않습니다.
인증 값을 로그와 진단 데이터에 남기지 마세요.
