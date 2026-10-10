# 기존 앱 마이그레이션

Nitro Cookies는 `@react-native-cookies/cookies`와 유사한 async 쿠키 API를 제공합니다.
Import를 바꾼 뒤 앱이 사용하는 cookie store와 플랫폼별 동작을 확인하세요.

## Native dependency 교체

[설치 가이드](../start/installation)에 따라 두 패키지를 설치하세요. 기존 native 쿠키 패키지를 제거한 뒤 앱을 다시 빌드하세요.

```diff
- import CookieManager from '@react-native-cookies/cookies';
+ import CookieManager from 'react-native-nitro-cookies';
```

Import한 객체의 이름을 유지하면 호출부의 수정 범위를 줄일 수 있습니다. 다만 기존 패키지와 모든 동작이 같다고 가정하지 마세요.

## 마이그레이션 전 확인할 점

| 앱에서 가정한 동작                                  | 확인할 내용                                                                               |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 같은 이름의 쿠키는 하나뿐이다                       | 같은 이름의 쿠키를 모두 다뤄야 한다면 Next list API를 사용하세요.                         |
| 조회 결과로 원래 scope를 알 수 있다                 | Android의 URL 조회로는 알 수 없습니다. 저장할 때 scope를 보관하세요.                      |
| Native 쿠키와 WebView 쿠키는 같은 store를 사용한다  | 필요한 호출에서 iOS WebKit cookie store를 명시하세요.                                     |
| 모든 Android 기기에서 cookie store를 사용할 수 있다 | WebView provider가 정상적으로 동작하지 않는 기기에서도 앱이 오류를 처리하도록 구현하세요. |
| 이름으로 삭제하면 원하는 쿠키 하나만 지운다         | 같은 이름의 쿠키가 여러 scope에 있다면 Next `clearCookie`를 사용하세요.                   |
| 모든 플랫폼에서 모든 메서드를 지원한다              | `getAll`, WebKit, 디스크 저장, session cookie의 동작을 확인하세요.                        |

## 필요한 호출에만 sync 메서드 적용

Sync 메서드는 Promise를 반환하지 않으며 iOS WebKit cookie store에 접근할 수 없습니다.
WebKit 접근이나 플랫폼이 작업을 수락했는지 확인해야 하는 곳에서는 async 호출을 유지하세요.
Sync 메서드를 제공한다는 이유만으로 모든 async 호출을 바꿀 필요는 없습니다.

지원할 플랫폼에서 인증, 로그아웃, WebView 페이지 이동, 디스크 저장이 의도대로 동작하는지 검증하세요.
Next의 error normalization 규칙은 [Errors](../reference/errors)에서 확인하세요.
