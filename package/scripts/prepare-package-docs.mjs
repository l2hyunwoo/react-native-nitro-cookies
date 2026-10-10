import { copyFileSync, existsSync, readFileSync } from 'node:fs';

const parentManifest = new URL('../../package.json', import.meta.url);
const inWorkspace =
  existsSync(parentManifest) &&
  JSON.parse(readFileSync(parentManifest, 'utf8')).name ===
    'react-native-nitro-cookies-monorepo';

for (const name of ['README.md', 'LICENSE']) {
  const target = new URL(`../${name}`, import.meta.url);
  if (inWorkspace) {
    copyFileSync(new URL(`../../${name}`, import.meta.url), target);
  }
  // A published package keeps its copies without reading the consuming app's docs.
  readFileSync(target);
}
