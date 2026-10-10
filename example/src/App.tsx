import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import NitroCookies, { CookieErrorCode } from "react-native-nitro-cookies";
import type { CookieError } from "react-native-nitro-cookies";
import { groups, operations } from "./operations";
import type { Inputs, OperationName } from "./operations";

const docsURL = "https://l2hyunwoo.github.io/react-native-nitro-cookies";
const mono = Platform.OS === "ios" ? "Menlo" : "monospace";

function AppContent() {
  const dark = useColorScheme() === "dark";
  const color = dark
    ? {
        bg: "#09090b",
        panel: "#18181b",
        ink: "#fafafa",
        muted: "#a1a1aa",
        border: "#3f3f46",
      }
    : {
        bg: "#fafafa",
        panel: "#ffffff",
        ink: "#18181b",
        muted: "#52525b",
        border: "#d4d4d8",
      };
  const [tab, setTab] = useState<"API" | "WebView">("API");
  const [group, setGroup] = useState<(typeof groups)[number]>("Read");
  const [selected, setSelected] = useState<OperationName>("getList");
  const [url, setUrl] = useState("https://example.com/account");
  const [name, setName] = useState("nitro_demo");
  const [value, setValue] = useState("hello");
  const [path, setPath] = useState("/account");
  const [domain, setDomain] = useState("example.com");
  const [expires, setExpires] = useState("");
  const [secure, setSecure] = useState(true);
  const [httpOnly, setHttpOnly] = useState(false);
  const [useWebKit, setUseWebKit] = useState(false);
  const [header, setHeader] = useState(
    "nitro_header=hello; Path=/; Secure; HttpOnly",
  );
  const [result, setResult] = useState(
    "Run an operation to inspect its native result.",
  );
  const [resultTitle, setResultTitle] = useState("No operation yet");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const [browserURL, setBrowserURL] = useState<string>();
  const [currentBrowserURL, setCurrentBrowserURL] = useState<string>();
  const webView = useRef<WebView>(null);
  const scroll = useRef<ScrollView>(null);
  const operation = operations[selected];
  const inputs: Inputs = {
    url,
    cookie: {
      name,
      value,
      path,
      ...(domain ? { domain } : {}),
      ...(expires ? { expires } : {}),
      secure,
      httpOnly,
    },
    header,
    useWebKit,
  };
  const onApple = Platform.OS === "ios";
  const webKitAvailable = onApple && !Platform.isTV;
  const textStyle = { color: color.ink };
  const mutedStyle = { color: color.muted };
  const panelStyle = {
    backgroundColor: color.panel,
    borderColor: color.border,
  };

  function button(
    label: string,
    onPress: () => void,
    active = false,
    disabled = busy,
  ) {
    return (
      <Pressable
        key={label}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled, selected: active }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          s.button,
          {
            borderColor: color.border,
            backgroundColor: active ? color.ink : color.panel,
            opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[s.buttonText, { color: active ? color.bg : color.ink }]}>
          {label}
        </Text>
      </Pressable>
    );
  }

  function field(label: string, content: string, change: (v: string) => void) {
    return (
      <View style={s.field}>
        <Text style={[s.label, mutedStyle]}>{label}</Text>
        <TextInput
          accessibilityLabel={label}
          editable={!busy}
          value={content}
          onChangeText={change}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={color.muted}
          style={[s.input, textStyle, panelStyle]}
        />
      </View>
    );
  }

  function toggle(
    label: string,
    checked: boolean,
    change: (v: boolean) => void,
    disabled = busy,
  ) {
    return (
      <View style={s.toggle}>
        <Text style={[s.body, textStyle]}>{label}</Text>
        <Switch
          accessibilityLabel={label}
          disabled={disabled}
          value={checked}
          onValueChange={change}
          trackColor={{ false: color.border, true: "#52525b" }}
        />
      </View>
    );
  }

  async function execute(label: string, call: () => unknown) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setFailed(false);
    setResultTitle(`${label} · running`);
    setResult("Waiting for the native store…");
    try {
      const output = await call();
      setResult(
        output === undefined
          ? "void (completed without a return value)"
          : JSON.stringify(output, null, 2),
      );
      setResultTitle(`${label} · returned`);
    } catch (error) {
      const failure = error as Partial<CookieError>;
      setFailed(true);
      setResultTitle(`${label} · rejected`);
      setResult(
        JSON.stringify(
          {
            code: failure.code,
            message: failure.message ?? String(error),
            url: failure.url,
            cookieName: failure.cookieName,
            cause:
              failure.cause instanceof Error
                ? failure.cause.message
                : String(failure.cause ?? ""),
          },
          null,
          2,
        ),
      );
    } finally {
      running.current = false;
      setBusy(false);
      requestAnimationFrame(() =>
        scroll.current?.scrollToEnd({ animated: true }),
      );
    }
  }

  function run() {
    if ("confirm" in operation && operation.confirm) {
      Alert.alert("Delete cookies across domains?", operation.note, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void execute(selected, () => operation.run(inputs));
          },
        },
      ]);
    } else {
      void execute(selected, () => operation.run(inputs));
    }
  }

  function loadBrowser() {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname)
        throw new Error("Enter an absolute HTTP(S) URL.");
      if (browserURL === url) webView.current?.reload();
      setBrowserURL(url);
      setCurrentBrowserURL(url);
    } catch {
      void execute("WebView URL", () => {
        throw new Error("Enter an absolute HTTP(S) URL.");
      });
    }
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: color.bg }]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        style={s.safe}
        behavior={onApple ? "padding" : undefined}
      >
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.page}
        >
          <View style={s.topline}>
            <Text style={[s.eyebrow, mutedStyle]}>
              NITRO COOKIES / PLAYGROUND
            </Text>
            <Text style={[s.badge, textStyle, panelStyle]}>
              {Platform.isTV ? "TV · " : ""}
              {Platform.OS}
            </Text>
          </View>
          <Text accessibilityRole="header" style={[s.title, textStyle]}>
            Cookies, inspected.
          </Text>
          <Text style={[s.subtitle, mutedStyle]}>
            Explore native stores. See exactly what each API returns.
          </Text>
          <View style={s.row}>
            {button("API", () => setTab("API"), tab === "API")}
            {button("WebView", () => setTab("WebView"), tab === "WebView")}
            {button(
              "Documentation ↗",
              () => {
                void Linking.openURL(docsURL);
              },
              false,
              false,
            )}
          </View>
          <View style={[s.card, panelStyle]}>
            <Text style={[s.sectionTitle, textStyle]}>01 / Target & store</Text>
            {field("URL", url, setUrl)}
            {toggle(
              "iOS WebKit store · async only",
              useWebKit,
              setUseWebKit,
              busy || !webKitAvailable,
            )}
            <Text style={[s.caption, mutedStyle]}>
              {webKitAvailable
                ? "Shared and WebKit stores are separate. Sync APIs always use shared storage; no automatic copying."
                : onApple
                  ? "tvOS supports shared storage. WebKit selection rejects with WEBKIT_UNAVAILABLE."
                  : "Android uses CookieManager and requires a usable WebView provider. WebKit selection has no effect."}
            </Text>
          </View>
          {tab === "API" ? (
            <>
              <View style={[s.card, panelStyle]}>
                <Text style={[s.sectionTitle, textStyle]}>
                  02 / Choose an operation
                </Text>
                <View style={s.row}>
                  {groups.map((item) =>
                    button(
                      item,
                      () => {
                        setGroup(item);
                        setSelected(
                          (Object.keys(operations) as OperationName[]).find(
                            (key) => operations[key].group === item,
                          )!,
                        );
                      },
                      group === item,
                    ),
                  )}
                </View>
                <View style={s.row}>
                  {(Object.keys(operations) as OperationName[])
                    .filter((key) => operations[key].group === group)
                    .map((key) =>
                      button(key, () => setSelected(key), selected === key),
                    )}
                </View>
                <Text style={[s.body, mutedStyle]}>{operation.note}</Text>
                {group === "Read" && (
                  <Text style={[s.caption, mutedStyle]}>
                    Apple URL lists match domains, not full request eligibility.
                    Use getCookieHeader for outgoing requests.
                  </Text>
                )}
                {(group === "Write" || group === "Delete") && (
                  <>
                    {field("Cookie name", name, setName)}
                    {group === "Write" &&
                      field("Cookie value", value, setValue)}
                    {field("Path", path, setPath)}
                    {field(
                      "Domain · empty omits the attribute",
                      domain,
                      setDomain,
                    )}
                    {group === "Write" && (
                      <>
                        {field(
                          "Expires · ISO 8601, empty for session",
                          expires,
                          setExpires,
                        )}
                        {toggle("Secure", secure, setSecure)}
                        {toggle("HttpOnly", httpOnly, setHttpOnly)}
                        {field(
                          "Set-Cookie · used by setFromResponse APIs",
                          header,
                          setHeader,
                        )}
                        <Text style={[s.caption, mutedStyle]}>
                          HttpOnly blocks document.cookie access. Native reads
                          still expose the value.
                        </Text>
                      </>
                    )}
                  </>
                )}
                {group === "Errors" && (
                  <Text selectable style={[s.code, textStyle]}>
                    Runtime codes: {Object.values(CookieErrorCode).join(", ")}
                  </Text>
                )}
                {button(busy ? "Running…" : `Run ${selected}`, run, true)}
              </View>
              <View style={[s.card, panelStyle]}>
                <Text style={[s.sectionTitle, textStyle]}>
                  Try the scoped-cookie walkthrough
                </Text>
                <Text style={[s.body, mutedStyle]}>
                  Use the default example.com URL and cookie name. Run setMany
                  to create / and /account cookies. Compare getList with get,
                  then clearCookie at /account. Read again: the root cookie
                  remains.
                </Text>
                <Text style={[s.caption, mutedStyle]}>
                  On Android, read again after writes settle. A successful write
                  result does not guarantee an immediate read. Retain the form
                  domain/path for deletion.
                </Text>
              </View>
            </>
          ) : (
            <View style={[s.card, panelStyle]}>
              <Text style={[s.sectionTitle, textStyle]}>
                02 / WebView inspector
              </Text>
              <Text style={[s.body, mutedStyle]}>
                Load an HTTP(S) page, then inspect its current URL. On iOS,
                select WebKit to read the browser store. sharedCookiesEnabled is
                a WebView setting, not a guarantee that native stores
                synchronize.
              </Text>
              {Platform.isTV ? (
                <Text style={[s.body, mutedStyle]}>
                  Embedded WebView is disabled in the TV playground. Use the API
                  tab for native store operations.
                </Text>
              ) : (
                <>
                  <View style={s.row}>
                    {button("Load / reload page", loadBrowser)}
                    {button("Inspect current URL", () => {
                      void execute("WebView getList", () =>
                        NitroCookies.getList(
                          currentBrowserURL ?? url,
                          useWebKit,
                        ),
                      );
                    })}
                  </View>
                  {browserURL ? (
                    <WebView
                      ref={webView}
                      style={s.browser}
                      source={{ uri: browserURL }}
                      sharedCookiesEnabled
                      thirdPartyCookiesEnabled
                      onNavigationStateChange={(state) =>
                        setCurrentBrowserURL(state.url)
                      }
                      onError={(event) => {
                        const message = event.nativeEvent.description;
                        void execute("WebView load", () => {
                          throw new Error(message);
                        });
                      }}
                    />
                  ) : (
                    <View
                      style={[s.browserEmpty, { borderColor: color.border }]}
                    >
                      <Text style={[s.body, mutedStyle]}>
                        No page loaded. Network requests start when you press
                        Load.
                      </Text>
                    </View>
                  )}
                  <Text selectable style={[s.caption, mutedStyle]}>
                    {currentBrowserURL ?? "Waiting for a URL"}
                  </Text>
                </>
              )}
            </View>
          )}
          <View style={[s.card, panelStyle]}>
            <View style={s.topline}>
              <Text
                accessibilityRole="header"
                style={[s.sectionTitle, textStyle]}
              >
                03 / Native result
              </Text>
              <Text style={[s.caption, mutedStyle]}>
                {failed ? "ERROR" : busy ? "RUNNING" : "OUTPUT"}
              </Text>
            </View>
            <Text accessibilityLiveRegion="polite" style={[s.body, textStyle]}>
              {resultTitle}
            </Text>
            <ScrollView style={s.resultScroll} nestedScrollEnabled>
              <Text
                selectable
                style={[
                  s.output,
                  {
                    color: failed ? (dark ? "#fda4af" : "#9f1239") : color.ink,
                    backgroundColor: color.bg,
                  },
                ]}
              >
                {result}
              </Text>
            </ScrollView>
            <Text style={[s.caption, mutedStyle]}>
              Results stay on this screen; cookie values are not sent to console
              logs. This playground uses the local source, including unreleased
              APIs.
            </Text>
          </View>
          <Text style={[s.footer, mutedStyle]}>
            React Native + Nitro Modules · Native stores, visible behavior.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  page: {
    padding: 20,
    gap: 20,
    maxWidth: 820,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 48,
  },
  topline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "600",
    flexShrink: 1,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontFamily: mono,
  },
  title: { fontSize: 34, fontWeight: "700", letterSpacing: -1.2 },
  subtitle: { fontSize: 15, lineHeight: 23, marginTop: -12 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "600", flexShrink: 1 },
  button: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { fontSize: 12, fontWeight: "600" },
  field: { gap: 8 },
  label: { fontSize: 12, fontWeight: "500" },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: mono,
  },
  toggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  body: { fontSize: 13, lineHeight: 21, flexShrink: 1 },
  caption: { fontSize: 11, lineHeight: 18 },
  code: { fontSize: 11, lineHeight: 19, fontFamily: mono },
  resultScroll: { maxHeight: 280 },
  output: {
    padding: 12,
    borderRadius: 7,
    fontSize: 12,
    lineHeight: 19,
    fontFamily: mono,
  },
  browser: { height: 360, backgroundColor: "#ffffff" },
  browserEmpty: {
    minHeight: 160,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 7,
    padding: 24,
    justifyContent: "center",
  },
  footer: { fontSize: 10, textAlign: "center", lineHeight: 18 },
});
