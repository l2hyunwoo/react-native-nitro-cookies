import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import { sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = new URL("../", import.meta.url);
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
console.log(`Build: ${fileURLToPath(new URL(".vitepress/dist/", root))}`);
