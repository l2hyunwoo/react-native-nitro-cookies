# 설치

Nitro Cookies와 native runtime을 설치한 뒤 React Native 앱을 다시 빌드하세요.
이 가이드는 iOS 또는 Android 빌드가 가능한 기존 React Native 프로젝트를 기준으로 설명합니다.

## 문서 버전 확인

이 사이트는 소스 브랜치의 API를 설명하는 **Next** 문서입니다. List API, scope를 지정하는 삭제 API, error normalization은 아직 출시하지 않았습니다.
현재 `package.json`의 버전은 `1.2.1`이지만, 새 API를 이 버전으로 배포했다는 뜻은 아닙니다.
npm 패키지에서 Next API를 사용하기 전에 [릴리스 이력](https://github.com/l2hyunwoo/react-native-nitro-cookies/releases)을 확인하세요.

배포된 `1.2.1`에는 list 조회, `clearCookie*`, runtime에서 사용할 수 있는 `CookieErrorCode` export가 없습니다.
소스 브랜치에서는 기존 API의 동작도 바뀌었습니다. Apple request header의 URL 매칭, tvOS 지원, Android에서 WebView를 사용할 수 없을 때의 오류가 여기에 포함됩니다.
패키지 manifest의 버전이 그대로라고 해서 이 변경 사항이 배포됐다고 판단하면 안 됩니다. 사용 중인 릴리스에 이 변경 사항이 포함됐는지 확인하세요.

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

소스 브랜치에는 `react-native-nitro-modules >=0.35.0 <1.0.0`이 필요합니다.
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

## 소스에서 Next API 확인

아직 배포하지 않은 Next API를 확인하려면 저장소의 예제 앱을 사용하세요.

```sh
git clone https://github.com/l2hyunwoo/react-native-nitro-cookies.git
cd react-native-nitro-cookies
git checkout 80feca9fa2b347d37bb1f87fea59dda1150e9978
corepack enable
yarn install --immutable
yarn nitrogen
```

예제 앱의 native 빌드 설정을 마친 뒤 실행하세요. 위 명령은 기여자가 소스를 직접 확인할 때 사용합니다. npm 패키지 설치용 명령은 아닙니다.

설치를 마쳤다면 [첫 쿠키를 저장하고 조회](./first-cookie)해 보세요.
저장소에 설정한 dependency 조합은 [플랫폼 지원](../reference/platforms#repository-configurations)에서 확인하세요.
설치나 쿠키 작업이 실패하면 [트러블슈팅](../guides/troubleshooting)을 참고하세요.
