# Cookie header와 응답 쿠키

`getCookieHeader*`는 cookie store에서 요청에 보낼 header를 만듭니다. `getFromResponse*`는 native `GET` 요청을 보내고 응답에서 쿠키를 파싱합니다.
앱이 전달한 `Response` 객체를 파싱하는 메서드는 아닙니다.

실제로 요청을 보낼 HTTP(S) URL을 사용하세요. 일치하는 쿠키가 없으면 header API는 `''`, 응답 조회 API는 `{}` 또는 `[]`를 반환합니다.

## getCookieHeaderSync

```ts
getCookieHeaderSync(url: string): string
```

기본 cookie store에서 요청에 바로 사용할 수 있는 `Cookie` header를 만듭니다. Apple에서는 host, path, Secure, 만료 조건을 적용합니다. Android에서는 CookieManager의 URL 선택 규칙을 따릅니다. 이름이 같아도 URL에 일치하는 쿠키는 모두 header에 포함됩니다.

## getCookieHeader

```ts
getCookieHeader(url: string, useWebKit?: boolean): Promise<string>
```

`Cookie` header를 async 방식으로 조회합니다. `useWebKit`의 기본값은 `false`이며, iOS WebKit cookie store를 선택할 수 있습니다. tvOS에서는 WebKit 접근이 실패합니다. 반환된 header에는 HttpOnly 쿠키도 포함될 수 있습니다.

## getFromResponse

```ts
getFromResponse(url: string): Promise<Cookies>
```

Native `GET` 요청을 보내고 응답에서 파싱한 쿠키를 이름별로 반환합니다. 별도의 request header나 body를 전달하는 인자는 없습니다. 범용 HTTP client로 사용하거나, 응답 쿠키를 모든 플랫폼의 cookie store에 동일하게 저장해 주는 API로 간주하지 마세요.

## getFromResponseList

```ts
getFromResponseList(url: string): Promise<Cookie[]>
```

**Next / 미출시.** `getFromResponse`와 같은 native 요청을 보내지만, 이름이 같은 쿠키도 빠짐없이 list로 반환합니다. 파싱한 metadata도 유지합니다. Redirect 처리와 자동 쿠키 저장 등 부수 효과는 native 네트워크 구현을 따릅니다.

[Types](./types) · [Errors](./errors) · [플랫폼 지원](./platforms)
