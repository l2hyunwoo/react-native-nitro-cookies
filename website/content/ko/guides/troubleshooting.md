# 쿠키 문제 해결

증상에 맞는 항목에서 native 설정, cookie store, scope를 차례로 확인하세요.
먼저 [플랫폼 지원 표](../reference/platforms)에서 사용하려는 기능을 지원하는지 확인하세요.

## 메서드를 호출하기 전에 import가 실패할 때

Nitro Cookies는 import 시점에 native HybridObject를 생성합니다.
Native module이 없으면 메서드의 오류 정규화가 실행되기 전에 import 자체가 실패할 수 있습니다.

1. Nitro Cookies와 호환되는 Nitro runtime을 함께 설치하세요.
2. Apple 플랫폼에서는 필요한 Pod를 설치한 뒤 native 앱을 다시 빌드하고 실행하세요.
3. Expo에서는 두 native 패키지를 포함한 development build를 사용하세요. Expo Go에서는 이 모듈을 불러올 수 없습니다.
4. Jest에서는 Nitro Cookies를 import하기 전에 native runtime을 mock하세요. 저장소의 [테스트 안내](https://github.com/l2hyunwoo/react-native-nitro-cookies/blob/main/CONTRIBUTING.md)를 참고하세요.

Metro에서 reload만 해서는 native module이 추가되지 않습니다. 자세한 절차는 [설치](../start/installation)를 참고하세요.

## 문서에 있는 메서드를 찾을 수 없을 때

설치한 패키지 버전과 [릴리스 이력](https://github.com/l2hyunwoo/react-native-nitro-cookies/releases)을 비교하세요.
이 문서는 소스 브랜치를 기준으로 하며, 아직 출시하지 않은 list API, scope를 지정하는 삭제 API, error normalization을 포함합니다.
Manifest의 `1.2.1`이 이 변경 사항을 배포했다는 뜻은 아닙니다. Next API를 확인하려면 [소스 설치 절차](../start/installation)를 따르세요.

## Android에서 WEBVIEW_UNAVAILABLE이 발생할 때

Android cookie store에는 정상적으로 동작하는 WebView provider가 필요합니다. 앱에 WebView 화면이 없어도 마찬가지입니다.
기기에 provider가 설치되어 있고 활성 상태인지, 업데이트가 끝났는지 확인하세요.
앱에서 `WEBVIEW_UNAVAILABLE`을 처리하고 cookie store를 사용할 수 없는 상태임을 사용자에게 안내하세요.

일부 Android TV 기기에는 provider가 없습니다. Nitro Cookies를 설치해도 대체 cookie store가 생기지는 않습니다.
소스 브랜치의 오류 계약은 [Errors](../reference/errors)에서 확인하세요.

## 저장은 성공했는데 바로 조회하면 비어 있을 때

Android의 `set`과 `setMany`는 CookieManager의 수락 callback을 기다리지 않고 쓰기를 요청합니다.
Sync·async 모두 같은 제약이 있습니다. `await set()`도 쓰기가 수락됐다는 뜻은 아닙니다.
인증에 사용하기 전에 원하는 쿠키가 조회되는지 확인하세요. 일정 시간 기다리는 것만으로 완료를 보장할 수는 없습니다.

다음 조건도 확인하세요.

- 원하는 host와 path를 포함한 HTTP 또는 HTTPS URL을 사용하세요. Secure 쿠키에는 HTTPS가 필요합니다.
- iOS에서는 같은 cookie store에 저장하고 조회하세요. 지원하는 async 메서드의 `useWebKit`으로 기본 WebKit cookie store를 선택합니다.
- `setFromResponse`는 Apple shared cookie store에 저장합니다. WebKit을 선택하는 인자는 없습니다.
- WebView의 ephemeral store는 이 패키지로 선택할 수 없습니다.
- HttpOnly는 browser의 `document.cookie` 접근을 제한합니다. 반환된 값을 React Native JavaScript에서 숨기는 기능은 아닙니다.

자세한 동작은 [쿠키 저장](../reference/writing)과 [cookie store와 scope](../concepts/storage)를 참고하세요.

## Dictionary에 쿠키가 안 보이거나 삭제 후에도 남아 있을 때

`get`은 쿠키 이름을 key로 사용하므로 같은 이름의 쿠키 중 하나만 남습니다. 중복 쿠키를 확인하려면 Next list API를 사용하세요.
Android의 URL list는 `name`과 `value`를 제공하지만 원래 `domain`, `path`, flag는 복원하지 못합니다.
조회한 metadata로 scope를 추정하지 말고 저장할 때 사용한 scope를 보관하세요.

Android의 `clearByName`은 정확한 식별 정보로 삭제할 쿠키를 선택하지 않습니다. 반환값만으로 모든 scope의 쿠키가 삭제됐다고 판단하면 안 됩니다.
Next `clearCookie` API에 원래 `name`, `domain`, `path`를 전달하세요. Apple에서는 저장할 때 사용한 cookie store도 같아야 합니다.
자세한 방법은 [scope를 지정해 쿠키 삭제](./scoped-deletion)를 참고하세요.

## 직접 보낸 요청에 예상과 다른 쿠키가 포함될 때

Path를 포함한 실제 요청 URL을 `getCookieHeader`에 전달하세요.
Dictionary나 list의 값을 이어 붙여 header를 만들지 마세요. Apple의 일반 조회는 request header와 쿠키 선택 규칙이 다릅니다.
요청 URL이 바뀌면 header를 다시 생성하고, 네트워크 라이브러리의 redirect·자동 쿠키 처리 정책은 별도로 확인하세요.
예제는 [request header 보내기](./request-headers)를 참고하세요.

## 재현 가능한 문제 보고

라이브러리 버전이나 source commit, React Native·Nitro 버전, OS·기기, URL 구조, 선택한 cookie store, 실패한 메서드를 함께 알려 주세요.
Android라면 WebView provider 상태도 포함하세요. 재현에는 예제 쿠키를 사용하고 로그에서 인증 토큰을 제거하세요.
최소 재현 코드를 [GitHub Issues](https://github.com/l2hyunwoo/react-native-nitro-cookies/issues)에 등록하세요.
