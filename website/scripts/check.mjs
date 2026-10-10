import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import { sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { createMarkdownRenderer } from "vitepress";
import { markdownForAi } from "./llms.mjs";

const root = new URL("../", import.meta.url);
const siteUrl = "https://l2hyunwoo.github.io/react-native-nitro-cookies/";
const markdown = await createMarkdownRenderer(fileURLToPath(root));
const fixture = [
  "---",
  "title: Fixture",
  "---",
  "# Fixture",
  "",
  "::: code-group",
  "",
  "```ts",
  "const link = '[Code](../do-not-rewrite)';",
  "```",
  "",
  ":::",
  "",
  "[Types](../reference/types#cookie) and `code [link](../unchanged)`.",
  "[Reference](../reference/) [External](https://example.com/page)",
].join("\n");
assert.equal(
  markdownForAi(fixture, "guides/fixture.md", siteUrl, markdown),
  [
    "# Fixture",
    "",
    "",
    "",
    "```ts",
    "const link = '[Code](../do-not-rewrite)';",
    "```",
    "",
    "",
    "",
    `[Types](${siteUrl}reference/types.md#cookie) and \`code [link](../unchanged)\`.`,
    `[Reference](${siteUrl}reference/index.md) [External](https://example.com/page)`,
    "",
  ].join("\n"),
  "AI Markdown must remove frontmatter and containers while preserving code",
);
const files = (await readdir(new URL("content/", root), { recursive: true }))
  .filter((file) => file.endsWith(".md"))
  .map((file) => file.split(sep).join("/"));
const english = files.filter((file) => !file.startsWith("ko/")).sort();
const korean = files
  .filter((file) => file.startsWith("ko/"))
  .map((file) => file.slice(3))
  .sort();
assert.deepEqual(
  korean,
  english,
  "Every English page needs a Korean counterpart",
);

const source = ts.createSourceFile(
  "index.tsx",
  await readFile(new URL("../package/src/index.tsx", root), "utf8"),
  ts.ScriptTarget.Latest,
  true,
);
const declaration = source.statements
  .filter(ts.isVariableStatement)
  .flatMap((statement) => statement.declarationList.declarations)
  .find((entry) => entry.name.getText(source) === "NitroCookies");
assert.ok(declaration && ts.isObjectLiteralExpression(declaration.initializer));
const methods = declaration.initializer.properties.filter(
  ts.isMethodDeclaration,
);
assert.ok(methods.length > 0, "Public operations must be discovered");

for (const prefix of ["", "ko/"]) {
  const index = await readFile(
    new URL(`.vitepress/dist/${prefix}llms.txt`, root),
    "utf8",
  );
  const full = await readFile(
    new URL(`.vitepress/dist/${prefix}llms-full.txt`, root),
    "utf8",
  );
  assert.ok(index.startsWith("\uFEFF# Nitro Cookies\n\n> "));
  assert.ok(full.startsWith("\uFEFF# Nitro Cookies\n\n> "));
  assert.ok(index.includes("## Optional\n"));
  assert.ok(
    full.includes(prefix ? "아직 출시하지 않았습니다" : "are unreleased"),
  );
  const documents = english.filter((file) => file !== "index.md");
  const indexPages = [...index.matchAll(/^- \[[^\]]+\]\(([^)]+\.md)\)$/gm)].map(
    ([, url]) => url,
  );
  assert.deepEqual(
    [...indexPages].sort(),
    documents.map((file) => `${siteUrl}${prefix}${file}`).sort(),
  );
  assert.deepEqual(
    [...full.matchAll(/^(?:Source|원문): \[[^\]]+\]\(([^)]+)\)$/gm)].map(
      ([, url]) => url,
    ),
    indexPages,
    "Full-text pages must follow the index order",
  );
  const exports = [index, full];
  for (const file of documents) {
    const exported = await readFile(
      new URL(`.vitepress/dist/${prefix}${file}`, root),
      "utf8",
    );
    const original = await readFile(
      new URL(`content/${prefix}${file}`, root),
      "utf8",
    );
    assert.ok(
      exported.startsWith("\uFEFF"),
      `${prefix}${file}: missing UTF-8 BOM`,
    );
    const fences = (text) =>
      markdown
        .parse(text, {})
        .filter(
          (token) => token.type === "fence" || token.type === "code_block",
        )
        .map(({ content, info }) => ({ content, info }));
    assert.deepEqual(
      fences(exported),
      fences(original),
      `${prefix}${file}: exported code changed`,
    );
    const body = exported.slice(exported.indexOf("\n\n") + 2);
    assert.ok(
      full.includes(body),
      `${prefix}${file}: full text missing page content`,
    );
    exports.push(exported);
  }
  for (const text of exports) {
    const links = markdown
      .parse(text, {})
      .flatMap((token) => token.children ?? [])
      .filter(
        (token) =>
          token.type === "link_open" &&
          token.attrGet("class") !== "header-anchor",
      );
    for (const link of links) {
      const target = new URL(link.attrGet("href"));
      if (target.origin !== new URL(siteUrl).origin) continue;
      assert.ok(
        target.pathname.startsWith(new URL(siteUrl).pathname),
        "AI link escapes the project base",
      );
      const relative = decodeURIComponent(
        target.pathname.slice(new URL(siteUrl).pathname.length),
      );
      await access(new URL(`.vitepress/dist/${relative}`, root));
      if (target.hash && relative.endsWith(".md")) {
        const html = await readFile(
          new URL(
            `.vitepress/dist/${relative.replace(/\.md$/, ".html")}`,
            root,
          ),
          "utf8",
        );
        assert.ok(
          html.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`),
          `AI link has a missing anchor: ${target.href}`,
        );
      }
    }
  }
  const references = files.filter((file) =>
    file.startsWith(`${prefix}reference/`),
  );
  const referenceText = (
    await Promise.all(
      references.map((file) =>
        readFile(new URL(`content/${file}`, root), "utf8"),
      ),
    )
  ).join("\n");
  for (const method of methods) {
    const name = method.name.getText(source);
    assert.ok(
      referenceText.includes(`## ${name}\n`),
      `${prefix}reference missing ${name}`,
    );
    const signature = `${name}(${method.parameters.map((parameter) => parameter.getText(source)).join(", ")}): ${method.type.getText(source)}`;
    assert.ok(
      referenceText.replace(/\s/g, "").includes(signature.replace(/\s/g, "")),
      `${prefix}reference has an outdated signature for ${name}`,
    );
    assert.ok(
      full.replace(/\s/g, "").includes(signature.replace(/\s/g, "")),
      `${prefix}llms-full.txt missing public signature for ${name}`,
    );
  }
  for (const file of english) {
    const htmlFile = file.replace(/\.md$/, ".html");
    const html = await readFile(
      new URL(`.vitepress/dist/${prefix}${htmlFile}`, root),
      "utf8",
    );
    assert.ok(
      html.includes(`lang="${prefix ? "ko" : "en"}"`),
      `${file}: incorrect document language`,
    );
    assert.ok(
      html.includes("/react-native-nitro-cookies/assets/"),
      `${file}: missing project base path`,
    );
    assert.ok(
      html.includes('alt="Nitro Cookies"'),
      `${file}: missing accessible logo`,
    );
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      assert.ok(/\balt="[^"]*"/.test(tag), `${file}: image needs alt text`);
      const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
      assert.ok(src, `${file}: image needs a source`);
      const image = new URL(src, siteUrl);
      if (image.origin !== new URL(siteUrl).origin) continue;
      assert.ok(
        image.pathname.startsWith(new URL(siteUrl).pathname),
        `${file}: image escapes the project base`,
      );
      await access(
        new URL(
          `.vitepress/dist/${image.pathname.slice(new URL(siteUrl).pathname.length)}`,
          root,
        ),
      );
    }
    assert.ok(
      html.includes(`rel="describedby" href="${siteUrl}${prefix}llms.txt"`),
    );
    if (file !== "index.md") {
      assert.ok(
        html.includes(
          `rel="alternate" type="text/markdown" href="${siteUrl}${prefix}${file}"`,
        ),
      );
    }
    const pageUrl = new URL(
      `/react-native-nitro-cookies/${prefix}${htmlFile}`,
      "https://site.invalid",
    );
    for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
      const target = new URL(href, pageUrl);
      if (target.origin !== pageUrl.origin) continue;
      assert.ok(
        target.pathname.startsWith("/react-native-nitro-cookies/"),
        `${file}: link escapes the project base: ${href}`,
      );
      const relative = decodeURIComponent(
        target.pathname.slice("/react-native-nitro-cookies/".length),
      );
      const resolved = relative.endsWith("/")
        ? `${relative}index.html`
        : relative;
      const targetFile = new URL(`.vitepress/dist/${resolved}`, root);
      await access(targetFile);
      if (target.hash && resolved.endsWith(".html")) {
        const targetHtml = await readFile(targetFile, "utf8");
        const id = decodeURIComponent(target.hash.slice(1));
        assert.ok(
          targetHtml.includes(`id="${id}"`),
          `${file}: missing anchor: ${href}`,
        );
      }
    }
  }
}
console.log(
  `Verified ${english.length} pages per language and ${methods.length} public operations.`,
);
console.log(
  "Verified English/Korean AI indexes, full text, Markdown pages, code, and links.",
);
console.log(`Build: ${fileURLToPath(new URL(".vitepress/dist/", root))}`);
