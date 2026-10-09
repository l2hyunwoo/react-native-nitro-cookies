# 쿠키 저장

구조화된 쿠키를 저장하거나 원본 Set-Cookie 헤더를 전달합니다.
절대 HTTP(S) URL과 해당 호스트에 호환되는 쿠키 도메인을 사용하세요.
구조화된 저장에서 `path`를 생략하면 `/`, `domain`을 생략하면 URL 호스트를 사용합니다.

`useWebKit`의 기본값은 `false`입니다. iOS의 비동기 구조화 저장에서만 WebKit을 선택할 수 있습니다.
Android의 기존 저장 API는 Promise를 반환하는 경우에도 승인 콜백 없이 CookieManager에 쓰기를 제출합니다.
`true`가 모든 플랫폼에서 영속 저장을 보장하지는 않습니다. Android 디스크 저장이 필요하면 [flush](./lifecycle#flush)를 사용하세요.

## setSync

```ts
setSync(url: string, cookie: Cookie): boolean
```

기본 저장소에 쿠키 하나를 제출하고 네이티브 메서드가 예외 없이 끝나면 true를 반환합니다.

## set

```ts
set(url: string, cookie: Cookie, useWebKit?: boolean): Promise<boolean>
```

선택한 저장소에 쿠키 하나를 저장합니다. iOS WebKit은 저장소 완료 콜백 후 완료하며, Android의 완료는 제출을 뜻합니다.

## setManySync

```ts
setManySync(url: string, cookies: Cookie[]): boolean
```

기본 저장소에 여러 쿠키를 제출합니다. 저장 전에 도메인을 검증합니다. 저장소 실패에 대한 트랜잭션 롤백을 보장하지는 않습니다.

## setMany

```ts
setMany(url: string, cookies: Cookie[], useWebKit?: boolean): Promise<boolean>
```

선택한 저장소에 여러 쿠키를 저장합니다. Apple WebKit은 완료 콜백을 사용합니다. 작업이 예외 없이 끝나면 true를 반환합니다.

## setFromResponseSync

```ts
setFromResponseSync(url: string, value: string): boolean
```

원본 Set-Cookie 텍스트를 파싱하거나 전달해 기본 저장소에 저장합니다. value는 요청 Cookie 헤더가 아닌 응답 헤더입니다. 파싱 동작은 플랫폼을 따릅니다.

## setFromResponse

```ts
setFromResponse(url: string, value: string): Promise<boolean>
```

원본 응답 헤더 저장의 비동기 형태입니다. useWebKit 인자는 없습니다. Expires 값에 쉼표가 들어갈 수 있으므로 별도 Set-Cookie 헤더를 쉼표로 합치지 마세요.

[타입](./types) · [오류](./errors) · [플랫폼 지원](./platforms)
