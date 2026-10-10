# API 개요

`NitroCookies`를 default import하면 23개 메서드를 사용할 수 있습니다.
이 API Reference에 나오는 signature는 모두 `NitroCookies` 객체의 메서드를 나타냅니다.

```ts
import NitroCookies, {
  CookieErrorCode,
  type Cookie,
  type CookieIdentifier,
  type Cookies,
  type CookieError,
} from "react-native-nitro-cookies";
```

## 작업별 메서드

| 작업                            | 메서드                                                                               | 문서                                        |
| ------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| 저장된 쿠키 조회                | `getSync`, `get`, `getListSync`, `getList`, `getAll`, `getAllList`                   | [쿠키 조회](./reading)                      |
| 쿠키 저장                       | `setSync`, `set`, `setManySync`, `setMany`, `setFromResponseSync`, `setFromResponse` | [쿠키 저장](./writing)                      |
| Header 생성·응답 쿠키 조회      | `getCookieHeaderSync`, `getCookieHeader`, `getFromResponse`, `getFromResponseList`   | [Cookie header와 응답 쿠키](./requests)     |
| 쿠키 삭제                       | `clearCookieSync`, `clearCookie`, `clearByNameSync`, `clearByName`, `clearAll`       | [쿠키 삭제](./deletion)                     |
| 디스크 저장·session cookie 삭제 | `flush`, `removeSessionCookies`                                                      | [Session cookie와 디스크 저장](./lifecycle) |

## 공통 규칙

- URL 인자에는 전체 HTTP(S) URL을 전달하세요.
- `useWebKit`은 생략 가능한 boolean 인자입니다. 옵션 객체를 받지 않으며, 기본값은 `false`입니다.
- Sync 메서드는 기본 cookie store를 사용합니다. Async 메서드는 Promise를 반환하지만, 완료 시점은 플랫폼과 작업에 따라 다릅니다.
- Dictionary는 쿠키 이름을 key로 사용합니다. List는 이름이 같은 쿠키를 모두 유지합니다.
- Next wrapper에서 발생한 오류에는 문자열 형태의 `code`가 있습니다. 오류 처리 코드를 작성하기 전에 [Errors](./errors)를 확인하세요.

List API, scope를 지정하는 삭제 API, error normalization은 **아직 출시하지 않은 Next 변경 사항**입니다.
소스 문서와 npm 릴리스의 차이는 [설치](../start/installation)에서 확인하세요.

데이터 구조는 [Types](./types), 메서드별 지원 여부는 [플랫폼 지원](./platforms)에서 확인하세요.

## AI 도구에서 문서 읽기

[llms.txt](../llms.txt)에서 주제별 Markdown 문서를 찾거나, [llms-full.txt](../llms-full.txt)에서 한국어 문서 전체를 한 번에 읽을 수 있습니다.
두 파일은 사이트 문서를 바탕으로 자동 생성하며, 릴리스 안내와 플랫폼 제약도 그대로 포함합니다.
