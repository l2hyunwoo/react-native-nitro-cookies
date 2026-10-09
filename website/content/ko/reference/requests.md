# 헤더와 응답

요청 헤더 메서드는 저장소를 읽습니다. 응답 메서드는 네트워크 GET 요청을 수행하고 응답 쿠키를 파싱합니다.
앱에서 전달한 Response 객체를 파싱하는 메서드는 아닙니다.

정확한 HTTP(S) 대상 URL을 사용하세요. 빈 헤더는 `''`, 빈 응답 결과는 `{}` 또는 `[]`를 반환합니다.

## getCookieHeaderSync

```ts
getCookieHeaderSync(url: string): string
```

기본 저장소에서 바로 보낼 수 있는 Cookie 헤더를 반환합니다. Apple은 호스트, 경로, Secure, 만료 조건으로 선택합니다. Android는 CookieManager의 URL 선택을 사용합니다. 일치하는 같은 이름의 쿠키도 문자열에 남습니다.

## getCookieHeader

```ts
getCookieHeader(url: string, useWebKit?: boolean): Promise<string>
```

비동기 헤더 조회입니다. useWebKit의 기본값은 false이며 iOS WebKit 저장소를 선택할 수 있습니다. tvOS는 WebKit 접근을 거부합니다. 반환 헤더에 HttpOnly 쿠키가 포함될 수 있습니다.

## getFromResponse

```ts
getFromResponse(url: string): Promise<Cookies>
```

네이티브 GET 요청을 수행하고 파싱한 쿠키를 이름별로 반환합니다. 사용자 지정 요청 헤더나 본문 인자를 제공하지 않습니다. 범용 HTTP 클라이언트나 플랫폼 공통 저장소 가져오기 기능으로 사용하지 마세요.

## getFromResponseList

```ts
getFromResponseList(url: string): Promise<Cookie[]>
```

**Next / 미출시.** getFromResponse와 같은 네이티브 요청을 사용하며 이름을 합치지 않고 목록을 반환합니다. 파싱한 메타데이터를 보존합니다. 리다이렉트와 자동 쿠키 처리의 부수 효과는 네이티브 네트워크 계층을 따릅니다.

[타입](./types) · [오류](./errors) · [플랫폼 지원](./platforms)
