# Scope를 지정해 쿠키 삭제

같은 이름의 쿠키가 여러 개라면 Next `clearCookie` API를 사용하세요.
다른 쿠키를 삭제하지 않도록 저장할 때 사용한 `name`, `domain`, `path`를 전달하세요.

## Apple: 조회한 식별 정보 그대로 사용

```ts
import NitroCookies from "react-native-nitro-cookies";

const url = "https://api.example.com/admin";
const cookies = await NitroCookies.getList(url);
const target = cookies.find(
  (cookie) => cookie.name === "session" && cookie.path === "/admin",
);

if (target?.path) {
  await NitroCookies.clearCookie(url, {
    name: target.name,
    domain: target.domain,
    path: target.path,
  });
}
```

List 결과의 `domain`은 앞의 점까지 Apple에 저장된 값 그대로입니다. 삭제할 때도 이 값을 그대로 전달하세요.
iOS WebKit cookie store를 사용한다면 두 async 호출에 모두 `true`를 전달하세요.
일치하는 쿠키가 없으면 다른 쿠키를 변경하지 않고 완료됩니다.

## Android: 저장할 때 scope 보관

Android의 URL 조회 결과에서는 저장된 `domain`과 `path`를 확인할 수 없습니다. 쿠키를 저장할 때 이 필드들을 함께 보관하세요.

```ts
const url = "https://api.example.com/admin";
const scope = { name: "session", domain: "api.example.com", path: "/admin" };

await NitroCookies.set(url, {
  ...scope,
  value: "server-issued-token",
  secure: true,
});
await NitroCookies.clearCookie(url, scope);
```

`domain`을 지정하면 앞의 점 유무와 관계없이 `Domain` attribute를 만듭니다.
기존 Android `set`은 `domain`을 생략해도 URL의 host를 기본값으로 사용해 `Domain` attribute를 만듭니다.
삭제할 때도 이 domain을 전달하세요. `set`에서 `domain`을 생략했다는 이유만으로 host-only 쿠키라고 판단하면 안 됩니다.

`Domain`이 없는 raw `Set-Cookie` header처럼, 실제로 host-only로 저장한 쿠키를 삭제할 때만 `domain`을 생략하세요.
Secure 쿠키를 삭제하려면 HTTPS를 사용하세요.

## 완료 시점과 입력 검증

Android의 `clearCookieSync`는 쿠키를 만료시키는 쓰기를 요청한 뒤, 수락 여부를 확인하지 않고 반환합니다.
`clearCookie`는 CookieManager가 쓰기를 수락할 때까지 기다립니다. 어느 메서드도 삭제 전에 쿠키가 존재했는지는 알려 주지 않습니다.
Apple에서는 선택한 cookie store의 삭제 작업이 끝나면 완료됩니다.

삭제할 쿠키를 지정하려면 유효한 `name`, `/`로 시작하는 절대 `path`, URL과 호환되는 `domain`이 필요합니다.
입력이 잘못되면 쿠키를 변경하기 전에 실패합니다. 자세한 동작은 [쿠키 삭제](../reference/deletion)와 [Errors](../reference/errors)에서 확인하세요.

## 다른 domain을 유지하며 로그아웃 {#targeted-logout}

로그인에 사용한 모든 쿠키의 식별 정보를 보관하세요. 이름이 같아도 path가 다르면 별도 쿠키입니다.
Apple에서는 선택한 cookie store도 기억해야 합니다. Android에서는 조회 결과로 scope를 복원하지 못하므로 저장할 때 기록하세요.

```ts
import NitroCookies, {
  type CookieIdentifier,
} from "react-native-nitro-cookies";

const url = "https://api.example.com/account";
const identities: CookieIdentifier[] = [
  { name: "session", domain: "api.example.com", path: "/" },
  { name: "session", domain: "api.example.com", path: "/account" },
];

for (const identity of identities) {
  await NitroCookies.clearCookie(url, identity);
}
```

이 Next 예제는 기본 cookie store에서 지정한 식별 정보에 해당하는 쿠키만 삭제합니다.
iOS WebKit으로 로그인했다면 각 `clearCookie` 호출의 세 번째 인자에 `true`를 전달하세요.
각 domain과 호환되는 URL을 사용해야 합니다. 하나의 URL로 관계없는 domain을 모두 선택할 수는 없습니다.

`clearAll`은 관계없는 domain을 포함해 선택한 cookie store 전체를 비웁니다. Store 전체를 초기화하려는 경우에만 사용하세요.
로컬 쿠키를 삭제해도 서버의 session이 무효화되거나 다른 cookie store·HTTP client의 인증 정보가 삭제되지는 않습니다.
앱의 인증 흐름에 맞게 서버 로그아웃과 client별 정리를 함께 처리하세요.
