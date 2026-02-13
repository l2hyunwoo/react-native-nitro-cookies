import {
  androidPlatform,
  physicalAndroidDevice,
} from '@react-native-harness/platform-android';
import {
  applePlatform,
  appleSimulator,
} from '@react-native-harness/platform-apple';

export default {
  entryPoint: './index.js',
  appRegistryComponentName: 'NitroCookiesExample',

  runners: [
    androidPlatform({
      name: 'android',
      device: physicalAndroidDevice('samsung', 'SM-S926N'),
      bundleId: 'nitrocookies.example',
    }),
    applePlatform({
      name: 'ios',
      device: appleSimulator('iPhone 16 Pro', '18.0'),
      bundleId: 'nitrocookies.example',
    }),
  ],
  defaultRunner: 'android',
};
