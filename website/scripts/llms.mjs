import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createMarkdownRenderer } from "vitepress";

export function markdownForAi(source, file, siteUrl, markdown) {
  const text = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const lines = text.split("\n");
  const code = markdown
    .parse(text, {})
    .filter((token) => token.type === "fence" || token.type === "code_block");
  const pageUrl = new URL(file.replace(/\.md$/, ".html"), siteUrl);
  function prose(chunk) {
    const plain = chunk.replace(/^::: *(?:code-group)? *$/gm, "");
    assert.ok(!/^:::/m.test(plain), `${file}: unsupported Markdown container`);
    // shortcut: inline links only; add reference-link handling when docs use it.
    return plain.replace(
      /(`+)[\s\S]*?\1|(!?\[[^\]\n]*\]\()([^\s)]+)(\))/g,
      (match, inlineCode, open, href, close) => {
        if (inlineCode) return match;
        const target = new URL(href, pageUrl);
        if (target.origin !== pageUrl.origin) return match;
        assert.ok(
          target.pathname.startsWith(new URL(siteUrl).pathname),
          `${file}: link escapes the project base: ${href}`,
        );
        if (target.pathname.endsWith("/")) target.pathname += "index.md";
        else if (!/\.[^/]+$/.test(target.pathname)) target.pathname += ".md";
        else target.pathname = target.pathname.replace(/\.html$/, ".md");
        return `${open}${target.href}${close}`;
      },
    );
  }
  let cursor = 0;
  const chunks = [];
  for (const {
    map: [start, end],
  } of code) {
    chunks.push(prose(lines.slice(cursor, start).join("\n")));
    chunks.push(lines.slice(start, end).join("\n"));
    cursor = end;
  }
  chunks.push(prose(lines.slice(cursor).join("\n")));
  return `${chunks.join("\n").trim()}\n`;
}

export async function generateLlmDocs(config, siteUrl, groups) {
  const markdown = await createMarkdownRenderer(
    config.srcDir,
    {},
    config.site.base,
  );
  const generated = [];
  for (const korean of [false, true]) {
    const prefix = korean ? "ko/" : "";
    const notice = korean
      ? "Nitro Cookies 1.3.0 기준 문서입니다. List API, scope를 지정하는 삭제 API, error normalization은 1.3.0부터 지원합니다. 이전 버전을 사용 중이라면 설치 문서와 릴리스 이력을 확인하세요."
      : "These docs cover Nitro Cookies 1.3.0. List APIs, scoped deletion, and normalized errors are available from 1.3.0. Check the installation guide and release history when upgrading from an earlier version.";
    const description = korean
      ? config.site.locales.ko.description
      : config.site.description;
    const header = `# Nitro Cookies\n\n> ${description}\n\n${notice}\n`;
    const fullUrl = new URL(`${prefix}llms-full.txt`, siteUrl).href;
    const index = [
      header,
      korean
        ? `[전체 본문](${fullUrl})에는 시작하기·개념·가이드·API Reference를 메뉴 순서대로 모았습니다.`
        : `[Full documentation](${fullUrl}) contains the getting-started pages, concepts, guides, and API reference in navigation order.`,
    ];
    const full = [header];
    for (const [english, translated, items] of groups) {
      index.push(`## ${korean ? translated : english}`);
      for (const [enTitle, koTitle, path] of items) {
        const file = `${prefix}${path}${path.endsWith("/") ? "index" : ""}.md`;
        generated.push(file);
        const url = new URL(file, siteUrl).href;
        const title = korean ? koTitle : enTitle;
        const source = await readFile(join(config.srcDir, file), "utf8");
        const body = markdownForAi(source, file, siteUrl, markdown);
        const destination = join(config.outDir, file);
        await mkdir(dirname(destination), { recursive: true });
        // A BOM keeps Korean readable when a static host omits the charset.
        await writeFile(destination, `\uFEFF> ${notice}\n\n${body}`);
        index.push(`- [${title}](${url})`);
        full.push(
          `---\n\n${korean ? "원문" : "Source"}: [${title}](${url})\n\n${body}`,
        );
      }
    }
    const otherPrefix = korean ? "" : "ko/";
    const other = korean ? "English" : "한국어";
    index.push(
      "## Optional",
      `- [${other} llms.txt](${new URL(`${otherPrefix}llms.txt`, siteUrl).href})`,
      `- [${other} llms-full.txt](${new URL(`${otherPrefix}llms-full.txt`, siteUrl).href})`,
    );
    await writeFile(
      join(config.outDir, prefix, "llms.txt"),
      `\uFEFF${index.join("\n\n")}\n`,
    );
    await writeFile(
      join(config.outDir, prefix, "llms-full.txt"),
      `\uFEFF${full.join("\n\n")}\n`,
    );
  }
  assert.deepEqual(
    generated.sort(),
    config.pages
      .filter((file) => !["index.md", "ko/index.md"].includes(file))
      .sort(),
    "Every documentation page must appear in the AI exports and sidebar",
  );
}
