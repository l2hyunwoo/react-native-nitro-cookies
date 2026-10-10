# Types

타입은 패키지 루트에서 import하세요. Native 조회 결과에는 일부 optional 필드가 빠질 수 있습니다.

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

| 필드            | 설명                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `value` | `Cookie` 객체를 저장할 때 필수입니다.                                                                                                                       |
| `path`          | 저장할 때 기본값은 `/`입니다. Android의 URL list 결과에는 없습니다.                                                                                         |
| `domain`        | 저장할 때 기본값은 URL의 host입니다. Apple list는 저장된 값 앞의 점도 유지합니다. Android의 URL list 결과에는 없습니다.                                     |
| `version`       | 기존 API에서 제공하는 optional 필드입니다. 모든 플랫폼에서 같은 동작을 보장하지는 않습니다.                                                                 |
| `expires`       | ISO 8601 timestamp입니다. `2030-01-01T00:00:00.000Z`처럼 소수 초와 시간대를 포함하세요. 생략하면 session cookie이며, 수명은 cookie store의 정책을 따릅니다. |
| `secure`        | HTTPS 요청에만 쿠키를 전송하도록 제한합니다.                                                                                                                |
| `httpOnly`      | 브라우저의 JavaScript 접근을 제한하는 flag입니다. Native API로는 쿠키를 읽을 수 있습니다.                                                                   |

이 interface에는 `SameSite`와 `Max-Age` 필드가 없습니다. Raw `Set-Cookie` 처리 방식은 플랫폼을 따르며, `Cookie` 객체가 header의 모든 attribute를 표현하지는 않습니다.

## Cookies

```ts
type Cookies = Record<string, Cookie>;
```

Dictionary의 key는 쿠키 이름입니다. Native 결과에 같은 이름의 항목이 여러 개면 나중 항목이 앞의 항목을 덮어씁니다.
같은 이름의 쿠키를 모두 유지하려면 `Cookie[]`를 반환하는 list API를 사용하세요.

## CookieIdentifier

**1.3.0부터 지원합니다.** `clearCookie`와 `clearCookieSync`에서 사용합니다.

```ts
interface CookieIdentifier {
  name: string;
  path: string;
  domain?: string;
}
```

`path`는 필수이며 `/`로 시작해야 합니다. `domain`을 생략하면 URL host의 host-only 쿠키를 삭제합니다.
`domain`을 지정하면 그 scope의 쿠키를 선택합니다. Android에서는 호출자가 저장할 때 사용한 scope를 보관해야 합니다. URL 조회 결과만으로는 원래 scope를 알 수 없습니다.
Android의 저장 기본값과 삭제 인자의 차이는 [scope를 지정해 쿠키 삭제](../guides/scoped-deletion)에서 확인하세요.

## CookieError

```ts
interface CookieError extends Error {
  code: CookieErrorCode | string;
  cause?: unknown;
  url?: string;
  cookieName?: string;
}
```

`CookieError`는 TypeScript interface입니다. Runtime class가 아니므로 `instanceof CookieError`로 검사할 수 없습니다.
공개 wrapper는 원래 던진 값을 `cause`에 넣고, 원래 메시지와 stack이 있으면 보존합니다.
Runtime enum과 기본 오류 코드 선택 규칙은 [Errors](./errors)에서 확인하세요.
