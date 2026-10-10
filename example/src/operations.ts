import NitroCookies from "react-native-nitro-cookies";
import type { Cookie } from "react-native-nitro-cookies";

export type Inputs = {
  url: string;
  cookie: Cookie;
  header: string;
  useWebKit: boolean;
};

export const groups = [
  "Read",
  "Write",
  "Delete",
  "Lifecycle",
  "Errors",
] as const;
type Group = (typeof groups)[number];

type Operation = {
  group: Group;
  note: string;
  run: (input: Inputs) => unknown;
  confirm?: boolean;
};

export const operations = {
  getList: {
    group: "Read",
    note: "List preserves duplicate names. Android returns name/value only.",
    run: (i) => NitroCookies.getList(i.url, i.useWebKit),
  },
  getListSync: {
    group: "Read",
    note: "Default store only. Android metadata is unknown.",
    run: (i) => NitroCookies.getListSync(i.url),
  },
  get: {
    group: "Read",
    note: "Dictionary keyed by name. Duplicate names collapse.",
    run: (i) => NitroCookies.get(i.url, i.useWebKit),
  },
  getSync: {
    group: "Read",
    note: "Dictionary from the default store; duplicate names collapse.",
    run: (i) => NitroCookies.getSync(i.url),
  },
  getAllList: {
    group: "Read",
    note: "All domains, preserving duplicates. Apple only; Android rejects.",
    run: (i) => NitroCookies.getAllList(i.useWebKit),
  },
  getAll: {
    group: "Read",
    note: "All domains as a dictionary. Apple only; Android rejects.",
    run: (i) => NitroCookies.getAll(i.useWebKit),
  },
  getCookieHeader: {
    group: "Read",
    note: "Request Cookie header. Path, Secure, and expiry affect selection.",
    run: (i) => NitroCookies.getCookieHeader(i.url, i.useWebKit),
  },
  getCookieHeaderSync: {
    group: "Read",
    note: "Request Cookie header from the default store.",
    run: (i) => NitroCookies.getCookieHeaderSync(i.url),
  },
  getFromResponseList: {
    group: "Read",
    note: "Makes a real HTTP GET. Parses response cookies as a list; no WebKit selector.",
    run: (i) => NitroCookies.getFromResponseList(i.url),
  },
  getFromResponse: {
    group: "Read",
    note: "Makes a real HTTP GET. Returns a dictionary; no WebKit selector.",
    run: (i) => NitroCookies.getFromResponse(i.url),
  },
  set: {
    group: "Write",
    note: "Writes the form cookie. Android confirms submission, not write acceptance.",
    run: (i) => NitroCookies.set(i.url, i.cookie, i.useWebKit),
  },
  setSync: {
    group: "Write",
    note: "Default store only. Android immediate reads may miss a submitted write.",
    run: (i) => NitroCookies.setSync(i.url, i.cookie),
  },
  setMany: {
    group: "Write",
    note: "Writes the form cookie at / and /account, with distinct values. Read at /account to compare.",
    run: (i) =>
      NitroCookies.setMany(
        i.url,
        [
          { ...i.cookie, path: "/", value: "root" },
          { ...i.cookie, path: "/account", value: "account" },
        ],
        i.useWebKit,
      ),
  },
  setManySync: {
    group: "Write",
    note: "Same two-path fixture in the default store. Android writes have no acknowledgment.",
    run: (i) =>
      NitroCookies.setManySync(i.url, [
        { ...i.cookie, path: "/", value: "root" },
        { ...i.cookie, path: "/account", value: "account" },
      ]),
  },
  setFromResponse: {
    group: "Write",
    note: "Parses the Set-Cookie input locally. Does not make a network request or select WebKit.",
    run: (i) => NitroCookies.setFromResponse(i.url, i.header),
  },
  setFromResponseSync: {
    group: "Write",
    note: "Parses the Set-Cookie input in the default store.",
    run: (i) => NitroCookies.setFromResponseSync(i.url, i.header),
  },
  clearCookie: {
    group: "Delete",
    note: "Deletes the exact name/domain/path from the form. Retain the Android write scope.",
    run: (i) =>
      NitroCookies.clearCookie(
        i.url,
        {
          name: i.cookie.name,
          path: i.cookie.path ?? "/",
          domain: i.cookie.domain,
        },
        i.useWebKit,
      ),
  },
  clearCookieSync: {
    group: "Delete",
    note: "Exact identity in the default store. Android submits expiration without acknowledgment.",
    run: (i) =>
      NitroCookies.clearCookieSync(i.url, {
        name: i.cookie.name,
        path: i.cookie.path ?? "/",
        domain: i.cookie.domain,
      }),
  },
  clearByName: {
    group: "Delete",
    note: "Legacy name deletion; scope differs by platform. Prefer clearCookie for exact identity.",
    run: (i) => NitroCookies.clearByName(i.url, i.cookie.name, i.useWebKit),
  },
  clearByNameSync: {
    group: "Delete",
    note: "Legacy name deletion in the default store.",
    run: (i) => NitroCookies.clearByNameSync(i.url, i.cookie.name),
  },
  clearAll: {
    group: "Delete",
    note: "Deletes the entire selected store, including unrelated domains.",
    run: (i) => NitroCookies.clearAll(i.useWebKit),
    confirm: true,
  },
  flush: {
    group: "Lifecycle",
    note: "Android disk flush. Apple resolves without doing work; no WebKit selector.",
    run: () => NitroCookies.flush(),
  },
  removeSessionCookies: {
    group: "Lifecycle",
    note: "Android: removes all session cookies. Apple returns false without removing cookies.",
    run: () => NitroCookies.removeSessionCookies(),
    confirm: true,
  },
  invalidURL: {
    group: "Errors",
    note: "Calls getList with an invalid URL. Expect INVALID_URL and the original cause.",
    run: (i) => NitroCookies.getList("not-a-url", i.useWebKit),
  },
  domainMismatch: {
    group: "Errors",
    note: "Calls set with a deliberately unrelated domain. Expect DOMAIN_MISMATCH.",
    run: (i) =>
      NitroCookies.set(
        "https://example.com",
        { name: "nitro_demo", value: "demo", domain: "different.invalid" },
        i.useWebKit,
      ),
  },
  invalidScope: {
    group: "Errors",
    note: "Calls clearCookie with a relative path. Expect PARSE_ERROR.",
    run: (i) =>
      NitroCookies.clearCookie(
        i.url,
        { name: i.cookie.name, path: "relative" },
        i.useWebKit,
      ),
  },
} satisfies Record<
  keyof typeof NitroCookies | "invalidURL" | "domainMismatch" | "invalidScope",
  Operation
>;

export type OperationName = keyof typeof operations;
