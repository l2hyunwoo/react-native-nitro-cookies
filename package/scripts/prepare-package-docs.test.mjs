import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

test('copy workspace docs and retain packaged copies outside the workspace', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'nitro-package-docs-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const packageRoot = join(root, 'package');
  const script = join(packageRoot, 'scripts', 'prepare-package-docs.mjs');
  mkdirSync(join(packageRoot, 'scripts'), { recursive: true });
  copyFileSync(new URL('./prepare-package-docs.mjs', import.meta.url), script);
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: 'react-native-nitro-cookies-monorepo' })
  );

  for (const name of ['README.md', 'LICENSE']) {
    writeFileSync(join(root, name), `Root ${name}`);
    writeFileSync(join(packageRoot, name), 'stale copy');
  }
  execFileSync(process.execPath, [script], { cwd: tmpdir() });
  for (const name of ['README.md', 'LICENSE']) {
    assert.equal(readFileSync(join(packageRoot, name), 'utf8'), `Root ${name}`);
  }

  writeFileSync(join(root, 'package.json'), '{"name":"unrelated-consumer"}');
  for (const name of ['README.md', 'LICENSE']) {
    writeFileSync(join(root, name), 'Unrelated parent document');
  }
  execFileSync(process.execPath, [script]);
  for (const name of ['README.md', 'LICENSE']) {
    assert.equal(readFileSync(join(packageRoot, name), 'utf8'), `Root ${name}`);
    rmSync(join(root, name));
  }
  rmSync(join(root, 'package.json'));
  execFileSync(process.execPath, [script]);

  rmSync(join(packageRoot, 'LICENSE'));
  assert.throws(() =>
    execFileSync(process.execPath, [script], { stdio: 'pipe' })
  );
});
