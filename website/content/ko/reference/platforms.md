# 플랫폼 지원

Nitro Cookies는 iOS, Android, tvOS의 native React Native 앱에서 사용합니다.
Android TV도 Android 구현을 사용하며, cookie store 작업에는 정상적으로 동작하는 WebView provider가 필요합니다.
웹과 Expo Go에서는 이 native module을 사용할 수 없습니다.

## 플랫폼별 지원 기능

| 기능                                     | iOS                                    | tvOS                       | Android / Android TV                   |
| ---------------------------------------- | -------------------------------------- | -------------------------- | -------------------------------------- |
| 기본 cookie store 조회·저장·header·삭제  | Shared cookie store                    | Shared cookie store        | CookieManager. WebView provider 필요   |
| `useWebKit: true`                        | 기본 WebKit cookie store. Async만 지원 | `WEBKIT_UNAVAILABLE`       | 인자 무시                              |
| List 조회                                | 저장된 metadata 포함                   | 저장된 metadata 포함       | URL list는 `name`과 `value`만 제공     |
| `getAll`, `getAllList`                   | 지원                                   | 기본 cookie store에서 지원 | `PLATFORM_UNSUPPORTED`                 |
| Scope를 지정한 삭제                      | 저장된 식별 정보로 삭제                | 저장된 식별 정보로 삭제    | 호출자가 지정한 scope에 쿠키 만료 요청 |
| `getFromResponse`, `getFromResponseList` | Native 네트워크 요청                   | Native 네트워크 요청       | Native 네트워크 요청                   |
| `flush`                                  | 아무 작업도 하지 않음                  | 아무 작업도 하지 않음      | CookieManager의 쿠키를 디스크에 저장   |
| `removeSessionCookies`                   | 삭제 없이 `false` 반환                 | 삭제 없이 `false` 반환     | 플랫폼의 삭제 callback 사용            |

Android의 기본 최소 지원 버전은 API 24입니다. Apple deployment target은 React Native와 Nitro의 요구사항에도 영향을 받습니다. WebKit API를 iOS 11부터 사용할 수 있다는 이유로 앱도 iOS 11을 지원한다고 판단하면 안 됩니다.
라이브러리 podspec에는 tvOS 지원을 선언했지만, 사용하는 React Native tvOS 버전이 더 높은 deployment target을 요구할 수 있습니다.

## 쿠키가 조회되지 않을 때

1. 두 패키지를 설치한 뒤 native 앱을 다시 빌드했는지 확인하세요.
2. 전체 URL, HTTPS 조건, domain, 요청 path를 확인하세요.
3. iOS에서는 읽기와 저장에 같은 cookie store를 사용하세요.
4. Android에서는 WebView provider가 설치되어 있고 활성 상태인지 확인하세요.
5. 같은 이름의 쿠키가 여러 개라면 list로 조회하세요. Android에서는 저장할 때 사용한 scope를 별도로 보관하세요.

WebView가 없는 Android TV 기기에서 이 패키지를 설치해도 cookie store가 생기지는 않습니다.
`WEBVIEW_UNAVAILABLE`이 발생하면 cookie store를 사용할 수 없는 상태로 처리하세요.

플랫폼별 동작 차이는 [cookie store와 scope](../concepts/storage), 오류 처리 방법은 [Errors](./errors)에서 확인하세요.
