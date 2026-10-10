import { defineConfig, type DefaultTheme, type HeadConfig } from "vitepress";
import { generateLlmDocs } from "../scripts/llms.mjs";

const repository = "https://github.com/l2hyunwoo/react-native-nitro-cookies";
const siteUrl = "https://l2hyunwoo.github.io/react-native-nitro-cookies/";
const groups = [
  [
    "Get started",
    "시작하기",
    [
      ["Installation", "설치", "start/installation"],
      ["Your first cookie", "첫 쿠키 저장하기", "start/first-cookie"],
    ],
  ],
  [
    "Understand cookies",
    "쿠키 이해하기",
    [["Stores and scope", "Cookie store와 scope", "concepts/storage"]],
  ],
  [
    "Guides",
    "가이드",
    [
      [
        "Send request headers",
        "Request header 보내기",
        "guides/request-headers",
      ],
      [
        "Use a WebView store",
        "WebView cookie store 사용하기",
        "guides/webviews",
      ],
      [
        "Delete one cookie scope",
        "Scope를 지정해 쿠키 삭제",
        "guides/scoped-deletion",
      ],
      ["Migrate an existing app", "기존 앱 마이그레이션", "guides/migration"],
      ["Troubleshoot cookies", "쿠키 문제 해결", "guides/troubleshooting"],
    ],
  ],
  [
    "Reference",
    "API Reference",
    [
      ["API overview", "API 개요", "reference/"],
      ["Read cookies", "쿠키 조회", "reference/reading"],
      ["Write cookies", "쿠키 저장", "reference/writing"],
      [
        "Headers and responses",
        "Cookie header와 응답 쿠키",
        "reference/requests",
      ],
      ["Delete cookies", "쿠키 삭제", "reference/deletion"],
      [
        "Persistence and sessions",
        "Session cookie와 디스크 저장",
        "reference/lifecycle",
      ],
      ["Types", "Types", "reference/types"],
      ["Errors", "Errors", "reference/errors"],
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
  base: new URL(siteUrl).pathname,
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        href: `${new URL(siteUrl).pathname}nitro-cookies.png`,
      },
    ],
  ],
  buildEnd: (config) => generateLlmDocs(config, siteUrl, groups),
  transformHead({ pageData }) {
    const file = pageData.relativePath;
    if (file === "404.md") return [];
    const prefix = file.startsWith("ko/") ? "ko/" : "";
    const head: HeadConfig[] = [
      [
        "link",
        {
          rel: "describedby",
          href: new URL(`${prefix}llms.txt`, siteUrl).href,
        },
      ],
    ];
    if (file !== `${prefix}index.md`) {
      head.push([
        "link",
        {
          rel: "alternate",
          type: "text/markdown",
          href: new URL(file, siteUrl).href,
        },
      ]);
    }
    return head;
  },
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
        "React Native의 native HTTP 쿠키를 관리하세요. iOS, Android, tvOS에서 TypeScript로 sync·async API를 사용합니다.",
      themeConfig: {
        nav: [
          {
            text: "문서",
            link: "/ko/start/installation",
            activeMatch: "/ko/(start|concepts|guides)/",
          },
          {
            text: "API Reference",
            link: "/ko/reference/",
            activeMatch: "/ko/reference/",
          },
        ],
        sidebar: sidebar(true),
        outline: { label: "목차", level: [2, 3] },
        docFooter: { prev: "이전", next: "다음" },
        sidebarMenuLabel: "메뉴",
        returnToTopLabel: "맨 위로",
        darkModeSwitchLabel: "테마",
        lightModeSwitchTitle: "라이트 모드로 전환",
        darkModeSwitchTitle: "다크 모드로 전환",
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
    siteTitle: false,
    logo: {
      src: "/nitro-cookies.png",
      alt: "Nitro Cookies",
      width: 52,
      height: 52,
    },
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
                displayDetails: "검색 결과 자세히 보기",
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
