# 쿠키 조회

이름으로 찾을 때는 딕셔너리를, 같은 이름을 보존하려면 목록을 조회합니다.
Apple URL 조회는 도메인을 기준으로 선택합니다. 실제 요청에 보낼 쿠키에는 [요청 헤더](./requests)를 사용하세요.

`useWebKit`의 기본값은 `false`입니다. `true`이면 iOS WebKit 저장소를 선택하며, tvOS는 이를 거부하고 Android는 플래그를 무시합니다.
일치하는 쿠키가 없으면 딕셔너리는 `{}`, 목록은 `[]`를 반환합니다.

## getSync

```ts
getSync(url: string): Cookies
```

기본 저장소를 동기 조회합니다. 이름을 키로 사용하며, 같은 이름이 있으면 앞의 항목을 덮어씁니다.

## get

```ts
get(url: string, useWebKit?: boolean): Promise<Cookies>
```

선택한 저장소를 비동기 조회합니다. 딕셔너리의 기존 이름 충돌 동작을 유지합니다. Android 메타데이터는 저장 범위가 아닌 URL에서 만든 값입니다.

## getListSync

```ts
getListSync(url: string): Cookie[]
```

**Next / 미출시.** 같은 이름을 잃지 않고 기본 저장소를 조회합니다. Apple은 저장된 도메인과 경로를 보존합니다. Android URL 결과는 이름과 값만 제공합니다.

## getList

```ts
getList(url: string, useWebKit?: boolean): Promise<Cookie[]>
```

**Next / 미출시.** 선택한 저장소를 목록으로 조회합니다. 순서는 네이티브 결과를 따릅니다. Android 목록 항목을 삭제 식별자로 사용하려면 원래 저장 범위가 필요합니다.

## getAll

```ts
getAll(useWebKit?: boolean): Promise<Cookies>
```

도메인과 관계없이 선택한 Apple 저장소의 모든 쿠키를 조회합니다. 같은 이름은 딕셔너리에서 하나로 합쳐집니다. Android는 PLATFORM_UNSUPPORTED로 거부합니다.

## getAllList

```ts
getAllList(useWebKit?: boolean): Promise<Cookie[]>
```

**Next / 미출시.** 선택한 Apple 저장소에서 같은 이름과 저장 범위를 보존하며 모든 쿠키를 조회합니다. Android는 PLATFORM_UNSUPPORTED로 거부합니다.

[타입](./types) · [오류](./errors) · [플랫폼 지원](./platforms)
