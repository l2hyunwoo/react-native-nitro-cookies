# 쿠키 조회

이름으로 쿠키를 찾으려면 dictionary를, 같은 이름의 쿠키를 모두 조회하려면 list를 사용하세요.
Apple의 URL 조회는 domain을 기준으로 쿠키를 선택합니다. 실제 요청에 보낼 쿠키가 필요하면 [request header API](./requests)를 사용하세요.

`useWebKit`의 기본값은 `false`입니다. `true`를 전달하면 iOS WebKit cookie store를 선택합니다. tvOS에서는 이 요청이 실패하며, Android에서는 이 인자를 무시합니다.
일치하는 쿠키가 없으면 dictionary API는 `{}`, list API는 `[]`를 반환합니다.

## getSync

```ts
getSync(url: string): Cookies
```

기본 cookie store를 sync 방식으로 조회합니다. 쿠키 이름을 key로 사용하므로, 이름이 같으면 native 결과에서 나중에 나온 항목이 앞의 항목을 덮어씁니다.

## get

```ts
get(url: string, useWebKit?: boolean): Promise<Cookies>
```

선택한 cookie store를 async 방식으로 조회합니다. 같은 이름의 쿠키는 기존 dictionary API와 동일하게 처리합니다. Android에서 반환하는 metadata는 실제 저장된 scope가 아니라 URL을 기준으로 만든 값입니다.

## getListSync

```ts
getListSync(url: string): Cookie[]
```

**Next / 미출시.** 기본 cookie store를 조회하면서 같은 이름의 쿠키를 모두 유지합니다. Apple은 저장된 `domain`과 `path`를 보존합니다. Android의 URL 조회 결과에는 `name`과 `value`만 있습니다.

## getList

```ts
getList(url: string, useWebKit?: boolean): Promise<Cookie[]>
```

**Next / 미출시.** 선택한 cookie store를 list로 조회합니다. 순서는 native 결과를 따릅니다. Android의 list 항목만으로는 삭제할 쿠키를 특정할 수 없으므로, 저장할 때 사용한 scope가 별도로 필요합니다.

## getAll

```ts
getAll(useWebKit?: boolean): Promise<Cookies>
```

Domain과 관계없이 선택한 Apple cookie store의 모든 쿠키를 조회합니다. Dictionary 결과에는 같은 이름의 쿠키 중 하나만 남습니다. Android에서는 `PLATFORM_UNSUPPORTED`로 실패합니다.

## getAllList

```ts
getAllList(useWebKit?: boolean): Promise<Cookie[]>
```

**Next / 미출시.** 선택한 Apple cookie store의 모든 쿠키를 조회합니다. 같은 이름의 쿠키와 저장된 scope를 모두 유지합니다. Android에서는 `PLATFORM_UNSUPPORTED`로 실패합니다.

[Types](./types) · [Errors](./errors) · [플랫폼 지원](./platforms)
