# 플랫폼 지원

Nitro Cookies는 iOS, Android, tvOS의 네이티브 React Native 앱을 대상으로 합니다.
Android TV는 Android 구현을 사용하며, 저장소 작업에는 정상적인 WebView 제공자가 필요합니다.
웹과 Expo Go에는 이 네이티브 모듈이 없습니다.

## 사용 가능 범위

| 기능                                     | iOS                               | tvOS                   | Android / Android TV             |
| ---------------------------------------- | --------------------------------- | ---------------------- | -------------------------------- |
| 기본 저장소 조회·저장·헤더·삭제          | 공유 저장소                       | 공유 저장소            | CookieManager. 제공자 필요       |
| `useWebKit: true`                        | 기본 WebKit 저장소. 비동기만 가능 | `WEBKIT_UNAVAILABLE`   | 플래그 무시                      |
| 목록 조회                                | 저장된 메타데이터                 | 저장된 메타데이터      | URL 목록은 이름과 값만 제공      |
| `getAll`, `getAllList`                   | 지원                              | 기본 저장소에서 지원   | `PLATFORM_UNSUPPORTED`           |
| 범위 삭제                                | 정확한 저장 식별자                | 정확한 저장 식별자     | 호출자가 전달한 범위에 만료 쓰기 |
| `getFromResponse`, `getFromResponseList` | 네이티브 네트워크 요청            | 네이티브 네트워크 요청 | 네이티브 네트워크 요청           |
| `flush`                                  | 작업 없음                         | 작업 없음              | CookieManager 쿠키 영속 저장     |
| `removeSessionCookies`                   | 삭제 없이 `false` 반환            | 삭제 없이 `false` 반환 | 플랫폼 삭제 콜백                 |

Android의 기본 최소 버전은 API 24입니다. Apple 배포 조건은 React Native와 Nitro에도 영향을 받습니다. WebKit API를 사용할 수 있는 iOS 11을 앱의 최소 지원 버전으로 해석하지 마세요.
라이브러리 podspec은 tvOS를 선언하지만, 사용하는 React Native tvOS 버전이 더 높은 배포 대상을 요구할 수 있습니다.

## 쿠키를 찾을 수 없을 때

1. 두 패키지를 설치한 뒤 네이티브 앱을 다시 빌드했는지 확인하세요.
2. 전체 URL, HTTPS 조건, 도메인, 요청 경로를 확인하세요.
3. iOS에서는 읽기와 저장에 같은 저장소를 사용하세요.
4. Android에서는 WebView 제공자의 설치와 활성 상태를 확인하세요.
5. 같은 이름에는 목록을 사용하고 Android의 원래 범위를 보관하세요.

WebView가 없는 Android TV 기기에 이 패키지가 쿠키 저장소를 추가하지는 않습니다.
`WEBVIEW_UNAVAILABLE`을 저장소 사용 불가 오류로 처리하세요.

동작 차이는 [저장소와 범위](../concepts/storage), 복구 코드는 [오류](./errors)에서 확인하세요.
