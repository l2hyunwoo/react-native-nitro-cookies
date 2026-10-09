import { describe, test, expect } from "react-native-harness";
import { Platform } from "react-native";
import NitroCookies, { CookieErrorCode } from "react-native-nitro-cookies";
import type { CookieError } from "react-native-nitro-cookies";

// This fixture requires an Android TV image without a WebView provider.
const tvTests =
  Platform.OS === "android" && Platform.isTV ? describe : describe.skip;
const url = "https://tv-evidence.example";
const cookie = { name: "session", value: "test", path: "/" };
const identifier = { name: "session", path: "/" };
const operations: Array<[string, () => unknown]> = [
  ["getSync", () => NitroCookies.getSync(url)],
  ["getListSync", () => NitroCookies.getListSync(url)],
  ["clearCookieSync", () => NitroCookies.clearCookieSync(url, identifier)],
  ["setSync", () => NitroCookies.setSync(url, cookie)],
  [
    "setFromResponseSync",
    () => NitroCookies.setFromResponseSync(url, "session=test"),
  ],
  ["clearByNameSync", () => NitroCookies.clearByNameSync(url, "session")],
  ["getCookieHeaderSync", () => NitroCookies.getCookieHeaderSync(url)],
  ["setManySync", () => NitroCookies.setManySync(url, [cookie])],
  ["set", () => NitroCookies.set(url, cookie)],
  ["setMany", () => NitroCookies.setMany(url, [cookie])],
  ["getCookieHeader", () => NitroCookies.getCookieHeader(url)],
  ["get", () => NitroCookies.get(url)],
  ["getList", () => NitroCookies.getList(url)],
  ["clearCookie", () => NitroCookies.clearCookie(url, identifier)],
  ["setFromResponse", () => NitroCookies.setFromResponse(url, "session=test")],
  ["clearByName", () => NitroCookies.clearByName(url, "session")],
  ["flush", () => NitroCookies.flush()],
  ["clearAll", () => NitroCookies.clearAll()],
  ["removeSessionCookies", () => NitroCookies.removeSessionCookies()],
];

tvTests("Android TV without a WebView provider", () => {
  for (const [name, operation] of operations) {
    test(`${name} exposes WEBVIEW_UNAVAILABLE through the Nitro bridge`, async () => {
      let failure: unknown;
      try {
        await operation();
      } catch (error) {
        failure = error;
      }
      const error = failure as CookieError;
      expect(error instanceof Error).toBe(true);
      expect(error.code).toBe(CookieErrorCode.WEBVIEW_UNAVAILABLE);
      expect(error.cause).toBeDefined();
    });
  }
});
