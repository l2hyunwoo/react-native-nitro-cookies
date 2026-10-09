#!/usr/bin/env bash
set -euo pipefail

repo=$(cd "$(dirname "$0")/../.." && pwd)
fixture="$repo/build/tvos"
mkdir -p "$fixture"
cp "$repo/.github/fixtures/tvos/"* "$fixture/"
# A separate Yarn project keeps the example's iOS React Native dependency intact.
touch "$fixture/yarn.lock"
cd "$fixture"
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install --mode=skip-build

export NITRO_COOKIES_ROOT="$repo"
ruby create-project.rb
pod install

xcodebuild build-for-testing \
  -workspace NitroCookiesTV.xcworkspace -scheme NitroCookiesTV \
  -destination 'generic/platform=tvOS Simulator' \
  -derivedDataPath DerivedData ARCHS="$(uname -m)" CODE_SIGNING_ALLOWED=NO

device=$(xcrun simctl list devices available --json | node -e '
  const { devices } = JSON.parse(require("fs").readFileSync(0, "utf8"));
  const device = Object.entries(devices)
    .filter(([runtime]) => runtime.includes(".tvOS-"))
    .flatMap(([, available]) => available)[0];
  if (!device) {
    console.error("No available tvOS simulator; install a tvOS runtime in Xcode.");
    process.exit(1);
  }
  process.stdout.write(device.udid);
')

rm -rf TestResults.xcresult
xcodebuild test-without-building \
  -workspace NitroCookiesTV.xcworkspace -scheme NitroCookiesTV \
  -destination "platform=tvOS Simulator,id=$device" \
  -derivedDataPath DerivedData \
  -resultBundlePath TestResults.xcresult \
  -parallel-testing-enabled NO -test-timeouts-enabled YES \
  -maximum-test-execution-time-allowance 60 CODE_SIGNING_ALLOWED=NO
