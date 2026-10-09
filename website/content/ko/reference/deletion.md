# 쿠키 삭제

정확한 식별자를 삭제하려면 범위 삭제를 사용하세요. 기존 이름 삭제는 플랫폼별 동작을 유지합니다.
`useWebKit`의 기본값은 `false`이며, 지원하는 메서드에서 iOS WebKit 저장소를 선택합니다.

삭제 식별자에는 `name`과 절대 `path`가 필요합니다. 호스트 전용 삭제일 때만 `domain`을 생략하세요. 도메인을 명시하면 해당 범위를 선택합니다.
잘못된 선택자는 `PARSE_ERROR`, 호환되지 않는 도메인은 `DOMAIN_MISMATCH`로 변경 전에 실패합니다.

## clearCookieSync

```ts
clearCookieSync(url: string, identifier: CookieIdentifier): void
```

**Next / 미출시.** 기본 저장소에서 정확한 식별자를 삭제합니다. void를 반환합니다. Apple에서는 해당 쿠키가 없으면 아무 작업도 하지 않습니다. Android는 승인 확인이나 존재 여부 보고 없이 만료 쓰기를 제출합니다.

## clearCookie

```ts
clearCookie(url: string, identifier: CookieIdentifier, useWebKit?: boolean): Promise<void>
```

**Next / 미출시.** 선택한 저장소에서 정확한 식별자를 삭제합니다. Android는 쓰기 승인을 기다리며 거부된 쓰기를 오류로 처리합니다. 쿠키가 존재했는지는 알 수 없습니다. Secure 쿠키에는 HTTPS를 사용하세요.

## clearByNameSync

```ts
clearByNameSync(url: string, name: string): boolean
```

기본 저장소에서 이름으로 삭제하는 기존 메서드입니다. Apple은 첫 번째 일치 결과를 삭제합니다. Android는 / 경로와 URL 호스트 Domain 속성으로 만료를 시도합니다. boolean 결과가 정확한 범위의 삭제를 뜻하지는 않습니다.

## clearByName

```ts
clearByName(url: string, name: string, useWebKit?: boolean): Promise<boolean>
```

기존 이름 삭제의 비동기 형태입니다. iOS WebKit 선택 플래그를 받습니다. 경로나 도메인이 겹치면 clearCookie를 사용하세요.

## clearAll

```ts
clearAll(useWebKit?: boolean): Promise<boolean>
```

관계없는 도메인까지 선택한 저장소 전체를 비웁니다. URL 인자는 없습니다. Apple은 완료 후 true를, Android는 CookieManager가 쿠키를 삭제했는지를 반환합니다. 저장소 전체를 비우려는 경우에만 사용하세요.

[타입](./types) · [오류](./errors) · [플랫폼 지원](./platforms)
