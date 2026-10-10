import NitroCookies from "react-native-nitro-cookies";
import { operations } from "../operations";
import type { Inputs } from "../operations";

jest.mock("react-native-nitro-cookies", () => ({
  __esModule: true,
  default: Object.fromEntries(
    [
      "getList",
      "getListSync",
      "get",
      "getSync",
      "getAllList",
      "getAll",
      "getCookieHeader",
      "getCookieHeaderSync",
      "getFromResponseList",
      "getFromResponse",
      "set",
      "setSync",
      "setMany",
      "setManySync",
      "setFromResponse",
      "setFromResponseSync",
      "clearCookie",
      "clearCookieSync",
      "clearByName",
      "clearByNameSync",
      "clearAll",
      "flush",
      "removeSessionCookies",
    ].map((name) => [name, jest.fn()]),
  ),
}));

const input: Inputs = {
  url: "https://example.com/account",
  cookie: {
    name: "demo",
    value: "test",
    domain: ".example.com",
    path: "/account",
    secure: true,
  },
  header: "demo=test; Path=/",
  useWebKit: true,
};

beforeEach(() => jest.clearAllMocks());

test("the scoped fixture retains both paths and forwards the selected store", () => {
  operations.setMany.run(input);
  expect(NitroCookies.setMany).toHaveBeenCalledWith(
    input.url,
    [
      { ...input.cookie, path: "/", value: "root" },
      { ...input.cookie, path: "/account", value: "account" },
    ],
    true,
  );
  operations.clearCookie.run(input);
  expect(NitroCookies.clearCookie).toHaveBeenCalledWith(
    input.url,
    {
      name: "demo",
      domain: ".example.com",
      path: "/account",
    },
    true,
  );
});

test("sync and network operations do not silently select WebKit", () => {
  operations.getListSync.run(input);
  operations.setFromResponse.run(input);
  operations.getFromResponseList.run(input);
  expect(NitroCookies.getListSync).toHaveBeenCalledWith(input.url);
  expect(NitroCookies.setFromResponse).toHaveBeenCalledWith(
    input.url,
    input.header,
  );
  expect(NitroCookies.getFromResponseList).toHaveBeenCalledWith(input.url);
});

test("async rejections reach the screen instead of becoming empty results", async () => {
  const error = Object.assign(new Error("Unavailable"), {
    code: "WEBVIEW_UNAVAILABLE",
  });
  jest.mocked(NitroCookies.getList).mockRejectedValueOnce(error);
  await expect(operations.getList.run(input)).rejects.toBe(error);
});

test("cross-domain deletion requires explicit confirmation", () => {
  expect(operations.clearAll.confirm).toBe(true);
  expect(operations.removeSessionCookies.confirm).toBe(true);
});
