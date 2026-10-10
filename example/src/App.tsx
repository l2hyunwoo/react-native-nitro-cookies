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
  const [tab, setTab] = useState<(typeof groups)[number] | "WebView">("Read");
  const group = tab === "WebView" ? "Read" : tab;
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
    role: "button" | "tab" = "button",
  ) {
    return (
      <Pressable
        key={label}
        testID={role === "tab" ? `tab-${label.toLowerCase()}` : label}
        accessibilityRole={role}
        accessibilityLabel={label}
        accessibilityState={{ disabled, selected: active }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          s.button,
          role === "tab" && s.tabButton,
          {
            borderColor: color.border,
            backgroundColor: active ? color.ink : color.panel,
            opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text
          style={[
            s.buttonText,
            role === "tab" && s.tabText,
            { color: active ? color.bg : color.ink },
          ]}
        >
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
    role: "button" | "tab" = "button",
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
        <View style={s.shell}>
          <View style={s.header}>
            <View style={s.topline}>
              <View>
                <Text accessibilityRole="header" style={[s.title, textStyle]}>
                  Nitro Cookies
                </Text>
                <Text style={[s.caption, mutedStyle]}>
                  Native cookie playground · local source
                </Text>
              </View>
              {button(
                "Docs ↗",
                () => {
                  void Linking.openURL(docsURL);
                },
                false,
                false,
              )}
            </View>
            <View style={[s.tabs, panelStyle]}>
              {[...groups, "WebView" as const].map((item) =>
                button(
                  item,
                  () => {
                    setTab(item);
                    if (item !== "WebView" && item !== tab)
                      setSelected(
                        (Object.keys(operations) as OperationName[]).find(
                          (key) => operations[key].group === item,
                        )!,
                      );
                    scroll.current?.scrollTo({ y: 0, animated: false });
                  },
                  tab === item,
                  busy,
                  "tab",
                ),
              )}
            </View>
          </View>
          <ScrollView
            ref={scroll}
            testID="playground-inputs"
            style={s.form}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.page}
          >
            {tab !== "WebView" && (
              <>
                <View style={s.row}>
                  {(Object.keys(operations) as OperationName[])
                    .filter((key) => operations[key].group === group)
                    .map((key) =>
                      button(key, () => setSelected(key), selected === key),
                    )}
                </View>
                <Text style={[s.body, mutedStyle]}>{operation.note}</Text>
              </>
            )}
            <View style={[s.card, panelStyle]}>
              <View style={s.topline}>
                <Text style={[s.sectionTitle, textStyle]}>Target & store</Text>
                <Text style={[s.caption, mutedStyle]}>
                  {Platform.isTV ? "TV · " : ""}
                  {Platform.OS}
                </Text>
              </View>
              {field("URL", url, setUrl)}
              {toggle(
                "iOS WebKit store · async only",
                useWebKit,
                setUseWebKit,
                busy || !webKitAvailable,
              )}
              <Text style={[s.caption, mutedStyle]}>
                {webKitAvailable
                  ? "Shared and WebKit are separate. Sync APIs always use shared storage."
                  : onApple
                    ? "tvOS supports shared storage; WebKit selection rejects with WEBKIT_UNAVAILABLE."
                    : "Android requires a usable WebView provider. Query metadata is unknown; retain the original write scope."}
              </Text>
            </View>
            {tab !== "WebView" ? (
              <>
                {(group === "Write" || group === "Delete") && (
                  <View style={[s.card, panelStyle]}>
                    <Text style={[s.sectionTitle, textStyle]}>
                      Cookie input
                    </Text>
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
                  </View>
                )}
                {group === "Read" && (
                  <Text style={[s.caption, mutedStyle]}>
                    List queries preserve duplicate names; dictionaries collapse
                    them. Apple lists select domains. Use getCookieHeader for
                    request eligibility.
                  </Text>
                )}
                {group === "Write" && (
                  <Text style={[s.caption, mutedStyle]}>
                    Walkthrough: setMany writes root/account values at / and
                    /account. In Read, compare getList with get. In Delete,
                    clearCookie at /account; the root cookie remains. Android
                    reads may lag submitted writes.
                  </Text>
                )}
                {group === "Errors" && (
                  <Text selectable style={[s.code, textStyle]}>
                    Runtime codes: {Object.values(CookieErrorCode).join(", ")}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={[s.body, mutedStyle]}>
                  Load a page, then inspect its current URL. On iOS, select
                  WebKit for the browser store. sharedCookiesEnabled does not
                  guarantee native store synchronization.
                </Text>
                {Platform.isTV ? (
                  <Text style={[s.body, mutedStyle]}>
                    Embedded WebView is disabled on TV. Choose a native API tab.
                  </Text>
                ) : (
                  <>
                    {button("Load / reload page", loadBrowser)}
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
                          No page loaded. Press Load to start a network request.
                        </Text>
                      </View>
                    )}
                    <Text selectable style={[s.caption, mutedStyle]}>
                      {currentBrowserURL ?? "Waiting for a URL"}
                    </Text>
                  </>
                )}
              </>
            )}
          </ScrollView>
          <View
            style={[
              s.results,
              { backgroundColor: color.panel, borderColor: color.border },
            ]}
          >
            {tab !== "WebView"
              ? button(busy ? "Running…" : `Run ${selected}`, run, true)
              : !Platform.isTV &&
                button(
                  "Inspect current URL",
                  () => {
                    void execute("WebView getList", () =>
                      NitroCookies.getList(currentBrowserURL ?? url, useWebKit),
                    );
                  },
                  true,
                )}
            <View style={s.topline}>
              <Text
                testID="native-result-title"
                accessibilityLiveRegion="polite"
                style={[s.sectionTitle, textStyle]}
              >
                {resultTitle}
              </Text>
              <Text style={[s.caption, mutedStyle]}>
                {failed ? "ERROR" : busy ? "RUNNING" : "OUTPUT"}
              </Text>
            </View>
            <ScrollView
              key={resultTitle}
              style={[s.resultScroll, { backgroundColor: color.bg }]}
              testID="native-result"
              accessibilityLabel="Native result"
            >
              <Text
                selectable
                style={[
                  s.output,
                  {
                    color: failed ? (dark ? "#fda4af" : "#9f1239") : color.ink,
                  },
                ]}
              >
                {result}
              </Text>
            </ScrollView>
            <Text style={[s.caption, mutedStyle]}>
              Local source APIs · Cookie values are not logged to console.
            </Text>
          </View>
        </View>
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
  shell: { flex: 1, maxWidth: 820, width: "100%", alignSelf: "center" },
  header: { padding: 16, gap: 16 },
  form: { flex: 1 },
  page: { padding: 16, paddingTop: 0, gap: 16, paddingBottom: 24 },
  results: { borderTopWidth: 1, padding: 16, gap: 10 },
  topline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: "700", letterSpacing: -0.8 },
  tabs: {
    flexDirection: "row",
    padding: 3,
    gap: 3,
    borderWidth: 1,
    borderRadius: 9,
  },
  tabButton: { flex: 1, paddingHorizontal: 2, borderWidth: 0, borderRadius: 6 },
  tabText: { fontSize: 11 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: { borderWidth: 1, borderRadius: 10, padding: 14, gap: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "600", flexShrink: 1 },
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
  caption: { fontSize: 11, lineHeight: 17 },
  code: { fontSize: 11, lineHeight: 19, fontFamily: mono },
  resultScroll: { height: 148, flexGrow: 0, borderRadius: 7 },
  output: { padding: 12, fontSize: 12, lineHeight: 19, fontFamily: mono },
  browser: { height: 280, backgroundColor: "#ffffff" },
  browserEmpty: {
    minHeight: 120,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 7,
    padding: 16,
    justifyContent: "center",
  },
});
