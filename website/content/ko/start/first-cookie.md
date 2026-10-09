# 첫 쿠키

세션 쿠키를 저장하고 다시 읽은 뒤 HTTP 요청 헤더를 만듭니다.
먼저 [설치](./installation)를 마치고 네이티브 앱을 실행하세요.
Android에서는 앱에 WebView 화면이 없어도 정상적인 WebView 제공자가 필요합니다.

## 1. 쿠키 저장

개발용 버튼의 클릭 처리 함수처럼 비동기 코드를 실행할 수 있는 곳에서 호출하세요.

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

기본 저장소인 Apple 공유 저장소 또는 Android CookieManager를 사용합니다.
위 값은 시연용 토큰입니다. 실제 인증 흐름에서는 서버가 발급한 토큰을 사용하세요.

## 2. 값 조회

Android의 `set()`은 CookieManager의 승인을 기다리지 않고 쓰기를 제출합니다.
즉시 조회하면 빈 결과가 나올 수 있습니다. 인증에 사용하기 전에 쿠키가 조회되는지 확인하세요. `set()`을 기다리는 것만으로 저장 승인을 확인할 수는 없습니다.

```ts
const cookies = await NitroCookies.get(url);
const matches = cookies.demo_session?.value === "demo-token";
// true once the write is visible
```

`get`은 쿠키 이름을 키로 사용하는 딕셔너리를 반환합니다. 일치하는 쿠키가 없으면 `{}`를 반환합니다.
같은 이름의 쿠키를 모두 보존하려면 Next [목록 API](../reference/reading#getlist)를 사용하세요.

## 3. 요청 헤더 생성

```ts
const header = await NitroCookies.getCookieHeader(url);
// Contains demo_session=demo-token
```

경로를 포함한 실제 요청 URL을 전달하세요. 직접 `fetch` 요청을 만드는 예제는 [요청 헤더 보내기](../guides/request-headers)에서 확인할 수 있습니다.
실제 인증 쿠키를 로그에 남기지 마세요.

## 4. 시연용 쿠키 삭제

```ts
await NitroCookies.clearByName(url, "demo_session");
```

이 예제는 고유한 쿠키 이름과 `/` 경로를 사용합니다. 쿠키 식별자가 겹치는 경우에는 [범위 삭제](../guides/scoped-deletion)를 사용하세요.

쿠키를 찾을 수 없다면 [플랫폼 지원](../reference/platforms)에서 URL, 저장소, 네이티브 재빌드, Android 제공자 상태를 확인하세요.
