# Errors

**Next 오류 처리 규칙.** 23개 공개 메서드에서 발생한 오류는 문자열 `code`가 있는 `Error`로 전달됩니다. Sync 호출은 이 오류를 throw하고, async 호출은 이 오류로 Promise를 reject합니다.
알려진 오류 코드를 처리할 때는 패키지가 export하는 runtime enum을 사용하세요.

```ts
import NitroCookies, { CookieErrorCode } from "react-native-nitro-cookies";

try {
  await NitroCookies.get("https://example.com");
} catch (error) {
  if (error instanceof Error && "code" in error) {
    if (error.code === CookieErrorCode.WEBVIEW_UNAVAILABLE) {
      // Cookie store를 사용할 수 없다는 안내를 표시하세요.
    }
  }
}
```

## 오류 코드별 대응

| 코드                   | 의미                                                                               | 확인할 내용                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `INVALID_URL`          | Protocol이 없거나 URL이 잘못되었습니다.                                            | 전체 HTTP(S) URL을 전달하세요.                                                     |
| `DOMAIN_MISMATCH`      | 쿠키 또는 삭제할 쿠키의 domain이 URL과 호환되지 않습니다.                          | Host와 원래 쿠키의 scope를 확인하세요.                                             |
| `PLATFORM_UNSUPPORTED` | 현재 플랫폼에서 지원하지 않는 메서드입니다.                                        | 지원 표를 확인하고, 지원하지 않는 호출을 피하세요.                                 |
| `WEBKIT_UNAVAILABLE`   | tvOS 등에서 요청한 WebKit cookie store를 사용할 수 없습니다.                       | Shared cookie store로 처리할 수 있는 작업인지 확인하세요.                          |
| `WEBVIEW_UNAVAILABLE`  | Android의 WebView 기반 cookie store를 초기화할 수 없습니다.                        | WebView provider 상태를 확인하고, cookie store를 사용할 수 없는 경우를 처리하세요. |
| `PARSE_ERROR`          | Header 파싱이나 쿠키 식별 정보 검증에 실패했습니다.                                | 입력과 필수 필드를 확인하세요.                                                     |
| `NETWORK_ERROR`        | 응답 조회에 실패했거나, 응답 조회 중 분류하지 못한 오류가 발생했습니다.            | 요청 URL과 네트워크 연결을 확인하세요.                                             |
| `STORAGE_ERROR`        | Cookie store 작업에 실패했거나, 다른 메서드에서 분류하지 못한 오류가 발생했습니다. | 원래 오류와 cookie store 상태를 확인하세요.                                        |

WebView provider가 없다는 사실을 감지해도 WebView를 설치하거나 대체 cookie store를 만들지는 않습니다.

## 오류에 포함되는 정보

Wrapper는 새 `Error`를 만들고 원래 throw한 값을 `cause`에 담습니다. 원래 메시지와 stack이 있으면 함께 보존합니다.
호출할 때 전달한 `url`도 추가합니다. 쿠키 하나를 저장하거나 삭제하는 작업에서는 `cookieName`도 추가합니다.
Wrapper가 쿠키 값을 오류 정보에 추가하지는 않습니다. 다만 원래 오류 메시지나 URL에는 앱 데이터가 포함될 수 있습니다.

원래 오류에 비어 있지 않은 문자열 `code`가 있으면, 알려지지 않은 코드여도 그대로 유지합니다.
코드를 분류할 수 없는 `getFromResponse`·`getFromResponseList` 오류는 `NETWORK_ERROR`로, 다른 메서드의 오류는 `STORAGE_ERROR`로 처리합니다.
Bridge 메시지는 Nitro 0.35.9의 형식을 기준으로 파싱합니다. Bridge가 바뀌면 파싱 규칙도 수정해야 할 수 있습니다.

## 초기화 실패

Import 시점에 HybridObject를 생성하는 과정에는 위 error normalization 규칙을 적용하지 않습니다.
Native module을 찾을 수 없다면 먼저 설치 상태를 확인하고 앱을 다시 빌드하세요. 그다음 쿠키 메서드의 동작을 확인하세요.
