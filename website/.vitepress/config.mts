import { defineConfig, type DefaultTheme } from "vitepress";

const repository = "https://github.com/l2hyunwoo/react-native-nitro-cookies";
const groups = [
  [
    "Get started",
    "시작하기",
    [
      ["Installation", "설치", "start/installation"],
      ["Your first cookie", "첫 쿠키", "start/first-cookie"],
    ],
  ],
  [
    "Understand cookies",
    "쿠키 이해하기",
    [["Stores and scope", "저장소와 범위", "concepts/storage"]],
  ],
  [
    "Guides",
    "가이드",
    [
      ["Send request headers", "요청 헤더 보내기", "guides/request-headers"],
      ["Use a WebView store", "WebView 저장소 사용", "guides/webviews"],
      [
        "Delete one cookie scope",
        "특정 범위의 쿠키 삭제",
        "guides/scoped-deletion",
      ],
      ["Migrate an existing app", "기존 앱 마이그레이션", "guides/migration"],
    ],
  ],
  [
    "Reference",
    "참조",
    [
      ["API overview", "API 개요", "reference/"],
      ["Read cookies", "쿠키 조회", "reference/reading"],
      ["Write cookies", "쿠키 저장", "reference/writing"],
      ["Headers and responses", "헤더와 응답", "reference/requests"],
      ["Delete cookies", "쿠키 삭제", "reference/deletion"],
      ["Persistence and sessions", "영속 저장과 세션", "reference/lifecycle"],
      ["Types", "타입", "reference/types"],
      ["Errors", "오류", "reference/errors"],
      ["Platform support", "플랫폼 지원", "reference/platforms"],
    ],
  ],
] as const;

function sidebar(korean: boolean): DefaultTheme.SidebarItem[] {
  const prefix = korean ? "/ko/" : "/";
  return groups.map(([en, ko, items]) => ({
    text: korean ? ko : en,
    items: items.map(([english, translated, path]) => ({
      text: korean ? translated : english,
      link: prefix + path,
    })),
  }));
}

export default defineConfig({
  title: "Nitro Cookies",
  description:
    "Native cookie management for React Native. Typed synchronous and asynchronous APIs for iOS, Android, and tvOS.",
  srcDir: "content",
  base: "/react-native-nitro-cookies/",
  cleanUrls: false,
  appearance: true,
  markdown: { theme: { light: "github-light", dark: "github-dark" } },
  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [
          {
            text: "Documentation",
            link: "/start/installation",
            activeMatch: "/(start|concepts|guides)/",
          },
          {
            text: "API reference",
            link: "/reference/",
            activeMatch: "/reference/",
          },
        ],
        sidebar: sidebar(false),
      },
    },
    ko: {
      label: "한국어",
      lang: "ko",
      description:
        "React Native 네이티브 쿠키 관리. iOS, Android, tvOS를 위한 타입 안전한 동기·비동기 API.",
      themeConfig: {
        nav: [
          {
            text: "문서",
            link: "/ko/start/installation",
            activeMatch: "/ko/(start|concepts|guides)/",
          },
          {
            text: "API 참조",
            link: "/ko/reference/",
            activeMatch: "/ko/reference/",
          },
        ],
        sidebar: sidebar(true),
        outline: { label: "이 페이지에서", level: [2, 3] },
        docFooter: { prev: "이전", next: "다음" },
        sidebarMenuLabel: "메뉴",
        returnToTopLabel: "맨 위로",
        darkModeSwitchLabel: "테마",
        lightModeSwitchTitle: "밝은 모드로 전환",
        darkModeSwitchTitle: "어두운 모드로 전환",
        langMenuLabel: "언어 변경",
        editLink: {
          pattern: `${repository}/edit/main/website/content/:path`,
          text: "GitHub에서 이 페이지 수정",
        },
        footer: { message: "MIT 라이선스 · React Native Nitro Cookies" },
      },
    },
  },
  themeConfig: {
    siteTitle: "nitro cookies",
    outline: { level: [2, 3] },
    socialLinks: [{ icon: "github", link: repository }],
    editLink: { pattern: `${repository}/edit/main/website/content/:path` },
    footer: { message: "MIT licensed · React Native Nitro Cookies" },
    search: {
      provider: "local",
      options: {
        locales: {
          ko: {
            translations: {
              button: { buttonText: "검색", buttonAriaLabel: "문서 검색" },
              modal: {
                displayDetails: "자세히 표시",
                resetButtonTitle: "검색어 지우기",
                backButtonTitle: "검색으로 돌아가기",
                noResultsText: "검색 결과가 없습니다",
                footer: {
                  selectText: "선택",
                  navigateText: "이동",
                  closeText: "닫기",
                },
              },
            },
          },
        },
      },
    },
  },
});
