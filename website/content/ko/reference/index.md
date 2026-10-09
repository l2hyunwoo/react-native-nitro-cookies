# API 개요

기본 `NitroCookies` 객체를 import하면 23개 연산에 접근할 수 있습니다.
이 참조 문서의 시그니처는 해당 객체의 메서드를 나타냅니다.

```ts
import NitroCookies, {
  CookieErrorCode,
  type Cookie,
  type CookieIdentifier,
  type Cookies,
  type CookieError,
} from "react-native-nitro-cookies";
```

## 작업별 메서드

| 작업                     | 메서드                                                                               | 참조                            |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------- |
| 저장된 쿠키 조회         | `getSync`, `get`, `getListSync`, `getList`, `getAll`, `getAllList`                   | [쿠키 조회](./reading)          |
| 쿠키 저장                | `setSync`, `set`, `setManySync`, `setMany`, `setFromResponseSync`, `setFromResponse` | [쿠키 저장](./writing)          |
| 헤더 생성·응답 쿠키 조회 | `getCookieHeaderSync`, `getCookieHeader`, `getFromResponse`, `getFromResponseList`   | [헤더와 응답](./requests)       |
| 쿠키 삭제                | `clearCookieSync`, `clearCookie`, `clearByNameSync`, `clearByName`, `clearAll`       | [쿠키 삭제](./deletion)         |
| 영속 저장·세션 쿠키 삭제 | `flush`, `removeSessionCookies`                                                      | [영속 저장과 세션](./lifecycle) |

## 공통 규칙

- URL이 필요한 곳에는 전체 HTTP(S) URL을 전달하세요.
- `useWebKit`은 옵션 객체가 아닌 선택적 boolean 인자입니다. 기본값은 `false`입니다.
- 동기 메서드는 기본 저장소를 사용합니다. 비동기 메서드는 Promise를 반환하지만 완료 보장은 플랫폼과 연산에 따라 다릅니다.
- 딕셔너리는 쿠키 이름을 키로 사용합니다. 목록은 같은 이름을 보존합니다.
- Next 래퍼의 실패에는 문자열 `code`가 있습니다. 복구를 구현하기 전에 [오류 계약](./errors)을 확인하세요.

목록·범위 삭제 API와 오류 정규화 계약은 **Next 변경**입니다.
소스 문서와 npm 릴리스의 차이는 [설치](../start/installation)에서 확인하세요.

데이터 형태는 [타입](./types), 사용 가능 여부는 [플랫폼 지원](./platforms)에서 확인할 수 있습니다.
