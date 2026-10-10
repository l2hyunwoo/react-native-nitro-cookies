# Request header 보내기

HTTP 요청에 맞는 `Cookie` header를 만들어 직접 전달하는 방법입니다.
사용 중인 네트워크 라이브러리에 header를 직접 전달해야 할 때 사용하세요.

## Header를 조회한 뒤 요청에 전달

```ts
import NitroCookies from "react-native-nitro-cookies";

const url = "https://api.example.com/admin/profile";
const cookieHeader = await NitroCookies.getCookieHeader(url);

const response = await fetch(url, {
  headers: cookieHeader ? { Cookie: cookieHeader } : {},
});
```

요청 URL에는 path 전체를 포함하세요. `/admin` 쿠키는 `/admin/profile`에 일치하지만 `/administrator`에는 일치하지 않습니다.
Secure 쿠키를 보내려면 HTTPS를 사용해야 합니다. URL에 일치하는 HttpOnly 쿠키와 이름이 중복된 쿠키도 header에 포함됩니다.
일치하는 쿠키가 없으면 `''`를 반환하므로, 위 예제는 이때 `Cookie` header를 생략합니다.

Promise 없이 기본 cookie store를 조회하려면 `getCookieHeaderSync(url)`을 호출하세요.
iOS WebKit cookie store를 조회하려면 `getCookieHeader(url, true)`를 호출하세요.

## 요청 URL이 바뀌면 다시 생성

반환된 header는 조회할 때 전달한 URL을 기준으로 만든 값입니다. 요청 URL이 바뀌면 header도 다시 생성하세요.
다른 host로 보내는 요청에 인증 header를 재사용하지 마세요. Redirect 이후 URL에도 같은 header를 보내도 된다고 가정하지 마세요.
Redirect와 자동 쿠키 처리는 네트워크 라이브러리의 정책을 따릅니다. Nitro Cookies는 이 정책을 설정하지 않습니다.

`get`이나 `getList` 결과로 request header를 직접 만들지 마세요. Apple에서는 두 조회 API의 쿠키 선택 규칙이 request header API와 다릅니다.
전체 signature는 [Cookie header와 응답 쿠키](../reference/requests)에서 확인하세요.

## HTTP client와 연결

위 예제는 React Native `fetch`에 header를 직접 전달합니다.
Axios 같은 다른 client에서도 동일한 URL에 보내는 요청의 [headers 옵션](https://axios-http.com/docs/req_config)으로 값을 전달하세요.
요청마다 host와 path가 다를 수 있으므로 인증 header를 전역 기본값으로 설정하지 마세요.

Header를 직접 전달해도 Nitro Cookies와 client 사이의 쿠키 공유나 응답 쿠키 저장이 자동으로 이루어지지는 않습니다.
이 패키지는 client의 credentials, redirect 처리, native cookie jar를 설정하지 않습니다.
설치한 client와 플랫폼 버전에서 각각의 동작을 확인하세요.

WebView 로그인은 [WebView cookie store 선택](./webviews)을 참고하세요.
로그아웃할 때 [필요한 쿠키만 삭제](./scoped-deletion#targeted-logout)할 수 있도록, 로그인에 사용한 cookie store와 쿠키 식별 정보를 보관하세요.
