# Expo development build

Nitro Cookies와 `react-native-nitro-modules`를 포함한 development build를 사용하세요.
Expo Go에는 두 native module이 포함되어 있지 않습니다. JavaScript 패키지를 설치하거나 Metro를 reload해도 Expo Go에 native code를 추가할 수 없습니다.

이 가이드는 Expo SDK 56, React Native 0.85.3, Nitro Modules 0.35.9를 사용합니다.
같은 구성을 재현할 수 있도록 blank TypeScript template의 버전을 고정합니다.
아래 설치 명령은 Nitro Cookies 1.3.0을 사용합니다. API 지원 버전은 [설치 문서](./installation)에서 확인하세요.

## 앱 생성

Node.js 20.19 이상과 대상 플랫폼의 native build 도구를 설치하세요.
iOS 로컬 빌드에는 macOS, Xcode 26.4 이상, CocoaPods가 필요합니다.
Android 로컬 빌드에는 Android SDK, emulator 또는 기기, 호환되는 JDK가 필요합니다. 아래 검증에는 JDK 17을 사용합니다.
플랫폼 도구 설치는 [Expo 환경 설정](https://docs.expo.dev/get-started/set-up-your-environment/)을 참고하세요.

```sh
npx create-expo@4.0.4 cookie-check \
  --template expo-template-blank-typescript@56.0.37 --yes --no-install
cd cookie-check
npm install
npx expo install expo-dev-client@56.0.27
npm install --save-exact react-native-nitro-cookies@1.3.0 \
  react-native-nitro-modules@0.35.9
```

이 구성에는 Nitro Cookies용 config plugin이나 native module 수동 등록이 필요하지 않습니다. Native 패키지는 autolinking을 사용합니다.
설치된 dependency 버전을 유지하려면 생성된 lockfile을 보관하세요.

## Native 프로젝트 생성과 빌드

SDK 56 구성을 재현하려면 native template 버전도 고정하세요.

```sh
curl -fsSL https://registry.npmjs.org/expo-template-bare-minimum/-/expo-template-bare-minimum-56.0.37.tgz \
  -o expo-template-bare-minimum-56.0.37.tgz
npx expo prebuild --template ./expo-template-bare-minimum-56.0.37.tgz
```

이어서 사용할 플랫폼을 빌드하세요.

```sh
npx expo run:ios
# Or:
npx expo run:android
```

이 명령은 앱을 빌드하고 설치한 뒤 실행합니다. 먼저 iOS simulator 또는 Android emulator를 준비하세요.
기기를 선택하려면 `--device`를 사용하세요. 실제 iPhone에서는 `app.json`에 고유한 `ios.bundleIdentifier`를 설정하고 Expo의 signing 절차도 따르세요.
prebuild를 먼저 실행하지 않아도 native 디렉터리가 없으면 run 명령이 자동으로 생성합니다.

## Native cookie 접근 확인

버튼의 async handler에서 아래 함수를 호출하세요. 성공하면 반환된 문구를, 실패하면 catch한 오류를 화면에 표시하세요.
실행할 때마다 새 값을 사용해 이전에 저장한 쿠키로 검사가 잘못 통과하지 않도록 합니다.

```ts
import NitroCookies from "react-native-nitro-cookies";

async function checkCookies(): Promise<string> {
  const url = "https://expo-cookie-check.example";
  const name = "expo_development_check";
  const value = String(Date.now());

  await NitroCookies.set(url, { name, value, path: "/", secure: true });

  for (let attempt = 0; attempt < 20; attempt++) {
    const cookies = await NitroCookies.get(url);
    if (cookies[name]?.value === value) {
      return "PASS: native cookie set/get";
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Cookie was not visible within 2 seconds");
}
```

Android의 `set()`은 CookieManager에 쓰기를 요청한 뒤 수락 여부를 기다리지 않고 완료됩니다. `await set()` 직후에는 `get()` 결과가 비어 있을 수 있습니다.
이 검사는 제한된 시간 동안 재조회합니다. API의 완료 조건을 바꾸지는 않습니다. `flush()`도 쓰기 수락을 기다리는 수단이 아닙니다.
예제는 기본 cookie store를 사용하며 HTTP 요청을 보내지 않습니다. 통과하면 native module 로딩과 쿠키 저장·조회를 확인한 것입니다. WebView나 HTTP client의 쿠키 공유를 검증한 결과는 아닙니다.
앱에 WebView 화면이 없어도 Android에는 정상적으로 동작하는 WebView provider가 필요합니다.

## 개발 이어가기

Development build를 설치한 뒤에는 다음 명령으로 Metro를 시작하세요.

```sh
npx expo start --dev-client
```

JavaScript만 바뀌면 설치된 client에서 reload할 수 있습니다. Native dependency나 앱의 native 설정이 바뀌면 native 프로젝트를 다시 생성하고 빌드하세요.

```sh
npx expo prebuild --clean --template ./expo-template-bare-minimum-56.0.37.tgz
npx expo run:ios
# Or:
npx expo run:android
```

`--clean`은 `ios/`와 `android/`를 삭제하고 다시 만듭니다. 이 디렉터리에서 직접 수정한 내용도 사라집니다. Native 설정 변경을 app config나 config plugin에 옮긴 뒤 사용하세요.
Metro 재시작만으로 native dependency가 다시 빌드되지는 않습니다.

## 로컬 소스 변경 사항 테스트

배포된 1.3.0 이후의 로컬 변경 사항을 테스트하려면 source tarball을 설치하세요.
소스를 테스트하려면 저장소 checkout에서 라이브러리를 빌드하고 tarball로 묶으세요. Expo 앱의 native 프로젝트를 생성하기 전에 이 tarball을 설치하세요.

```sh
# Repository root:
corepack enable
yarn install --immutable
yarn package prepare
yarn package pack --out /tmp/react-native-nitro-cookies-source.tgz

# Expo app directory:
npm install /tmp/react-native-nitro-cookies-source.tgz
```

`prepare`는 JavaScript, 타입, Nitro binding을 빌드합니다. `pack`은 패키지에 문서를 넣는 단계도 실행합니다.
소스를 테스트할 때 `npm install react-native-nitro-cookies@1.3.0`로 대체하면 npm 배포본이 설치됩니다.
소스를 바꿔 다시 묶을 때는 새 tarball 파일명을 사용하세요. 앱에 다시 설치한 뒤 development client를 재빌드하세요.

## 검증한 구성

Expo `56.0.23`, React Native `0.85.3`, Nitro Modules `0.35.9`, `expo-dev-client` `56.0.27` 조합에서 위 검사를 실행했습니다.
iPhone 17 Pro simulator의 iOS 26.5와 Android 15 (API 35) emulator에서 development build를 설치하고 `set()`·`get()` 검사가 통과하는지 확인했습니다. Android 빌드에는 JDK 17을 사용했습니다.

검증 대상은 commit [`827a165`](https://github.com/l2hyunwoo/react-native-nitro-cookies/commit/827a1655ef2f227982f6aefe84f6b08a826e2d62)의 source tarball입니다. 당시 검증에서 npm 1.3.0 배포본을 별도로 실행하지는 않았습니다.
다른 SDK 조합, EAS build, WebView·HTTP client와의 쿠키 공유는 검증 범위에 포함하지 않습니다.

## 참고 자료

- [Expo development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo SDK와 React Native 버전](https://docs.expo.dev/versions/latest/)
- [Native generation과 clean 동작](https://docs.expo.dev/workflow/continuous-native-generation/)
- [Expo CLI의 development client 실행 대상](https://docs.expo.dev/more/expo-cli/#launch-target)
