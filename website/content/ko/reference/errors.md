# 오류

**Next 계약.** 23개 공개 연산의 실패는 문자열 `code`를 가진 `Error`를 던지거나 Promise를 거부합니다.
알려진 오류는 런타임 enum으로 처리하세요.

```ts
import NitroCookies, { CookieErrorCode } from "react-native-nitro-cookies";

try {
  await NitroCookies.get("https://example.com");
} catch (error) {
  if (error instanceof Error && "code" in error) {
    if (error.code === CookieErrorCode.WEBVIEW_UNAVAILABLE) {
      // Show an unavailable-cookie-store state.
    }
  }
}
```

## 코드와 복구

| 코드                   | 의미                                                   | 다음 행동                                           |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| `INVALID_URL`          | 프로토콜이 없거나 URL이 잘못되었습니다.                | 전체 HTTP(S) URL을 전달하세요.                      |
| `DOMAIN_MISMATCH`      | 쿠키 또는 선택자 도메인이 URL과 호환되지 않습니다.     | 호스트와 원래 쿠키 범위를 확인하세요.               |
| `PLATFORM_UNSUPPORTED` | 해당 플랫폼에서 지원하지 않는 연산입니다.              | 지원 표를 확인하고 호출을 분기하세요.               |
| `WEBKIT_UNAVAILABLE`   | tvOS 등에서 요청한 WebKit 저장소를 사용할 수 없습니다. | 적절한 경우 공유 저장소를 선택하세요.               |
| `WEBVIEW_UNAVAILABLE`  | Android의 WebView 기반 저장소를 초기화할 수 없습니다.  | 제공자 상태를 확인하고 사용 불가 상태를 처리하세요. |
| `PARSE_ERROR`          | 헤더 파싱이나 선택자 검증에 실패했습니다.              | 입력과 필수 필드를 확인하세요.                      |
| `NETWORK_ERROR`        | 응답 조회 실패 또는 해당 연산의 미분류 실패입니다.     | 대상과 네트워크 연결을 확인하세요.                  |
| `STORAGE_ERROR`        | 저장소 실패 또는 다른 연산의 미분류 실패입니다.        | 원래 원인과 저장소 상태를 확인하세요.               |

제공자 감지는 WebView를 설치하거나 대체 저장소를 만들지 않습니다.

## 보존하는 정보

래퍼는 새 Error를 만들고 원래 메시지, 사용 가능한 스택, 던져진 값을 `cause`로 보존합니다.
전달받은 `url`과 단일 쿠키 저장·삭제 작업의 `cookieName`도 붙입니다.
컨텍스트에 쿠키 값을 추가하지는 않습니다. 하지만 원래 메시지와 URL에는 앱 데이터가 포함될 수 있습니다.

기존의 비어 있지 않은 문자열 코드는 알 수 없는 코드도 보존합니다.
미분류 `getFromResponse`·`getFromResponseList` 실패는 `NETWORK_ERROR`, 다른 연산은 `STORAGE_ERROR`를 사용합니다.
브리지 파싱은 Nitro 0.35.9 메시지 형식을 기준으로 하며, 브리지가 바뀌면 갱신이 필요할 수 있습니다.

## 초기화 실패

import 시 하이브리드 객체 생성은 연산 정규화 범위 밖에서 실행됩니다.
네이티브 모듈을 찾을 수 없다면 쿠키 연산을 조사하기 전에 네이티브 설치를 확인하고 앱을 다시 빌드하세요.
