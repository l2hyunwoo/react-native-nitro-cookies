import { describe, test, expect } from "react-native-harness";
import { Platform } from "react-native";
import NitroCookies, { CookieErrorCode } from "react-native-nitro-cookies";
import type { CookieError } from "react-native-nitro-cookies";

const url = "https://normalization-evidence.example";
const cookie = {
  name: "session",
  value: "private-value",
  domain: "other.example",
};
const invalidIdentifier = { name: "session", path: "relative" };

function check(
  error: unknown,
  code: CookieErrorCode,
  suppliedUrl?: string,
  name?: string,
) {
  const failure = error as CookieError;
  expect(failure instanceof Error).toBe(true);
  expect(failure.code).toBe(code);
  expect(failure.url).toBe(suppliedUrl);
  expect(failure.cookieName).toBe(name);
  expect(failure.cause).toBeDefined();
  expect(failure.message.length).toBeGreaterThan(0);
  expect(Object.prototype.hasOwnProperty.call(failure, "value")).toBe(false);
  console.log(
    JSON.stringify({
      platform: Platform.OS,
      code: failure.code,
      nativeMessage: failure.message,
    }),
  );
}

type Scenario = {
  name: string;
  call: () => unknown;
  code: CookieErrorCode;
  url?: string;
  cookieName?: string;
};

describe("Public error codes across the real Nitro bridge", () => {
  const syncCases: Scenario[] = [
    {
      name: "getSync invalid URL",
      call: () => NitroCookies.getSync(""),
      code: CookieErrorCode.INVALID_URL,
      url: "",
    },
    {
      name: "getListSync invalid URL",
      call: () => NitroCookies.getListSync(""),
      code: CookieErrorCode.INVALID_URL,
      url: "",
    },
    {
      name: "setSync domain mismatch",
      call: () => NitroCookies.setSync(url, cookie),
      code: CookieErrorCode.DOMAIN_MISMATCH,
      url,
      cookieName: "session",
    },
    {
      name: "clearCookieSync invalid scope",
      call: () => NitroCookies.clearCookieSync(url, invalidIdentifier),
      code: CookieErrorCode.PARSE_ERROR,
      url,
      cookieName: "session",
    },
  ];
  for (const scenario of syncCases) {
    test(scenario.name, () => {
      let failure: unknown;
      try {
        scenario.call();
      } catch (error) {
        failure = error;
      }
      check(failure, scenario.code, scenario.url, scenario.cookieName);
    });
  }

  const asyncCases: Scenario[] = [
    {
      name: "get invalid URL",
      call: () => NitroCookies.get(""),
      code: CookieErrorCode.INVALID_URL,
      url: "",
    },
    {
      name: "getList invalid URL",
      call: () => NitroCookies.getList(""),
      code: CookieErrorCode.INVALID_URL,
      url: "",
    },
    {
      name: "set domain mismatch",
      call: () => NitroCookies.set(url, cookie),
      code: CookieErrorCode.DOMAIN_MISMATCH,
      url,
      cookieName: "session",
    },
    {
      name: "clearCookie invalid scope",
      call: () => NitroCookies.clearCookie(url, invalidIdentifier),
      code: CookieErrorCode.PARSE_ERROR,
      url,
      cookieName: "session",
    },
  ];
  if (Platform.OS === "android") {
    asyncCases.push({
      name: "getAll unsupported",
      call: () => NitroCookies.getAll(),
      code: CookieErrorCode.PLATFORM_UNSUPPORTED,
      url: undefined,
    });
    asyncCases.push({
      name: "getAllList unsupported",
      call: () => NitroCookies.getAllList(),
      code: CookieErrorCode.PLATFORM_UNSUPPORTED,
      url: undefined,
    });
  }
  for (const scenario of asyncCases) {
    test(scenario.name, async () => {
      let failure: unknown;
      try {
        await scenario.call();
      } catch (error) {
        failure = error;
      }
      check(failure, scenario.code, scenario.url, scenario.cookieName);
    });
  }

  test("successful list and scoped deletion retain their results", async () => {
    const request = `${url}/admin/page`;
    for (const path of ["/", "/admin"]) {
      expect(
        await NitroCookies.set(request, {
          name: "session",
          value: path,
          path,
          domain: ".normalization-evidence.example",
          httpOnly: false,
        }),
      ).toBe(true);
    }
    const listed = await NitroCookies.getList(request);
    expect(
      listed
        .filter((item) => item.name === "session")
        .map((item) => item.value)
        .sort(),
    ).toEqual(["/", "/admin"]);
    await NitroCookies.clearCookie(request, {
      name: "session",
      path: "/admin",
      domain: ".normalization-evidence.example",
    });
    expect(
      (await NitroCookies.getList(request))
        .filter((item) => item.name === "session")
        .map((item) => item.value),
    ).toEqual(["/"]);
    await NitroCookies.clearCookie(request, {
      name: "session",
      path: "/",
      domain: ".normalization-evidence.example",
    });
    expect(
      (await NitroCookies.getList(request)).filter(
        (item) => item.name === "session",
      ),
    ).toEqual([]);
  });
});
