#!/usr/bin/env bash
set -euo pipefail

repo=$(cd "$(dirname "$0")/../.." && pwd)
platform=${1:?Usage: test-apple.sh ios|tvos}
case "$platform" in
  ios) simulator='iOS Simulator'; runtime='.iOS-' ;;
  tvos) simulator='tvOS Simulator'; runtime='.tvOS-' ;;
  *) echo "Unsupported platform: $platform" >&2; exit 1 ;;
esac

device=$(xcrun simctl list devices available --json | node -e '
  const { devices } = JSON.parse(require("fs").readFileSync(0, "utf8"));
  const device = Object.entries(devices)
    .filter(([runtime]) => runtime.includes(process.argv[1]))
    .flatMap(([, available]) => available)[0];
  if (!device) {
    console.error("No available simulator; install the requested platform runtime in Xcode.");
    process.exit(1);
  }
  process.stdout.write(device.udid);
' "$runtime")

fixture="$repo/build/$platform"
mkdir -p "$fixture"
rm -f "$fixture/"*.swift
cp "$repo/.github/fixtures/apple/"* "$repo/.github/fixtures/$platform/"* "$fixture/"
# A separate Yarn project keeps the example's React Native dependency intact.
touch "$fixture/yarn.lock"
cd "$fixture"
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install --mode=skip-build

export NITRO_COOKIES_ROOT="$repo"
export NITRO_COOKIES_PLATFORM="$platform"
ruby create-project.rb
pod install

xcodebuild build-for-testing \
  -workspace NitroCookiesHost.xcworkspace -scheme NitroCookiesHost \
  -destination "generic/platform=$simulator" \
  -derivedDataPath DerivedData ARCHS="$(uname -m)" CODE_SIGNING_ALLOWED=NO

rm -rf TestResults.xcresult
xcodebuild test-without-building \
  -workspace NitroCookiesHost.xcworkspace -scheme NitroCookiesHost \
  -destination "platform=$simulator,id=$device" \
  -derivedDataPath DerivedData \
  -resultBundlePath TestResults.xcresult \
  -parallel-testing-enabled NO -test-timeouts-enabled YES \
  -maximum-test-execution-time-allowance 60 CODE_SIGNING_ALLOWED=NO
