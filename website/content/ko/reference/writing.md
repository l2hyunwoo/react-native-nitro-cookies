# 쿠키 저장

`Cookie` 객체를 저장하거나 raw `Set-Cookie` header를 전달합니다.
전체 HTTP(S) URL과 그 host에 호환되는 cookie domain을 사용하세요.
`Cookie` 객체를 저장할 때 `path`를 생략하면 `/`, `domain`을 생략하면 URL의 host를 사용합니다.

`useWebKit`의 기본값은 `false`입니다. iOS에서 `Cookie` 객체를 저장하는 async 메서드만 WebKit cookie store를 선택할 수 있습니다.
Android의 기존 저장 API는 Promise를 반환하더라도 CookieManager가 쓰기를 수락했는지 확인하는 callback 없이 쓰기 작업을 요청합니다.
반환값이 `true`여도 모든 플랫폼에서 디스크 저장까지 끝났다는 뜻은 아닙니다. Android에서 디스크 저장이 필요하면 [flush](./lifecycle#flush)를 사용하세요.

## setSync

```ts
setSync(url: string, cookie: Cookie): boolean
```

기본 cookie store에 쿠키 하나를 저장하도록 요청합니다. Native 메서드가 예외 없이 끝나면 `true`를 반환합니다.

## set

```ts
set(url: string, cookie: Cookie, useWebKit?: boolean): Promise<boolean>
```

선택한 cookie store에 쿠키 하나를 저장합니다. iOS WebKit에서는 store의 완료 callback을 받은 뒤 Promise가 resolve됩니다. Android에서는 쓰기를 요청한 뒤 resolve되며, 수락 여부는 확인하지 않습니다.

## setManySync

```ts
setManySync(url: string, cookies: Cookie[]): boolean
```

기본 cookie store에 여러 쿠키를 저장하도록 요청합니다. 쓰기를 시작하기 전에 domain을 검증합니다. 저장 중 오류가 나더라도 이미 저장한 쿠키를 transaction처럼 rollback한다고 보장하지는 않습니다.

## setMany

```ts
setMany(url: string, cookies: Cookie[], useWebKit?: boolean): Promise<boolean>
```

선택한 cookie store에 여러 쿠키를 저장합니다. Apple WebKit에서는 완료 callback을 기다립니다. 작업이 예외 없이 끝나면 `true`로 resolve됩니다. Android에서는 쓰기 요청이 끝났다는 뜻이며, 수락 여부는 확인하지 않습니다.

## setFromResponseSync

```ts
setFromResponseSync(url: string, value: string): boolean
```

Raw `Set-Cookie` 문자열을 파싱하거나 native API에 전달해 기본 cookie store에 저장합니다. `value`에는 응답의 `Set-Cookie` header를 전달하세요. 요청의 `Cookie` header를 받는 인자가 아닙니다. 파싱 방식은 플랫폼을 따릅니다.

## setFromResponse

```ts
setFromResponse(url: string, value: string): Promise<boolean>
```

Raw `Set-Cookie` header를 저장하는 async 메서드입니다. `useWebKit` 인자는 없습니다. `Expires` 값에는 쉼표가 들어갈 수 있으므로, 여러 `Set-Cookie` header를 쉼표로 합치지 마세요.

[Types](./types) · [Errors](./errors) · [플랫폼 지원](./platforms)
