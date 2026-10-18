import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { parse } from "yaml";

const root = fileURLToPath(new URL("../../", import.meta.url));
const release = parse(
  readFileSync(join(root, ".github/workflows/publish.yml"), "utf8"),
);
const publishSteps = release.jobs.publish.steps;
const check = publishSteps.find((step) => step.id === "version");
const notes = publishSteps.find((step) => step.id === "release_notes");

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), "nitro-changesets-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  // Fake `npm view <pkg>@<version> <field>` backed by FAKE_NPM="<version>=<gitHead> ...".
  const bin = join(cwd, ".bin");
  mkdirSync(bin);
  writeFileSync(
    join(bin, "npm"),
    [
      "#!/bin/sh",
      'v="${2#*@}"',
      "for e in $FAKE_NPM; do",
      '  case "$e" in "$v="*) if [ "$3" = gitHead ]; then echo "${e#*=}"; else echo "$v"; fi; exit 0;; esac',
      "done",
      "exit 1",
      "",
    ].join("\n"),
  );
  chmodSync(join(bin, "npm"), 0o755);
  const env = {
    ...process.env,
    CI: "true",
    FAKE_NPM: "",
    PATH: `${bin}:${process.env.PATH}`,
    GITHUB_OUTPUT: join(cwd, "output"),
  };
  const run = (command, args) =>
    execFileSync(command, args, { cwd, env, encoding: "utf8" });
  mkdirSync(join(cwd, ".changeset"));
  writeFileSync(
    join(cwd, ".changeset/config.json"),
    readFileSync(join(root, ".changeset/config.json")),
  );
  writeFileSync(
    join(cwd, ".yarnrc.yml"),
    `yarnPath: ${JSON.stringify(join(root, ".yarn/releases/yarn-4.18.1.cjs"))}\nnodeLinker: node-modules\n`,
  );
  writeFileSync(
    join(cwd, ".gitignore"),
    "node_modules/\n.yarn/\n.bin/\noutput\n",
  );
  writeFileSync(
    join(cwd, "package.json"),
    JSON.stringify(
      {
        name: "cookies-test-monorepo",
        private: true,
        workspaces: ["package", "example"],
        packageManager: "yarn@4.18.1",
        scripts: {
          "version-packages": `node ${JSON.stringify(join(root, "node_modules/@changesets/cli/bin.js"))} version`,
        },
      },
      null,
      2,
    ) + "\n",
  );
  mkdirSync(join(cwd, "package"));
  mkdirSync(join(cwd, "example"));
  writeFileSync(
    join(cwd, "package/package.json"),
    JSON.stringify({ name: "react-native-nitro-cookies", version: "1.3.0" }),
  );
  writeFileSync(
    join(cwd, "example/package.json"),
    JSON.stringify({
      name: "example",
      version: "0.0.1",
      private: true,
      dependencies: { "react-native-nitro-cookies": "*" },
    }),
  );
  // The new fixture needs a lockfile before CI's immutable installs can run.
  run("yarn", ["install", "--no-immutable"]);
  run("git", ["init", "-b", "main"]);
  run("git", ["config", "user.name", "Release test"]);
  run("git", ["config", "user.email", "release@example.com"]);
  const commit = () => {
    run("git", ["add", "."]);
    run("git", ["commit", "-m", "Test fixture"]);
  };
  commit();
  return { cwd, run, commit, env };
}

function setVersion(cwd, version) {
  writeFileSync(
    join(cwd, "package/package.json"),
    JSON.stringify({ name: "react-native-nitro-cookies", version }),
  );
}

test("pushes to main open the Version PR and publish once it is merged", () => {
  assert.deepEqual(release.on.push.branches, ["main"]);
  const { version, publish } = release.jobs;
  assert.equal(version.if, "github.event_name == 'push'");
  assert.equal(version.outputs.release, "${{ steps.release.outputs.needed }}");
  assert.equal(publish.needs, "version");
  assert.equal(
    publish.if,
    "!cancelled() && github.ref == 'refs/heads/main' && (github.event_name == 'workflow_dispatch' || needs.version.outputs.release == 'true')",
  );
  assert.equal(release.concurrency.group, "release-${{ github.event_name }}");
  const action = version.steps.find((step) =>
    step.uses?.startsWith("changesets/action@"),
  );
  assert.equal(action.with["version-script"], "yarn version-packages");
  assert.equal(action.with.publish, undefined);
  assert.equal(action.with["push-git-tags"], false);
  assert.equal(action.with["create-github-releases"], false);
});

test("the Version PR consumes changesets and skips the private example", (t) => {
  const { cwd, run, env } = fixture(t);
  writeFileSync(
    join(cwd, ".changeset/fix.md"),
    '---\n"react-native-nitro-cookies": patch\n---\n\nFix navigation callbacks.\n',
  );
  run("yarn", ["version-packages"]);
  assert.equal(
    JSON.parse(readFileSync(join(cwd, "package/package.json"))).version,
    "1.3.1",
  );
  assert.equal(
    JSON.parse(readFileSync(join(cwd, "example/package.json"))).version,
    "0.0.1",
  );
  assert.match(
    readFileSync(join(cwd, "package/CHANGELOG.md"), "utf8"),
    /Fix navigation callbacks/,
  );
  // The Version PR job re-runs an immutable install after versioning.
  execFileSync("yarn", ["install", "--immutable"], { cwd, env });
});

test("a push publishes only when no changesets are pending and npm lacks the version", (t) => {
  const step = release.jobs.version.steps.find((s) => s.id === "release");
  assert.equal(step.if, "steps.changesets.outputs.hasChangesets == 'false'");
  const { cwd, env } = fixture(t);
  const run = (npm) => {
    writeFileSync(env.GITHUB_OUTPUT, "");
    const result = spawnSync("bash", ["-c", step.run], {
      cwd,
      env: { ...env, FAKE_NPM: npm },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    return readFileSync(env.GITHUB_OUTPUT, "utf8").trim();
  };
  assert.equal(run(""), "needed=true");
  assert.equal(run("1.3.0=0123abc"), "");
});

function runCheck(cwd, env) {
  return spawnSync("bash", ["-c", check.run], { cwd, env, encoding: "utf8" });
}

function outputs(env) {
  return Object.fromEntries(
    readFileSync(env.GITHUB_OUTPUT, "utf8")
      .trim()
      .split("\n")
      .map((line) => line.split("=")),
  );
}

test("publish rejects a version already on npm from another commit", (t) => {
  const { cwd, env } = fixture(t);
  const result = runCheck(cwd, { ...env, FAKE_NPM: "1.3.0=0123abc" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /already on npm from 0123abc/);
});

test("publish rejects a version on npm without a recorded commit", (t) => {
  const { cwd, env } = fixture(t);
  const result = runCheck(cwd, { ...env, FAKE_NPM: "1.3.0=" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /from an unknown commit/);
});

test("publish rejects a tag on another commit", (t) => {
  const { cwd, run, commit, env } = fixture(t);
  run("git", ["tag", "v1.3.1"]);
  setVersion(cwd, "1.3.1");
  commit();
  const result = runCheck(cwd, env);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /Tag v1.3.1 already exists on another commit/);
});

test("publish rejects a tag whose version is not on npm", (t) => {
  const { cwd, run, env } = fixture(t);
  run("git", ["tag", "v1.3.0"]);
  const result = runCheck(cwd, env);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /npm does not have this version/);
});

test("publish resumes a partial release when npm's gitHead matches HEAD", (t) => {
  const { cwd, run, env } = fixture(t);
  const head = run("git", ["rev-parse", "HEAD"]).trim();
  const resumed = runCheck(cwd, { ...env, FAKE_NPM: `1.3.0=${head}` });
  assert.equal(resumed.status, 0, resumed.stdout + resumed.stderr);
  assert.deepEqual(outputs(env), {
    version: "1.3.0",
    published: "true",
    tagged: "false",
  });
  run("git", ["tag", "v1.3.0"]);
  writeFileSync(env.GITHUB_OUTPUT, "");
  const tagged = runCheck(cwd, { ...env, FAKE_NPM: `1.3.0=${head}` });
  assert.equal(tagged.status, 0, tagged.stdout + tagged.stderr);
  assert.equal(outputs(env).tagged, "true");
});

test("completed release steps are skipped on resume", () => {
  const step = (name) => publishSteps.find((s) => s.name === name);
  assert.equal(
    step("Publish to NPM").if,
    "steps.version.outputs.published != 'true'",
  );
  assert.equal(
    step("Create and push tag").if,
    "steps.version.outputs.tagged != 'true'",
  );
  assert.match(step("Create Release").run, /gh release view/);
});

test("publish accepts an unpublished version and extracts only its notes", (t) => {
  const { cwd, run, commit, env } = fixture(t);
  const previous = run("git", ["rev-parse", "HEAD"]).trim();
  run("git", ["tag", "v1.3.0"]);
  setVersion(cwd, "1.3.1");
  writeFileSync(
    join(cwd, "package/CHANGELOG.md"),
    "# react-native-nitro-cookies\n\n## 1.3.1\n\n### Patch Changes\n\n- Fix navigation callbacks.\n\n## 1.3.0\n\nOld release notes.\n",
  );
  commit();
  const checked = runCheck(cwd, { ...env, FAKE_NPM: `1.3.0=${previous}` });
  assert.equal(checked.status, 0, checked.stdout + checked.stderr);
  assert.deepEqual(outputs(env), {
    version: "1.3.1",
    published: "false",
    tagged: "false",
  });
  const generated = spawnSync("bash", ["-c", notes.run], {
    cwd,
    encoding: "utf8",
    env: { ...env, VERSION: "1.3.1" },
  });
  assert.equal(generated.status, 0, generated.stderr);
  const body = readFileSync(join(cwd, "release_notes.md"), "utf8");
  assert.match(body, /Fix navigation callbacks/);
  assert.doesNotMatch(body, /Old release notes/);
  assert.match(body, /npm install react-native-nitro-cookies@1.3.1/);
  assert.match(body, /compare\/v1.3.0\.\.\.v1.3.1/);
});
