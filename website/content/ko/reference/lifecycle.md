# Session cookie와 디스크 저장

이 메서드들은 Android에서만 쿠키에 영향을 줍니다. Apple에서는 기존 API와의 호환성을 위해 아무 작업도 하지 않습니다.
URL이나 WebKit cookie store를 선택하는 인자는 받지 않습니다.

## flush

```ts
flush(): Promise<void>
```

Android에서는 `CookieManager.flush()`를 호출해 현재 쿠키를 디스크에 저장합니다. Promise는 값 없이 resolve됩니다. iOS와 tvOS에서는 아무 작업 없이 완료되며, WebKit cookie store도 flush하지 않습니다.

## removeSessionCookies

```ts
removeSessionCookies(): Promise<boolean>
```

Android에서는 만료 시각이 없는 session cookie를 삭제하고, 플랫폼이 알려 주는 삭제 여부를 반환합니다. iOS와 tvOS에서는 쿠키를 삭제하지 않고 `false`를 반환합니다.

[Types](./types) · [Errors](./errors) · [플랫폼 지원](./platforms)
