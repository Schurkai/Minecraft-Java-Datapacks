import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Enchant_Plus.sync_korean_fallbacks';

const toolsRoot = path.dirname(fileURLToPath(import.meta.url));
const packRoot = path.resolve(toolsRoot, '..');
const projectRoot = path.resolve(packRoot, '..');
const langRoot = path.join(projectRoot, 'Enchant_Plus_Resources', 'assets', 'enchant_plus', 'lang');
const koPath = path.join(langRoot, 'ko_kr.json');
const enPath = path.join(langRoot, 'en_us.json');
const ko = JSON.parse(fs.readFileSync(koPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

for (const dictionary of [ko, en]) {
  for (const key of Object.keys(dictionary)) {
    if (key.includes('.toybox.')) delete dictionary[key];
  }
}
ko['pack.enchant_plus.description'] = '인챈트플러스 v1.1.4 — Minecraft Java 26.2';
ko['message.enchant_plus.enabled'] = '[인챈트플러스] v1.1.4가 활성화되었습니다. 도움말: /trigger ep_help';
ko['message.enchant_plus.help.title'] = '인챈트플러스 v1.1.4 | Minecraft Java 26.2';
en['pack.enchant_plus.description'] = 'Enchant Plus v1.1.4 — Minecraft Java 26.2';
en['message.enchant_plus.enabled'] = '[Enchant Plus] v1.1.4 enabled. Help: /trigger ep_help';
en['message.enchant_plus.help.title'] = 'Enchant Plus v1.1.4 | Minecraft Java 26.2';
fs.writeFileSync(koPath, `${JSON.stringify(ko, null, 2)}\n`, 'utf8');
fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8');

function walk(root) {
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const pattern = /("translate"\s*:\s*"([^"]+)"\s*,\s*"fallback"\s*:\s*)"(?:\\.|[^"\\])*"/g;
const candidates = [
  path.join(packRoot, 'pack.mcmeta'),
  ...walk(path.join(packRoot, 'data')).filter((file) => file.endsWith('.json') || file.endsWith('.mcfunction')),
];

let changedFiles = 0;
let changedFallbacks = 0;
for (const file of candidates) {
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(pattern, (whole, prefix, key) => {
    if (!Object.hasOwn(ko, key)) return whole;
    changedFallbacks += 1;
    return `${prefix}${JSON.stringify(ko[key])}`;
  });
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changedFiles += 1;
  }
}

console.log(`Synchronized ${changedFallbacks} Korean fallbacks across ${changedFiles} changed files.`);
