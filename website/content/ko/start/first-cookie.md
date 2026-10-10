# 첫 쿠키 저장하기

Session cookie를 저장하고 다시 읽은 뒤 HTTP request header를 만들어 보세요.
먼저 [설치](./installation)를 마치고 native 앱을 실행하세요.
Android에서는 앱에 WebView 화면이 없어도 정상적으로 동작하는 WebView provider가 필요합니다.

## 1. 쿠키 저장

개발용 버튼의 async handler 등 `await`를 사용할 수 있는 곳에서 다음 코드를 실행하세요.

```ts
import NitroCookies from "react-native-nitro-cookies";

const url = "https://api.example.com";

await NitroCookies.set(url, {
  name: "demo_session",
  value: "demo-token",
  path: "/",
  secure: true,
});
```

이 호출은 기본 cookie store를 사용합니다. Apple에서는 shared cookie store를, Android에서는 CookieManager를 사용합니다.
`demo-token`은 예제용 값입니다. 실제 인증에는 서버가 발급한 token을 사용하세요.

## 2. 값 조회

Android의 `set()`은 CookieManager에 쓰기를 요청한 뒤, CookieManager가 이를 수락했는지 기다리지 않고 완료됩니다.
바로 조회하면 결과가 비어 있을 수 있습니다. `await set()`만으로 저장 완료를 판단하지 말고, 인증에 사용하기 전에 쿠키가 조회되는지 확인하세요.

```ts
const cookies = await NitroCookies.get(url);
const matches = cookies.demo_session?.value === "demo-token";
// 저장한 값이 조회되면 true
```

`get`은 쿠키 이름을 key로 삼는 dictionary를 반환합니다. 일치하는 쿠키가 없으면 `{}`를 반환합니다.
같은 이름의 쿠키를 빠짐없이 조회하려면 [list API](../reference/reading#getlist)를 사용하세요.

## 3. Request header 생성

```ts
const header = await NitroCookies.getCookieHeader(url);
// demo_session=demo-token 포함
```

실제 요청 URL을 path까지 포함해 전달하세요. `fetch`에 header를 직접 전달하는 예제는 [request header 보내기](../guides/request-headers)에서 확인하세요.
실제 인증 쿠키를 로그에 남기지 마세요.

## 4. 예제용 쿠키 삭제

```ts
await NitroCookies.clearByName(url, "demo_session");
```

이 예제에서는 다른 쿠키와 겹치지 않는 이름과 `/` path를 사용합니다. 같은 이름의 쿠키가 여러 scope에 있다면 [scope를 지정해 삭제](../guides/scoped-deletion)하세요.

쿠키가 조회되지 않으면 [플랫폼 지원](../reference/platforms)에서 URL, cookie store, native 앱 재빌드 여부, Android WebView provider 상태를 확인하세요.
