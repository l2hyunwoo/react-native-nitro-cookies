# 특정 범위의 쿠키 삭제

같은 이름의 쿠키가 여러 개라면 Next `clearCookie` API를 사용하세요.
다른 쿠키를 선택하지 않도록 원래 이름, 도메인, 경로를 전달합니다.

## Apple: 저장된 식별자 유지

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

목록 결과는 앞의 점을 포함해 Apple에 저장된 도메인을 보존합니다. 삭제할 때 같은 표현을 그대로 전달하세요.
iOS WebKit 저장소를 사용한다면 두 비동기 호출에 모두 `true`를 전달하세요.
해당 식별자의 쿠키가 없으면 다른 쿠키를 변경하지 않고 성공합니다.

## Android: 저장할 때 원래 범위 보관

Android URL 목록으로는 저장된 도메인과 경로를 복원할 수 없습니다. 저장할 때 해당 필드를 보관하세요.

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

도메인을 명시하면 앞의 점 유무와 관계없이 Domain 속성을 만듭니다.
기존 Android `set`은 도메인을 생략해도 URL 호스트를 기본값으로 사용해 Domain 속성을 만듭니다.
삭제할 때도 그 도메인을 전달하세요. `set` 인자의 생략만으로 호스트 전용 쿠키라고 판단하지 마세요.

Domain 없는 Set-Cookie 헤더처럼 실제로 호스트 전용으로 저장한 쿠키에만 삭제 도메인을 생략하세요.
Secure 쿠키에는 HTTPS를 사용하세요.

## 완료 시점과 검증

Android의 `clearCookieSync`는 승인 확인 없이 만료 쓰기를 제출합니다.
`clearCookie`는 쓰기 승인까지 기다립니다. 두 메서드 모두 쿠키가 존재했는지는 반환하지 않습니다.
Apple에서는 선택한 저장소의 삭제 작업이 끝나면 완료합니다.

선택자에는 유효한 쿠키 이름, 절대 경로, 호환되는 도메인이 필요합니다.
잘못된 선택자는 변경 전에 실패합니다. [쿠키 삭제](../reference/deletion)와 [오류](../reference/errors)를 확인하세요.
