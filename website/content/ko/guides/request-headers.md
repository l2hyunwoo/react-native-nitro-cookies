# 요청 헤더 보내기

직접 만드는 요청의 정확한 URL에 맞춰 `Cookie` 헤더를 생성합니다.
네트워크 계층에 헤더를 명시적으로 전달해야 할 때 사용하세요.

## 조회 후 전송

```ts
import NitroCookies from "react-native-nitro-cookies";

const url = "https://api.example.com/admin/profile";
const cookieHeader = await NitroCookies.getCookieHeader(url);

const response = await fetch(url, {
  headers: cookieHeader ? { Cookie: cookieHeader } : {},
});
```

전체 요청 경로를 전달하세요. `/admin` 쿠키는 `/admin/profile`에 일치하지만 `/administrator`에는 일치하지 않습니다.
Secure 쿠키에는 HTTPS가 필요합니다. 일치하는 HttpOnly 쿠키와 같은 이름의 쿠키도 헤더에 포함됩니다.
일치하는 쿠키가 없으면 `''`를 반환하므로 예제에서는 헤더를 생략합니다.

Promise 없이 기본 저장소에 접근하려면 `getCookieHeaderSync(url)`을 호출하세요.
iOS WebKit 저장소를 사용하려면 `getCookieHeader(url, true)`를 호출하세요.

## 요청 대상 유지

헤더는 전달한 URL에 대한 시점별 결과입니다. 요청 대상이 바뀌면 다시 생성하세요.
다른 호스트에 인증 헤더를 재사용하거나 리다이렉트된 URL에도 같은 헤더가 맞는다고 가정하지 마세요.
리다이렉트와 자체 쿠키 동작은 네트워크 계층이 결정합니다. 이 라이브러리가 해당 정책을 설정하지는 않습니다.

`get`이나 `getList` 결과로 요청 헤더를 직접 만들지 마세요. Apple에서는 두 조회 API의 선택 규칙이 요청 헤더 API와 다릅니다.
전체 시그니처는 [헤더와 응답](../reference/requests)에서 확인하세요.
