import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
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
const bump = release.jobs["create-version-commit"].steps.find(
  (step) => step.id === "version",
);
const notes = release.jobs["create-github-release"].steps.find(
  (step) => step.id === "release_notes",
);

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), "nitro-changesets-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const env = {
    ...process.env,
    CI: "true",
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
  writeFileSync(join(cwd, ".gitignore"), "node_modules/\n.yarn/\noutput\n");
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

test("release refuses empty changesets without making a version commit", (t) => {
  const { cwd, run, commit, env } = fixture(t);
  writeFileSync(join(cwd, ".changeset/tooling.md"), "---\n---\n");
  commit();
  const before = run("git", ["rev-parse", "HEAD"]);
  const result = spawnSync("bash", ["-c", bump.run], {
    cwd,
    env,
    encoding: "utf8",
  });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /No pending changesets/);
  assert.equal(run("git", ["rev-parse", "HEAD"]), before);
});

test("release consumes changesets, commits the changelog, and extracts only the new notes", (t) => {
  const { cwd, run, commit, env } = fixture(t);
  writeFileSync(
    join(cwd, ".changeset/fix.md"),
    '---\n"react-native-nitro-cookies": patch\n---\n\nFix navigation callbacks.\n',
  );
  writeFileSync(
    join(cwd, "package/CHANGELOG.md"),
    "# react-native-nitro-cookies\n\n## 1.3.0\n\nOld release notes.\n",
  );
  commit();
  const result = spawnSync("bash", ["-c", bump.run], {
    cwd,
    env,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(
    JSON.parse(readFileSync(join(cwd, "package/package.json"))).version,
    "1.3.1",
  );
  assert.match(readFileSync(env.GITHUB_OUTPUT, "utf8"), /version=1.3.1/);
  const commitStep = release.jobs["create-version-commit"].steps.find(
    (step) => step.id === "commit",
  );
  execFileSync("bash", ["-c", commitStep.run], {
    cwd,
    env: { ...env, VERSION: "1.3.1" },
  });
  assert.equal(
    JSON.parse(readFileSync(join(cwd, "example/package.json"))).version,
    "0.0.1",
  );
  assert.match(
    run("git", ["show", "HEAD:package/CHANGELOG.md"]),
    /Fix navigation callbacks/,
  );
  assert.equal(run("git", ["ls-files", ".changeset/fix.md"]), "");
  assert.equal(run("git", ["status", "--porcelain"]), "");
  const generated = spawnSync("bash", ["-c", notes.run], {
    cwd,
    encoding: "utf8",
    env: {
      ...env,
      VERSION: "1.3.1",
      TAG_NAME: "v1.3.1",
      GITHUB_REPOSITORY: "example/react-native-nitro-cookies",
    },
  });
  assert.equal(generated.status, 0, generated.stderr);
  const notesPath = join(cwd, "release_notes.md");
  const body = readFileSync(notesPath, "utf8");
  assert.match(body, /Fix navigation callbacks/);
  assert.doesNotMatch(body, /Old release notes/);
  assert.match(body, /npm install react-native-nitro-cookies@1.3.1/);
});

test("release rejects an existing version tag", (t) => {
  const { cwd, run, commit, env } = fixture(t);
  writeFileSync(
    join(cwd, ".changeset/fix.md"),
    '---\n"react-native-nitro-cookies": patch\n---\n\nFix cookie lookup.\n',
  );
  commit();
  run("git", ["tag", "v1.3.1"]);
  const result = spawnSync("bash", ["-c", bump.run], {
    cwd,
    env,
    encoding: "utf8",
  });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /Tag v1.3.1 already exists/);
});

test("dry runs restore the versioned manifest and changelog for packaging and release notes", () => {
  const upload = release.jobs["create-version-commit"].steps.find((step) =>
    step.uses?.startsWith("actions/upload-artifact@"),
  );
  assert.equal(upload.if, "github.event.inputs.dry_run == 'true'");
  assert.deepEqual(upload.with.path.trim().split("\n"), [
    "package/package.json",
    "package/CHANGELOG.md",
  ]);
  for (const job of ["publish-npm", "create-github-release"]) {
    const steps = release.jobs[job].steps;
    const restore = steps.find((step) =>
      step.uses?.startsWith("actions/download-artifact@"),
    );
    assert.equal(restore.if, upload.if);
    assert.equal(restore.with.name, upload.with.name);
    assert.equal(restore.with.path, "package");
    const consumer = steps.find(
      (step) => step.name === "Build library" || step.id === "release_notes",
    );
    assert(steps.indexOf(restore) < steps.indexOf(consumer));
  }
});
