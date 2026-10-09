# 설치

Nitro Cookies와 네이티브 런타임을 설치한 뒤 React Native 앱을 다시 빌드합니다.
이 문서는 iOS 또는 Android 빌드가 가능한 기존 네이티브 프로젝트를 기준으로 설명합니다.

## 문서 버전 확인

이 사이트는 소스 브랜치를 설명하는 **Next** 문서입니다. 목록 조회, 범위 삭제, 오류 정규화는 미출시 변경입니다.
현재 패키지 매니페스트의 버전은 `1.2.1`이지만, 이 번호가 새 API의 npm 배포를 뜻하지는 않습니다.
npm 패키지에서 Next API를 사용하기 전에 [릴리스 이력](https://github.com/l2hyunwoo/react-native-nitro-cookies/releases)을 확인하세요.

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

소스 브랜치는 `react-native-nitro-modules >=0.35.0 <1.0.0`을 요구합니다.
설치한 Nitro 런타임과 호환되는 React Native 버전을 사용하세요.
iOS 배포 대상 버전은 React Native 설정을 따릅니다. Android 라이브러리의 기본 최소 버전은 API 24이며, 앱이 더 높은 버전을 요구할 수 있습니다.

## 네이티브 앱 다시 빌드

iOS에서는 앱의 `ios/` 디렉터리에서 Pod를 설치합니다.

```sh
bundle exec pod install
```

Bundler를 사용하지 않는 프로젝트라면 `pod install`을 실행하세요.
그다음 앱을 다시 빌드하고 실행합니다. Metro 새로고침만으로 새 네이티브 모듈을 설치할 수는 없습니다.
Android는 자동 연결을 사용합니다. 패키지 설치 후 Android 앱도 다시 빌드하고 실행하세요.

## Expo 프로젝트

두 네이티브 패키지를 포함한 [개발 빌드](https://docs.expo.dev/workflow/customizing/)를 사용하세요.
Expo Go에는 이 모듈이 포함되어 있지 않습니다. 네이티브 의존성이 바뀌면 개발 클라이언트를 다시 빌드해야 합니다.

## 소스에서 Next API 확인

이 Next 소스 버전을 검증하려면 저장소의 예제 앱을 사용하세요.

```sh
git clone https://github.com/l2hyunwoo/react-native-nitro-cookies.git
cd react-native-nitro-cookies
git checkout 80feca9fa2b347d37bb1f87fea59dda1150e9978
corepack enable
yarn install --immutable
yarn nitrogen
```

예제 앱의 네이티브 빌드 설정을 완료한 뒤 실행하세요. 이 명령은 기여자용 소스 체크아웃이며 npm 패키지 설치 명령이 아닙니다.

다음으로 [첫 쿠키](./first-cookie)를 저장해 보세요.
