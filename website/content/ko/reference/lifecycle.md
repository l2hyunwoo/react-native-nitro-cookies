# 영속 저장과 세션

이 작업은 Android에서만 효과가 있습니다. Apple 구현은 호환성을 위해 아무 작업도 하지 않는 동작을 유지합니다.
URL이나 WebKit 저장소 선택 인자를 받지 않습니다.

## flush

```ts
flush(): Promise<void>
```

Android에서는 CookieManager.flush()로 현재 쿠키를 디스크에 저장합니다. 반환값 없이 완료합니다. iOS와 tvOS에서는 작업 없이 완료하며 WebKit 저장소를 flush하지 않습니다.

## removeSessionCookies

```ts
removeSessionCookies(): Promise<boolean>
```

Android에서는 영속 만료가 없는 쿠키를 삭제하고 플랫폼의 삭제 여부를 반환합니다. iOS와 tvOS에서는 삭제하지 않고 false를 반환합니다.

[타입](./types) · [오류](./errors) · [플랫폼 지원](./platforms)
