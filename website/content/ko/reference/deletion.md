# 쿠키 삭제

쿠키 하나를 정확히 삭제하려면 scope를 지정하세요. 기존에 이름만으로 삭제하던 API는 플랫폼별 동작을 그대로 유지합니다.
`useWebKit`의 기본값은 `false`입니다. 이 인자를 받는 메서드에서는 iOS WebKit cookie store를 선택할 수 있습니다.

`CookieIdentifier`에는 `name`과 `/`로 시작하는 절대 `path`가 필요합니다. Host-only 쿠키를 삭제할 때만 `domain`을 생략하세요. `domain`을 지정하면 그 scope의 쿠키를 선택합니다.
식별 정보가 잘못되면 `PARSE_ERROR`, URL과 domain이 호환되지 않으면 `DOMAIN_MISMATCH`로 실패합니다. 이 검증은 쿠키를 변경하기 전에 실행합니다.

## clearCookieSync

```ts
clearCookieSync(url: string, identifier: CookieIdentifier): void
```

**Next / 미출시.** 기본 cookie store에서 식별 정보가 일치하는 쿠키를 삭제합니다. 반환형은 `void`입니다. Apple에서는 일치하는 쿠키가 없으면 아무 작업도 하지 않습니다. Android에서는 쿠키를 만료시키는 쓰기를 요청하며, 쓰기의 수락 여부나 쿠키의 존재 여부는 확인하지 않습니다.

## clearCookie

```ts
clearCookie(url: string, identifier: CookieIdentifier, useWebKit?: boolean): Promise<void>
```

**Next / 미출시.** 선택한 cookie store에서 식별 정보가 일치하는 쿠키를 삭제합니다. Android에서는 CookieManager가 쓰기를 수락할 때까지 기다리고, 거절하면 오류로 처리합니다. 삭제 전에 쿠키가 존재했는지는 알 수 없습니다. Secure 쿠키를 삭제하려면 HTTPS를 사용하세요.

## clearByNameSync

```ts
clearByNameSync(url: string, name: string): boolean
```

기본 cookie store에서 이름만으로 삭제하는 기존 메서드입니다. Apple에서는 이름이 일치하는 첫 번째 쿠키를 삭제합니다. Android에서는 `Path=/`와 URL host의 `Domain` attribute를 사용해 쿠키 만료를 시도합니다. Boolean 반환값만으로 원하는 scope의 쿠키를 삭제했다고 판단하면 안 됩니다.

## clearByName

```ts
clearByName(url: string, name: string, useWebKit?: boolean): Promise<boolean>
```

이름만으로 삭제하는 기존 API의 async 메서드입니다. iOS WebKit cookie store를 선택하는 인자를 받습니다. 같은 이름의 쿠키가 여러 path나 domain에 있다면 `clearCookie`를 사용하세요.

## clearAll

```ts
clearAll(useWebKit?: boolean): Promise<boolean>
```

선택한 cookie store 전체를 비웁니다. 앱이 요청하는 domain 외의 쿠키도 삭제하며, URL 인자는 받지 않습니다. Apple에서는 완료 후 `true`를 반환하고, Android에서는 CookieManager가 쿠키를 하나라도 삭제했는지 반환합니다. Cookie store 전체를 비우려는 경우에만 사용하세요.

[Types](./types) · [Errors](./errors) · [플랫폼 지원](./platforms)
