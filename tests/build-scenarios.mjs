// Builds the site once per content scenario into dist-test/<name> and indexes it with Pagefind.
// Usage: node tests/build-scenarios.mjs [scenario ...]
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const scenarios = JSON.parse(readFileSync(resolve(import.meta.dirname, 'scenarios.json'), 'utf8'));
const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(scenarios);

for (const name of names) {
  const outDir = resolve(root, 'dist-test', name);
  rmSync(outDir, { recursive: true, force: true });
  const env = { ...process.env, ARTICLES_DIR: resolve(root, 'tests/fixtures', name) };
  console.log(`\n▶ building scenario "${name}": ${scenarios[name].description}`);
  execFileSync('npx', ['astro', 'build', '--force', '--outDir', outDir], { cwd: root, env, stdio: 'inherit' });
  execFileSync('npx', ['pagefind', '--site', outDir], { cwd: root, env, stdio: 'ignore' });
}
