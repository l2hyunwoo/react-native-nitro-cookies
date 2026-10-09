# 타입

패키지 루트에서 타입을 import하세요. 네이티브 조회 결과에는 선택적 필드가 없을 수 있습니다.

## Cookie

```ts
interface Cookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  version?: string;
  expires?: string;
  secure?: boolean;
  httpOnly?: boolean;
}
```

| 필드            | 의미                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `value` | 구조화된 저장에 필수입니다.                                                                                                         |
| `path`          | 저장할 때 기본값은 `/`입니다. Android URL 목록에서는 알 수 없습니다.                                                                |
| `domain`        | 저장할 때 기본값은 URL 호스트입니다. Apple 목록은 저장된 앞의 점을 보존합니다. Android URL 목록에서는 알 수 없습니다.               |
| `version`       | 선택적인 기존 필드입니다. 모든 플랫폼에서 같은 네이티브 효과를 기대하지 마세요.                                                     |
| `expires`       | ISO 8601 시각입니다. `2030-01-01T00:00:00.000Z`처럼 소수 초와 시간대를 포함하세요. 생략하면 세션 쿠키이며 수명은 저장소를 따릅니다. |
| `secure`        | HTTPS 요청으로 전송을 제한합니다.                                                                                                   |
| `httpOnly`      | 브라우저 스크립트 접근 플래그입니다. 네이티브 API는 쿠키를 읽을 수 있습니다.                                                        |

`SameSite`와 `Max-Age`는 이 인터페이스의 필드가 아닙니다. 원본 Set-Cookie 처리는 플랫폼을 따르며, 구조화된 결과가 모든 헤더 속성을 노출하지는 않습니다.

## Cookies

```ts
type Cookies = Record<string, Cookie>;
```

딕셔너리의 키는 이름입니다. 같은 이름의 네이티브 항목이 뒤에 나오면 앞의 항목을 대체합니다.
같은 이름을 보존하려면 `Cookie[]` 목록 결과를 사용하세요.

## CookieIdentifier

**Next / 미출시.** `clearCookie`와 `clearCookieSync`에서 사용합니다.

```ts
interface CookieIdentifier {
  name: string;
  path: string;
  domain?: string;
}
```

`path`는 필수이며 `/`로 시작해야 합니다. `domain`을 생략하면 URL 호스트의 호스트 전용 쿠키를 삭제합니다.
도메인을 명시하면 해당 저장 범위를 선택합니다. Android 호출자는 원래 범위를 보관해야 합니다. URL 조회로는 복원할 수 없습니다.
Android 저장 기본값과의 차이는 [범위 삭제](../guides/scoped-deletion)에서 확인하세요.

## CookieError

```ts
interface CookieError extends Error {
  code: CookieErrorCode | string;
  cause?: unknown;
  url?: string;
  cookieName?: string;
}
```

TypeScript 인터페이스이며 `instanceof`로 검사할 수 있는 런타임 클래스가 아닙니다.
Next 연산 래퍼는 `cause`를 설정하고 원래 메시지와 사용 가능한 스택을 보존합니다.
런타임 enum과 대체 코드 동작은 [오류](./errors)에서 확인하세요.
