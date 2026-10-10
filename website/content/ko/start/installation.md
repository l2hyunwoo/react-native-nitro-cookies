# 설치

Nitro Cookies와 native runtime을 설치한 뒤 React Native 앱을 다시 빌드하세요.
이 가이드는 iOS 또는 Android 빌드가 가능한 기존 React Native 프로젝트를 기준으로 설명합니다.

## 문서 버전 확인

이 문서는 Nitro Cookies **1.3.0**을 기준으로 설명합니다. List API, scope를 지정하는 삭제 API, error normalization, runtime `CookieErrorCode` export는 1.3.0부터 지원합니다.

1.2.1 이하를 사용 중이라면 1.3.0으로 업데이트하고 native 앱을 다시 빌드하세요. Apple request header의 URL 매칭, tvOS 지원, Android WebView 오류 처리 변경은 [1.3.0 릴리스 노트](https://github.com/l2hyunwoo/react-native-nitro-cookies/releases/tag/v1.3.0)에서 확인하세요.

## 패키지 설치

::: code-group

```sh [npm]
npm install react-native-nitro-cookies react-native-nitro-modules
```

```sh [yarn]
yarn add react-native-nitro-cookies react-native-nitro-modules
```

```sh [pnpm]
pnpm add react-native-nitro-cookies react-native-nitro-modules
```

:::

Nitro Cookies 1.3.0에는 `react-native-nitro-modules >=0.35.0 <1.0.0`이 필요합니다.
설치한 Nitro runtime과 호환되는 React Native 버전을 사용하세요.
iOS deployment target은 React Native 설정을 따릅니다. Android 라이브러리의 기본 최소 지원 버전은 API 24이며, 앱 설정에 따라 더 높은 버전이 필요할 수 있습니다.

## Native 앱 다시 빌드

iOS에서는 앱의 `ios/` 디렉터리에서 Pod를 설치하세요.

```sh
bundle exec pod install
```

Bundler를 사용하지 않는 프로젝트라면 `pod install`을 실행하세요.
이어서 앱을 다시 빌드하고 실행하세요. Metro에서 앱을 reload하는 것만으로는 새 native module을 사용할 수 없습니다.
Android는 autolinking을 사용합니다. 패키지를 설치한 뒤 Android 앱도 다시 빌드하고 실행하세요.

## Expo 프로젝트

두 native 패키지를 포함한 development build를 사용하세요. 설치·실행·재빌드 절차는 [Expo development build](./expo-development-build)를 참고하세요.
Expo Go에는 이 모듈이 포함되어 있지 않습니다. Native dependency가 바뀌면 development client를 다시 빌드해야 합니다.

## 소스에서 1.3.0 예제 실행

1.3.0 API를 직접 확인하려면 저장소의 예제 앱을 사용하세요.

```sh
git clone https://github.com/l2hyunwoo/react-native-nitro-cookies.git
cd react-native-nitro-cookies
git checkout v1.3.0
corepack enable
yarn install --immutable
yarn nitrogen
```

예제 앱의 native 빌드 설정을 마친 뒤 실행하세요. 위 명령은 기여자가 소스를 직접 확인할 때 사용합니다. npm 패키지 설치용 명령은 아닙니다.

설치를 마쳤다면 [첫 쿠키를 저장하고 조회](./first-cookie)해 보세요.
저장소에 설정한 dependency 조합은 [플랫폼 지원](../reference/platforms#repository-configurations)에서 확인하세요.
설치나 쿠키 작업이 실패하면 [트러블슈팅](../guides/troubleshooting)을 참고하세요.
