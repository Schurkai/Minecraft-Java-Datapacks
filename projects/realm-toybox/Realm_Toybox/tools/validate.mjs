import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Realm_Toybox.validate';

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDir, '..');
const projectRoot = path.resolve(root, '..');
const resourceRoot = path.join(projectRoot, 'Realm_Toybox_Resources');
const failures = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function relative(file) {
  return path.relative(projectRoot, file).replaceAll('\\', '/');
}

function readUtf8(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    failures.push(`UTF-8 BOM 금지: ${relative(file)}`);
  }
  return bytes.toString('utf8');
}

const packFiles = walk(root);
const resourceFiles = walk(resourceRoot);
const allSourceFiles = [...packFiles, ...resourceFiles];
const textExtensions = new Set(['.json', '.mcmeta', '.mcfunction', '.md', '.mjs', '.ps1']);
for (const file of allSourceFiles.filter((p) => textExtensions.has(path.extname(p).toLowerCase()))) readUtf8(file);

const jsonFiles = allSourceFiles.filter((p) => p.endsWith('.json') || p.endsWith('.mcmeta'));
const parsed = new Map();
for (const file of jsonFiles) {
  try { parsed.set(file, JSON.parse(fs.readFileSync(file, 'utf8'))); }
  catch (error) { failures.push(`JSON 오류: ${relative(file)}: ${error.message}`); }
}

const metaPath = path.join(root, 'pack.mcmeta');
const meta = parsed.get(metaPath);
if (!meta || JSON.stringify(meta.pack?.min_format) !== '[107,1]' || JSON.stringify(meta.pack?.max_format) !== '[107,1]') {
  failures.push('데이터팩 pack.mcmeta의 지원 형식이 107.1이 아닙니다.');
}
const resourceMeta = parsed.get(path.join(resourceRoot, 'pack.mcmeta'));
if (fs.existsSync(resourceRoot) && (!resourceMeta || JSON.stringify(resourceMeta.pack?.min_format) !== '[88,0]' || JSON.stringify(resourceMeta.pack?.max_format) !== '[88,0]')) {
  failures.push('리소스팩 pack.mcmeta의 지원 형식이 88.0이 아닙니다.');
}

function splitId(id) {
  const match = /^([a-z0-9_.-]+):([a-z0-9_./-]+)$/.exec(id);
  return match ? { namespace: match[1], value: match[2] } : null;
}

function dataPath(id, kind, extension = '.json') {
  const parsedId = splitId(id);
  if (!parsedId) return null;
  return path.join(root, 'data', parsedId.namespace, kind, `${parsedId.value}${extension}`);
}

function functionId(file) {
  const functionRoot = path.join(root, 'data');
  const rel = path.relative(functionRoot, file).replaceAll('\\', '/');
  const match = /^([^/]+)\/function\/(.+)\.mcfunction$/.exec(rel);
  return match ? `${match[1]}:${match[2]}` : null;
}

function requireLocal(id, kind, source, extension = '.json') {
  const parsedId = splitId(id);
  if (!parsedId || parsedId.namespace === 'minecraft') return;
  const target = dataPath(id, kind, extension);
  if (!fs.existsSync(target)) failures.push(`참조 누락: ${id} -> ${kind} (${relative(source)})`);
}

const functionFiles = packFiles.filter((p) => p.endsWith('.mcfunction'));
const functionCalls = new Map();
const functionFilesById = new Map();
for (const file of functionFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const calls = [];
  const id = functionId(file);
  if (id) functionFilesById.set(id, file);
  for (const match of text.matchAll(/(?:^|\s)function\s+(#?)([a-z0-9_.-]+:[a-z0-9_./-]+)/gm)) {
    if (match[1] === '#') requireLocal(match[2], path.join('tags', 'function'), file);
    else {
      requireLocal(match[2], 'function', file, '.mcfunction');
      calls.push(match[2]);
    }
  }
  for (const match of text.matchAll(/\bschedule\s+function\s+(#?)([a-z0-9_.-]+:[a-z0-9_./-]+)/g)) {
    if (match[1] === '#') requireLocal(match[2], path.join('tags', 'function'), file);
    else {
      requireLocal(match[2], 'function', file, '.mcfunction');
      calls.push(match[2]);
    }
  }
  for (const match of text.matchAll(/\bpredicate\s+([a-z0-9_.-]+:[a-z0-9_./-]+)/g)) requireLocal(match[1], 'predicate', file);
  for (const match of text.matchAll(/\brecipe\s+(?:give|take)\s+\S+\s+([a-z0-9_.-]+:[a-z0-9_./-]+)/g)) requireLocal(match[1], 'recipe', file);
  for (const match of text.matchAll(/\bitem\s+modify\s+[^\r\n]+?\s+([a-z0-9_.-]+:[a-z0-9_./-]+)\s*$/gm)) requireLocal(match[1], 'item_modifier', file);
  for (const match of text.matchAll(/\bif\s+block\s+[^\r\n]+?\s+#([a-z0-9_.-]+:[a-z0-9_./-]+)/g)) requireLocal(match[1], path.join('tags', 'block'), file);
  functionCalls.set(file, calls);
}

// Function macro placeholders are parsed only on lines prefixed with '$'.
// Catching this statically is substantially clearer than the server's
// cascading "unknown command" errors for a malformed generated function.
for (const file of functionFiles) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trimStart();
    if (line.includes('$(') && !line.startsWith('$')) {
      failures.push(`함수 매크로 줄에 $ 접두사가 없습니다: ${relative(file)}:${index + 1}`);
    }
    if (line.startsWith('$') && !line.includes('$(')) {
      failures.push(`치환 변수가 없는 함수 매크로 줄입니다: ${relative(file)}:${index + 1}`);
    }
    const placeholderStarts = (line.match(/\$\(/g) ?? []).length;
    const validPlaceholders = (line.match(/\$\([a-zA-Z0-9_.-]+\)/g) ?? []).length;
    if (placeholderStarts !== validPlaceholders) {
      failures.push(`함수 매크로 치환 문법을 확인하십시오: ${relative(file)}:${index + 1}`);
    }
    if (/\bitem\s+replace\b[^\r\n]*\bfrom\s+storage\b/.test(line)) {
      failures.push(`26.2에 없는 item replace ... from storage 문법: ${relative(file)}:${index + 1}`);
    }
  }
}

function inspectJson(value, file, parentKey = '') {
  if (Array.isArray(value)) {
    for (const child of value) inspectJson(child, file, parentKey);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'function' && typeof child === 'string') requireLocal(child, 'function', file, '.mcfunction');
    if ((key === 'supported_items' || key === 'primary_items') && typeof child === 'string' && child.startsWith('#')) {
      requireLocal(child.slice(1), path.join('tags', 'item'), file);
    }
    if (key === 'exclusive_set' && typeof child === 'string' && child.startsWith('#')) {
      requireLocal(child.slice(1), path.join('tags', 'enchantment'), file);
    }
    inspectJson(child, file, key);
  }
}
for (const [file, value] of parsed) if (file.startsWith(root + path.sep)) inspectJson(value, file);

for (const tagName of ['load', 'tick']) {
  const tagPath = path.join(root, 'data', 'minecraft', 'tags', 'function', `${tagName}.json`);
  const tag = parsed.get(tagPath);
  if (!tag || !Array.isArray(tag.values)) failures.push(`minecraft:${tagName} 함수 태그가 없거나 잘못되었습니다.`);
  else for (const value of tag.values) if (typeof value === 'string' && !value.startsWith('#')) requireLocal(value, 'function', tagPath, '.mcfunction');
}

// Follow the complete local tick call graph. Bounded type+tag selectors used
// only by active-player/event cleanup are allowed; bare global scans are not.
const tickTagPath = path.join(root, 'data', 'minecraft', 'tags', 'function', 'tick.json');
const tickRoots = parsed.get(tickTagPath)?.values?.filter((v) => typeof v === 'string' && !v.startsWith('#')) ?? [];
const pending = [...tickRoots];
const reachable = new Set();
while (pending.length) {
  const id = pending.pop();
  if (reachable.has(id)) continue;
  reachable.add(id);
  const file = dataPath(id, 'function', '.mcfunction');
  if (!file || !fs.existsSync(file)) continue;
  for (const selector of fs.readFileSync(file, 'utf8').matchAll(/@e(?:\[([^\]]*)\])?/g)) {
    const options = selector[1] ?? '';
    if (!/\btype\s*=/.test(options) || (!/\bdistance\s*=/.test(options) && !/\btag\s*=/.test(options))) {
      failures.push(`틱 호출 그래프의 무제한 @e 선택자: ${relative(file)}: ${selector[0]}`);
    }
  }
  for (const called of functionCalls.get(file) ?? []) pending.push(called);
}

function calledFunctionGraph(rootId) {
  const graph = new Set();
  const queue = [rootId];
  while (queue.length) {
    const id = queue.pop();
    if (graph.has(id)) continue;
    graph.add(id);
    const file = functionFilesById.get(id);
    if (!file) continue;
    for (const called of functionCalls.get(file) ?? []) queue.push(called);
  }
  return graph;
}

function jsonContains(value, predicate) {
  if (predicate(value)) return true;
  if (Array.isArray(value)) return value.some((child) => jsonContains(child, predicate));
  if (value && typeof value === 'object') return Object.values(value).some((child) => jsonContains(child, predicate));
  return false;
}

function checkInteractionFeature({ directory, advancement, block, reward }) {
  const featureDir = path.join(root, 'data', 'toybox', 'function', directory);
  const advancementPath = dataPath(`toybox:${advancement}`, 'advancement');
  const present = fs.existsSync(featureDir) || (advancementPath && fs.existsSync(advancementPath));
  if (!present) return;

  if (!advancementPath || !fs.existsSync(advancementPath)) {
    failures.push(`${directory} 사건 진입 advancement가 없습니다: toybox:${advancement}`);
    return;
  }
  const definition = parsed.get(advancementPath);
  const criteria = definition?.criteria && typeof definition.criteria === 'object'
    ? Object.values(definition.criteria)
    : [];
  if (!criteria.length) failures.push(`상호작용 advancement criteria가 비어 있습니다: toybox:${advancement}`);
  if (!criteria.some((criterion) => criterion?.trigger === 'minecraft:default_block_use')) {
    failures.push(`${directory}는 매 틱 감시 대신 minecraft:default_block_use 사건을 사용해야 합니다.`);
  }
  if (!jsonContains(criteria, (value) => value === block)) {
    failures.push(`${directory} 상호작용 advancement에 ${block} 위치 조건이 없습니다.`);
  }
  if (definition?.rewards?.function !== reward) {
    failures.push(`${directory} advancement 보상 함수가 ${reward}이(가) 아닙니다.`);
  }

  const callback = functionFilesById.get(reward);
  if (!callback) return;
  const callbackText = fs.readFileSync(callback, 'utf8');
  if (!callbackText.includes(`advancement revoke @s only toybox:${advancement}`)) {
    failures.push(`${reward}가 자기 advancement를 회수하지 않아 상호작용을 반복할 수 없습니다.`);
  }

  const graph = calledFunctionGraph(reward);
  const graphFiles = [...graph].map((id) => functionFilesById.get(id)).filter(Boolean);
  const graphText = graphFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  if (graphText.includes('storage toybox:scratch')) {
    if (!graphText.includes('data remove storage toybox:scratch')) {
      failures.push(`${directory}가 전역 scratch 저장소를 사용하지만 초기화/정리하지 않습니다.`);
    }
    if (/\bschedule\s+function\b/.test(graphText)) {
      failures.push(`${directory}의 전역 scratch 작업은 schedule 없이 한 콜백 안에서 동기적으로 끝나야 합니다.`);
    }
  }
  for (const id of graph) {
    if (reachable.has(id)) failures.push(`${directory} 사건 처리 함수가 매 틱 호출 그래프에도 연결되어 있습니다: ${id}`);
  }
  for (const file of graphFiles) {
    for (const selector of fs.readFileSync(file, 'utf8').matchAll(/@e(?:\[([^\]]*)\])?/g)) {
      const options = selector[1] ?? '';
      if (!/\btype\s*=/.test(options) || (!/\bdistance\s*=/.test(options) && !/\btag\s*=/.test(options))) {
        failures.push(`${directory} 사건 그래프의 무제한 @e 선택자: ${relative(file)}: ${selector[0]}`);
      }
    }
  }
}

checkInteractionFeature({
  directory: 'advanced_enchant',
  advancement: 'interaction/enchanting_table',
  block: 'minecraft:enchanting_table',
  reward: 'toybox:advanced_enchant/interact',
});
checkInteractionFeature({
  directory: 'alchemy',
  advancement: 'interaction/brewing_stand',
  block: 'minecraft:brewing_stand',
  reward: 'toybox:alchemy/interact',
});

const advancedEnchantFiles = functionFiles.filter((file) =>
  file.startsWith(path.join(root, 'data', 'toybox', 'function', 'advanced_enchant') + path.sep));
for (const file of advancedEnchantFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\benchant\s+\S+\s+[a-z0-9_.-]+:[a-z0-9_./-]+\s+(\d+)\b/g)) {
    if (Number(match[1]) > 10) failures.push(`고등 마법부여 출력 레벨 X 초과: ${relative(file)}: ${match[0]}`);
  }
}

const advancedModifierRoot = path.join(root, 'data', 'toybox', 'item_modifier', 'advanced_enchant');
const advancedModifierFiles = packFiles.filter((file) =>
  file.startsWith(advancedModifierRoot + path.sep) && file.endsWith('.json'));
for (const file of advancedModifierFiles) {
  const segments = path.relative(advancedModifierRoot, file).replaceAll('\\', '/').split('/');
  if (segments.length !== 2) {
    failures.push(`[ADV_MODIFIER_PATH] 생성된 고등 마법부여 item_modifier 경로가 잘못되었습니다: ${relative(file)}`);
    continue;
  }
  const enchantmentName = segments[0];
  const levelFromName = Number(path.basename(segments[1], '.json'));
  const modifier = parsed.get(file);
  if (modifier?.function !== 'minecraft:set_enchantments') {
    failures.push(`[ADV_MODIFIER_FUNCTION] minecraft:set_enchantments가 아닙니다: ${relative(file)}`);
  }
  const enchantments = modifier?.enchantments;
  const enchantmentKeys = enchantments && typeof enchantments === 'object' && !Array.isArray(enchantments)
    ? Object.keys(enchantments)
    : [];
  const targetId = `minecraft:${enchantmentName}`;
  if (enchantmentKeys.length !== 1 || enchantmentKeys[0] !== targetId) {
    failures.push(`[ADV_MODIFIER_SINGLE] 목표 단일 인챈트 ${targetId}만 포함해야 합니다: ${relative(file)}`);
  }
  if (modifier?.add !== false) {
    failures.push(`[ADV_MODIFIER_ADD] set_enchantments는 add: false여야 합니다: ${relative(file)}`);
  }
  const level = enchantments?.[targetId];
  if (!Number.isInteger(levelFromName) || levelFromName < 1 || levelFromName > 10 ||
      !Number.isInteger(level) || level !== levelFromName || level > 10) {
    failures.push(`[ADV_MODIFIER_LEVEL] 파일명과 같은 1..10 정수 레벨이어야 합니다: ${relative(file)}`);
  }
}

const alchemyFiles = functionFiles.filter((file) =>
  file.startsWith(path.join(root, 'data', 'toybox', 'function', 'alchemy') + path.sep));
const alchemyText = alchemyFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
if (alchemyFiles.length) {
  for (const file of alchemyFiles) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (!/\bitem\s+replace\b/.test(line) || !/minecraft:potion_contents/.test(line)) continue;
      for (const match of line.matchAll(/\bamplifier\s*:\s*(-?\d+)[bsilfLdD]?\b/g)) {
        if (Number(match[1]) > 4) failures.push(`합성 포션 출력 레벨 V 초과: ${relative(file)}:${index + 1}`);
      }
      for (const match of line.matchAll(/\bduration\s*:\s*(\d+)[bsilfLdD]?\b/g)) {
        if (Number(match[1]) > 72000) failures.push(`합성 포션 출력 지속시간 72,000틱 초과: ${relative(file)}:${index + 1}`);
      }
    }
  }
  for (const item of ['minecraft:potion', 'minecraft:splash_potion', 'minecraft:lingering_potion']) {
    if (!alchemyText.includes(item)) failures.push(`포션 합성에서 ${item} 형식을 처리하는 근거가 없습니다.`);
  }
}

const clientKitEntry = functionFilesById.get('toybox:dev/client_test_kit');
const clientKitBuild = functionFilesById.get('toybox:dev/client_test/build_here');
const clientKitCleanup = functionFilesById.get('toybox:dev/client_test/cleanup');
const clientKitCleanupHere = functionFilesById.get('toybox:dev/client_test/cleanup_here');
if (!clientKitEntry || !clientKitBuild || !clientKitCleanup || !clientKitCleanupHere) {
  failures.push('[CLIENT_KIT_FILES] 클라이언트 수동 테스트 키트의 진입/설치/정리 함수가 누락되었습니다.');
} else {
  const kitGraph = calledFunctionGraph('toybox:dev/client_test_kit');
  const kitGraphFiles = [...kitGraph].map((id) => functionFilesById.get(id)).filter(Boolean);
  for (const id of kitGraph) {
    if (reachable.has(id)) failures.push(`[CLIENT_KIT_TICK] 개발용 클라이언트 키트가 틱 그래프에 연결되었습니다: ${id}`);
  }
  for (const file of kitGraphFiles) {
    const text = fs.readFileSync(file, 'utf8');
    if (/\bschedule\s+function\b/.test(text)) {
      failures.push(`[CLIENT_KIT_SCHEDULE] 개발용 클라이언트 키트는 예약 함수를 만들면 안 됩니다: ${relative(file)}`);
    }
    for (const selector of text.matchAll(/@e(?:\[([^\]]*)\])?/g)) {
      const options = selector[1] ?? '';
      if (!/\btype\s*=/.test(options) || !/\bdistance\s*=/.test(options) || !/\blimit\s*=/.test(options)) {
        failures.push(`[CLIENT_KIT_SELECTOR] 키트의 엔티티 검색은 type+distance+limit로 제한해야 합니다: ${relative(file)}: ${selector[0]}`);
      }
    }
  }

  const buildText = fs.readFileSync(clientKitBuild, 'utf8');
  const shelfPlacements = buildText.match(/^setblock\s+[^\r\n]+\s+minecraft:bookshelf\s+keep$/gm) ?? [];
  if (shelfPlacements.length !== 60 || !buildText.includes('minecraft:enchanting_table keep') ||
      !buildText.includes('minecraft:brewing_stand keep')) {
    failures.push(`[CLIENT_KIT_RIG] 테스트 리그는 keep 배치의 책장 60개, 마법부여대, 양조기를 가져야 합니다: ${relative(clientKitBuild)}`);
  }
  if (/\bsummon\b/.test(buildText) || /@e(?:\[|\b)/.test(buildText)) {
    failures.push('[CLIENT_KIT_RIG] 시험장 설치는 영속 anchor 엔티티를 만들거나 검색하면 안 됩니다.');
  }

  const kitText = fs.readFileSync(clientKitEntry, 'utf8');
  const kitFunction = functionFilesById.get('toybox:dev/client_test/kit');
  const kitBody = kitFunction ? fs.readFileSync(kitFunction, 'utf8') : '';
  if (!kitText.includes('function toybox:dev/client_test/kit') ||
      !kitBody.includes('experience add @s 227 levels') ||
      !kitBody.includes('minecraft:lapis_lazuli') || !kitBody.includes('] 21') ||
      !kitBody.includes('minecraft:amethyst_shard') || !kitBody.includes('] 24') ||
      kitBody.includes('give @s minecraft:glowstone_dust') || kitBody.includes('give @s minecraft:redstone')) {
    failures.push('[CLIENT_KIT_BUDGET] 키트의 227레벨/청금석21/자수정24 정확 예산 또는 모드 가루 분리가 잘못되었습니다.');
  }

  const potency = functionFilesById.get('toybox:dev/client_test/potency_material');
  const duration = functionFilesById.get('toybox:dev/client_test/duration_material');
  const potencyText = potency ? fs.readFileSync(potency, 'utf8') : '';
  const durationText = duration ? fs.readFileSync(duration, 'utf8') : '';
  if (!potencyText.includes('give @s minecraft:glowstone_dust') || !potencyText.includes('] 4') ||
      !durationText.includes('give @s minecraft:redstone') || !durationText.includes('] 4')) {
    failures.push('[CLIENT_KIT_MODE] 강도/시간 시험용 가루 지급 함수가 각각 정확히 4개를 제공하지 않습니다.');
  }

  const cleanupText = fs.readFileSync(clientKitCleanup, 'utf8');
  const cleanupHereText = fs.readFileSync(clientKitCleanupHere, 'utf8');
  if (!cleanupText.includes('if block ~ ~-1 ~ minecraft:enchanting_table') ||
      !cleanupText.includes('positioned ~ ~-1 ~') || /@e(?:\[|\b)/.test(cleanupText)) {
    failures.push('[CLIENT_KIT_CLEANUP] 정리는 플레이어 발밑 시험 테이블에서만 실행하고 엔티티를 검색하면 안 됩니다.');
  }
  if (/\bas\s+@e\[/.test(cleanupText) || /\bkill\s+@s\b/.test(cleanupHereText)) {
    failures.push('[CLIENT_KIT_CLEANUP] 정리 중 @s 플레이어 실행 주체를 marker로 바꾸면 안 됩니다.');
  }
}

const forbiddenVanillaTag = path.join(root, 'data', 'minecraft', 'tags', 'enchantment', 'exclusive_set');
if (fs.existsSync(forbiddenVanillaTag) && fs.readdirSync(forbiddenVanillaTag).length) {
  failures.push('바닐라 exclusive_set 전체 오버라이드가 남아 있습니다.');
}
if (fs.existsSync(path.join(root, 'data', 'toybox', 'tags', 'enchantment', 'exclusive_set', 'none.json'))) {
  failures.push('불필요하고 외부 팩에 의해 확장될 수 있는 빈 exclusive_set 태그가 남아 있습니다.');
}
if (fs.existsSync(path.join(root, 'data', 'minecraft', 'enchantment', 'breach.json'))) {
  failures.push('변경 없는 바닐라 breach 전체 오버라이드가 남아 있습니다.');
}

const blast = parsed.get(path.join(root, 'data', 'toybox', 'enchantment', 'blast.json'));
const blastBlockEffect = blast?.effects?.['minecraft:hit_block']?.find((entry) => entry?.effect?.type === 'minecraft:explode')?.effect;
const blastEntityEffect = blast?.effects?.['minecraft:post_attack']?.find((entry) => entry?.effect?.type === 'minecraft:explode')?.effect;
if (blastBlockEffect?.damage_type !== 'minecraft:explosion' ||
    blastEntityEffect?.damage_type !== 'minecraft:explosion') {
  failures.push('폭렬 블록/직격 폭발에 minecraft:explosion 피해 유형이 필요합니다.');
}
if (JSON.stringify(blastBlockEffect?.offset) !== '[0,0.25,0]') {
  failures.push('폭렬 블록 적중 폭발 중심이 지면 블록 밖으로 보정되지 않았습니다.');
}
const blastPostAttack = blast?.effects?.['minecraft:post_attack']?.find((entry) => entry?.effect?.type === 'minecraft:explode');
if (blastBlockEffect?.attribute_to_user !== true ||
    blastPostAttack?.affected !== 'damaging_entity' ||
    blastEntityEffect?.attribute_to_user !== true) {
  failures.push('폭렬은 화살을 폭발 source로 사용해야 직격 대상 포함과 PvP 귀속을 함께 보존합니다.');
}

const blastProtection = parsed.get(path.join(root, 'data', 'minecraft', 'enchantment', 'blast_protection.json'));
const blastKnockback = blastProtection?.effects?.['minecraft:attributes']?.find(
  (entry) => entry?.attribute === 'minecraft:explosion_knockback_resistance',
)?.amount;
if (blastKnockback?.type !== 'minecraft:clamped' || blastKnockback?.max !== 0.8) {
  failures.push('폭발 보호 고레벨 넉백 저항이 0.8로 제한되지 않았습니다.');
}

const leap = parsed.get(path.join(root, 'data', 'toybox', 'enchantment', 'springstep.json'));
const leapTick = leap?.effects?.['minecraft:tick']?.find((entry) => entry?.effect?.type === 'minecraft:apply_impulse');
const leapTerms = leapTick?.requirements?.terms ?? [];
if (!leapTick || JSON.stringify(leap).includes('minecraft:bounciness')) {
  failures.push('기존 탄성이 점프키 홀드형 도약 효과로 교체되지 않았습니다.');
}
if (!leapTerms.some((term) => term?.predicate?.['minecraft:type_specific/player']?.input?.jump === true)) {
  failures.push('도약 효과에 26.2 플레이어 점프 입력 조건이 없습니다.');
}

const grappling = parsed.get(path.join(root, 'data', 'toybox', 'enchantment', 'grappling.json'));
const grapplingRecipe = parsed.get(path.join(root, 'data', 'toybox', 'recipe', 'grappling_hook.json'));
if (grappling?.supported_items !== '#toybox:grappling_tools' || !grappling?.effects?.['minecraft:projectile_spawned']) {
  failures.push('갈고리가 전용 낚싯대의 찌 생성 사건을 사용하지 않습니다.');
}
if (grapplingRecipe?.result?.id !== 'minecraft:fishing_rod' ||
    grapplingRecipe?.result?.components?.['minecraft:item_model'] !== 'minecraft:tripwire_hook' ||
    grapplingRecipe?.result?.components?.['minecraft:custom_data']?.toybox?.grappling_hook !== true) {
  failures.push('전용 갈고리 아이템의 기반/모델/custom_data가 올바르지 않습니다.');
}
if (fs.existsSync(path.join(root, 'data', 'toybox', 'recipe', 'grappling_book.json')) ||
    fs.existsSync(path.join(root, 'data', 'toybox', 'function', 'grappling', 'hit_block.mcfunction'))) {
  failures.push('활 기반 갈고리의 레거시 진입점이 남아 있습니다.');
}
const grapplingWaitPath = path.join(root, 'data', 'toybox', 'function', 'grappling', 'hook_wait.mcfunction');
const grapplingWait = fs.existsSync(grapplingWaitPath) ? fs.readFileSync(grapplingWaitPath, 'utf8') : '';
if (!grapplingWait.includes('predicate toybox:entity/is_on_ground') ||
    !grapplingWait.includes('scoreboard players set $contact tb_gid 1') ||
    !grapplingWait.includes('if score $contact tb_gid matches 1 run function toybox:grappling/latch') ||
    grapplingWait.includes('is_stationary')) {
  failures.push('갈고리 걸림에는 안정된 바닥 또는 인접 블록 접촉 검사가 필요합니다.');
}
const grapplingAnchorPath = path.join(root, 'data', 'toybox', 'function', 'grappling', 'tick_anchor.mcfunction');
const grapplingAnchor = fs.existsSync(grapplingAnchorPath) ? fs.readFileSync(grapplingAnchorPath, 'utf8') : '';
if (grapplingAnchor.indexOf('hook_wait') < 0 ||
    grapplingAnchor.indexOf('hook_pull') < grapplingAnchor.indexOf('hook_wait')) {
  failures.push('갈고리는 걸린 같은 틱에 첫 당김을 실행해야 합니다.');
}
const grapplingTickPath = path.join(root, 'data', 'toybox', 'function', 'grappling', 'tick_player.mcfunction');
const grapplingTick = fs.existsSync(grapplingTickPath) ? fs.readFileSync(grapplingTickPath, 'utf8') : '';
if (!grapplingTick.includes('distance=..32') ||
    grapplingTick.includes('distance=..36') ||
    /grappling_anchor[^\r\n]*limit=1/.test(grapplingTick)) {
  failures.push('갈고리는 32블록 안의 찌를 소유자 점수로 거른 뒤 처리해야 합니다.');
}

const riftHitPath = path.join(root, 'data', 'toybox', 'function', 'enchantment', 'rift_shot', 'hit_block.mcfunction');
const riftTryPath = path.join(root, 'data', 'toybox', 'function', 'enchantment', 'rift_shot', 'try_teleport.mcfunction');
const riftTeleportPath = path.join(root, 'data', 'toybox', 'function', 'enchantment', 'rift_shot', 'teleport.mcfunction');
const riftHit = fs.existsSync(riftHitPath) ? fs.readFileSync(riftHitPath, 'utf8') : '';
const riftTry = fs.existsSync(riftTryPath) ? fs.readFileSync(riftTryPath, 'utf8') : '';
const riftTeleport = fs.existsSync(riftTeleportPath) ? fs.readFileSync(riftTeleportPath, 'utf8') : '';
if (!riftHit.includes('distance=8..48') || !riftHit.includes('predicate toybox:player/is_sneaking') ||
    !riftHit.includes('scores={tb_rcd=0}')) {
  failures.push('균열 사격의 웅크리기/거리/재사용 대기 조건이 없습니다.');
}
if ((riftTry.match(/#toybox:grappling_passable/g) ?? []).length !== 12) {
  failures.push('균열 사격의 플레이어 몸 12점 도착 공간 검사가 없습니다.');
}
if (!riftTeleport.includes('damage @s 5 minecraft:ender_pearl') || riftTeleport.includes('minecraft:resistance')) {
  failures.push('균열 사격의 엔더 진주 피해 또는 저항 제거 규칙이 올바르지 않습니다.');
}

const loadPath = path.join(root, 'data', 'toybox', 'function', 'load.mcfunction');
const migratePath = path.join(root, 'data', 'toybox', 'function', 'system', 'migrate_player.mcfunction');
const loadFunction = fs.existsSync(loadPath) ? fs.readFileSync(loadPath, 'utf8') : '';
const migrateFunction = fs.existsSync(migratePath) ? fs.readFileSync(migratePath, 'utf8') : '';
const packVersion = /scoreboard players set \$pack tb_data (\d+)/.exec(loadFunction)?.[1];
const storageVersion = /data_version set value (\d+)/.exec(loadFunction)?.[1];
const playerVersion = /scoreboard players set @s tb_pver (\d+)/.exec(migrateFunction)?.[1];
if (!packVersion || packVersion !== storageVersion || packVersion !== playerVersion ||
    Number(packVersion) < 302 || !migrateFunction.includes('recipe give @s toybox:grappling_hook')) {
  failures.push('팩/저장소/플레이어 데이터 버전이 일치하지 않거나 기존 갈고리 마이그레이션이 누락되었습니다.');
}

const v050ObjectivesPath = path.join(root, 'data', 'toybox', 'function', 'system', 'init_v050_objectives.mcfunction');
const v050PlayerPath = path.join(root, 'data', 'toybox', 'function', 'system', 'init_v050_player.mcfunction');
const tickPath = path.join(root, 'data', 'toybox', 'function', 'tick.mcfunction');
const v050Objectives = fs.existsSync(v050ObjectivesPath) ? fs.readFileSync(v050ObjectivesPath, 'utf8') : '';
const v050Player = fs.existsSync(v050PlayerPath) ? fs.readFileSync(v050PlayerPath, 'utf8') : '';
const tickFunction = fs.existsSync(tickPath) ? fs.readFileSync(tickPath, 'utf8') : '';
if (Number(packVersion) < 500 ||
    !loadFunction.includes('v050_objectives_initialized:1b') ||
    !migrateFunction.includes('function toybox:system/init_v050_player') ||
    !v050Objectives.includes('scoreboard objectives add tb_measure trigger') ||
    !v050Objectives.includes('scoreboard objectives add tb_chalk trigger') ||
    !v050Objectives.includes('scoreboard objectives add tb_chshow trigger')) {
  failures.push('[BUILDING_MIGRATION] v0.5 데이터 버전·objective·플레이어 마이그레이션이 누락되었습니다.');
}
for (let slot = 1; slot <= 8; slot++) {
  if (!v050Objectives.includes(`scoreboard objectives add tb_c${slot}x dummy`) ||
      !v050Objectives.includes(`scoreboard objectives add tb_c${slot}y dummy`) ||
      !v050Objectives.includes(`scoreboard objectives add tb_c${slot}z dummy`) ||
      !v050Objectives.includes(`scoreboard objectives add tb_c${slot}d dummy`) ||
      !v050Player.includes(`scoreboard players set @s tb_c${slot}d -99`)) {
    failures.push(`[BUILDING_MIGRATION] 분필 슬롯 ${slot}의 좌표 또는 빈 슬롯 초기화가 누락되었습니다.`);
  }
}

const measureFinishPath = path.join(root, 'data', 'toybox', 'function', 'building', 'measure', 'finish.mcfunction');
const sqrtStepPath = path.join(root, 'data', 'toybox', 'function', 'building', 'measure', 'sqrt_step.mcfunction');
const geometryPath = path.join(root, 'data', 'toybox', 'function', 'building', 'measure', 'geometry.mcfunction');
const geometryReportPath = path.join(root, 'data', 'toybox', 'function', 'building', 'measure', 'geometry_report.mcfunction');
const measureFinish = fs.existsSync(measureFinishPath) ? fs.readFileSync(measureFinishPath, 'utf8') : '';
const sqrtStep = fs.existsSync(sqrtStepPath) ? fs.readFileSync(sqrtStepPath, 'utf8') : '';
const geometry = fs.existsSync(geometryPath) ? fs.readFileSync(geometryPath, 'utf8') : '';
const geometryReport = fs.existsSync(geometryReportPath) ? fs.readFileSync(geometryReportPath, 'utf8') : '';
if (!measureFinish.includes('matches 26001..') ||
    !measureFinish.includes('function toybox:building/measure/sqrt') ||
    !measureFinish.includes('function toybox:building/measure/geometry') ||
    !measureFinish.includes('function toybox:building/measure/geometry_report') ||
    !measureFinish.includes('$distance2 tb_data') ||
    !sqrtStep.includes('matches ..15') ||
    !sqrtStep.includes('$square tb_data *= $mid tb_data')) {
  failures.push('[BUILDING_MEASURE] 줄자의 오버플로 상한 또는 16단계 정수 제곱근 검사가 누락되었습니다.');
}
if ((geometry.match(/scoreboard players add \$span_[xyz] tb_data 1/g) ?? []).length !== 3 ||
    !geometry.includes('$floor_area tb_data *= $span_z tb_data') ||
    !geometry.includes('$wall_half tb_data matches 1073741824..') ||
    !geometry.includes('scoreboard players set $int_max tb_data 2147483647') ||
    !geometry.includes('$volume_limit tb_data /= $span_z tb_data') ||
    !geometry.includes('if score $area_xy tb_data <= $volume_limit tb_data') ||
    !geometryReport.includes('message.toybox.measure.geometry_full') ||
    !geometryReport.includes('message.toybox.measure.geometry_too_large')) {
  failures.push('[SURVEY_GEOMETRY] 양 끝 포함 면적·벽면·부피 계산 또는 32비트 오버플로 방어가 누락되었습니다.');
}
if (!tickFunction.includes('scores={tb_measure=1,tb_mstate=1}') ||
    !tickFunction.includes('scores={tb_measure=1,tb_mstate=0}') ||
    !tickFunction.includes('scores={tb_cshow=1..}') ||
    tickFunction.includes('@e')) {
  failures.push('[BUILDING_TICK] 줄자·분필의 플레이어 한정 틱 진입 또는 전역 엔티티 금지 규칙이 깨졌습니다.');
}

const buildingRoot = path.join(root, 'data', 'toybox', 'function', 'building');
const buildingFiles = functionFiles.filter((file) => file.startsWith(buildingRoot + path.sep));
for (const file of buildingFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (/\bsummon\b|\bschedule\s+function\b/.test(text)) {
    failures.push(`[BUILDING_ENTITY_FREE] 건축 도구에 영속 엔티티 또는 예약 함수가 있습니다: ${relative(file)}`);
  }
}
for (const dimension of ['overworld', 'nether', 'end']) {
  const macroPath = path.join(buildingRoot, 'chalk', `particle_${dimension}.mcfunction`);
  const macro = fs.existsSync(macroPath) ? fs.readFileSync(macroPath, 'utf8') : '';
  if ((macro.match(/^\$execute /gm) ?? []).length !== 3 ||
      (macro.match(/force @s/g) ?? []).length !== 3) {
    failures.push(`[BUILDING_CHALK] ${dimension} 분필 입자 매크로는 실행자에게만 3점 기둥을 표시해야 합니다.`);
  }
}
for (let slot = 1; slot <= 8; slot++) {
  const savePath = path.join(buildingRoot, 'chalk', 'save', `${slot}.mcfunction`);
  const showPath = path.join(buildingRoot, 'chalk', 'show', `${slot}.mcfunction`);
  const particlePath = path.join(buildingRoot, 'chalk', 'particle', `${slot}.mcfunction`);
  const particle = fs.existsSync(particlePath) ? fs.readFileSync(particlePath, 'utf8') : '';
  if (!fs.existsSync(savePath) || !fs.existsSync(showPath) ||
      !particle.includes('data remove storage toybox:runtime chalk_marker')) {
    failures.push(`[BUILDING_CHALK] 분필 슬롯 ${slot}의 저장·표시·임시 storage 정리가 누락되었습니다.`);
  }
}
const serverSmokePath = path.join(root, 'data', 'toybox', 'function', 'dev', 'server_smoke.mcfunction');
const serverSmoke = fs.existsSync(serverSmokePath) ? fs.readFileSync(serverSmokePath, 'utf8') : '';
if (!serverSmoke.includes('function toybox:dev/building_smoke') ||
    !serverSmoke.includes('$smoke_building_fail tb_gid')) {
  failures.push('[BUILDING_SMOKE] 줄자·분필 서버 스모크가 최종 실패 점수에 연결되지 않았습니다.');
}

const v060ObjectivesPath = path.join(root, 'data', 'toybox', 'function', 'system', 'init_v060_objectives.mcfunction');
const v060PlayerPath = path.join(root, 'data', 'toybox', 'function', 'system', 'init_v060_player.mcfunction');
const v060Objectives = fs.existsSync(v060ObjectivesPath) ? fs.readFileSync(v060ObjectivesPath, 'utf8') : '';
const v060Player = fs.existsSync(v060PlayerPath) ? fs.readFileSync(v060PlayerPath, 'utf8') : '';
if (Number(packVersion) < 600 ||
    !loadFunction.includes('v060_objectives_initialized:1b') ||
    !migrateFunction.includes('function toybox:system/init_v060_player') ||
    !v060Objectives.includes('scoreboard objectives add tb_padlock dummy') ||
    !v060Player.includes('scoreboard players set @s tb_padlock 0')) {
  failures.push('[BUILDING_PAD_MIGRATION] v0.6 점프 발판 objective·플레이어 마이그레이션이 누락되었습니다.');
}

const padCheckPath = path.join(buildingRoot, 'jump_pad', 'check.mcfunction');
const padActivatePath = path.join(buildingRoot, 'jump_pad', 'activate.mcfunction');
const padBlockedPath = path.join(buildingRoot, 'jump_pad', 'blocked.mcfunction');
const padClearancePath = path.join(root, 'data', 'toybox', 'tags', 'block', 'jump_pad_clearance.json');
const padEligiblePath = path.join(root, 'data', 'toybox', 'predicate', 'player', 'jump_pad_eligible.json');
const padCheck = fs.existsSync(padCheckPath) ? fs.readFileSync(padCheckPath, 'utf8') : '';
const padActivate = fs.existsSync(padActivatePath) ? fs.readFileSync(padActivatePath, 'utf8') : '';
const padBlocked = fs.existsSync(padBlockedPath) ? fs.readFileSync(padBlockedPath, 'utf8') : '';
const padClearance = parsed.get(padClearancePath);
const padEligible = parsed.get(padEligiblePath);
const expectedPadClearance = ['minecraft:air', 'minecraft:cave_air', 'minecraft:void_air'];
if (!padClearance || JSON.stringify([...(padClearance.values ?? [])].sort()) !== JSON.stringify(expectedPadClearance.sort()) ||
    (padCheck.match(/#toybox:jump_pad_clearance/g) ?? []).length !== 5 ||
    !padCheck.includes('function toybox:building/jump_pad/activate') ||
    !padCheck.includes('function toybox:building/jump_pad/blocked') ||
    !padActivate.includes('effect give @s minecraft:levitation 1 3 true') ||
    !padActivate.includes('effect give @s minecraft:slow_falling 3 0 true') ||
    !padActivate.includes('scoreboard players set @s tb_padlock 1') ||
    !padActivate.includes('force @s') ||
    !padBlocked.includes('message.toybox.jump_pad.blocked')) {
  failures.push('[BUILDING_PAD] 점프 발판의 5블록 여유 공간·부양·느린 낙하·래치 규칙이 누락되었습니다.');
}
const padEligibleText = JSON.stringify(padEligible ?? {});
if (!padEligibleText.includes('is_on_ground') ||
    !padEligibleText.includes('is_flying') ||
    !padEligibleText.includes('is_fall_flying') ||
    !padEligibleText.includes('is_in_water') ||
    !padEligibleText.includes('minecraft:vehicle')) {
  failures.push('[BUILDING_PAD_ELIGIBLE] 점프 발판은 지상 플레이어만 허용하고 비행·활공·수중·탑승을 거부해야 합니다.');
}
if (!tickFunction.includes('scores={tb_padlock=0}') ||
    !tickFunction.includes('predicate toybox:player/jump_pad_eligible') ||
    !tickFunction.includes('minecraft:heavy_weighted_pressure_plate') ||
    !tickFunction.includes('minecraft:yellow_glazed_terracotta') ||
    (tickFunction.match(/scoreboard players set @s tb_padlock 0/g) ?? []).length !== 2) {
  failures.push('[BUILDING_PAD_TICK] 점프 발판의 플레이어 한정 구조 감지 또는 일반 바닥 재무장 규칙이 누락되었습니다.');
}
const padSmokePath = path.join(root, 'data', 'toybox', 'function', 'dev', 'jump_pad_smoke.mcfunction');
const padSmoke = fs.existsSync(padSmokePath) ? fs.readFileSync(padSmokePath, 'utf8') : '';
if (!serverSmoke.includes('function toybox:dev/jump_pad_smoke') ||
    !serverSmoke.includes('$smoke_pad_fail tb_gid') ||
    !padSmoke.includes('minecraft:heavy_weighted_pressure_plate') ||
    !padSmoke.includes('minecraft:yellow_glazed_terracotta') ||
    !padSmoke.includes('forceload remove 40 40')) {
  failures.push('[BUILDING_PAD_SMOKE] 점프 발판 구조·정리 스모크가 최종 실패 점수에 연결되지 않았습니다.');
}

const v070ObjectivesPath = path.join(root, 'data', 'toybox', 'function', 'system', 'init_v070_objectives.mcfunction');
const v070PlayerPath = path.join(root, 'data', 'toybox', 'function', 'system', 'init_v070_player.mcfunction');
const v070Objectives = fs.existsSync(v070ObjectivesPath) ? fs.readFileSync(v070ObjectivesPath, 'utf8') : '';
const v070Player = fs.existsSync(v070PlayerPath) ? fs.readFileSync(v070PlayerPath, 'utf8') : '';
if (Number(packVersion) < 700 ||
    !loadFunction.includes('v070_objectives_initialized:1b') ||
    !loadFunction.includes('schedule function toybox:soup/maintenance 6000t replace') ||
    !migrateFunction.includes('function toybox:system/init_v070_player') ||
    !v070Objectives.includes('scoreboard objectives add tb_soup trigger') ||
    !v070Objectives.includes('scoreboard objectives add tb_stype dummy') ||
    !v070Objectives.includes('scoreboard objectives add tb_sleft dummy') ||
    !v070Objectives.includes('scoreboard players add $soup_total tb_data 0') ||
    !v070Player.includes('scoreboard players set @s tb_soup 0') ||
    !tickFunction.includes('scoreboard players enable @a tb_soup') ||
    !tickFunction.includes('scores={tb_soup=1..}') ||
    !tickFunction.includes('scores={tb_soup=..-1}')) {
  failures.push('[SOUP_MIGRATION] v0.7 수프 냄비 objective·플레이어 마이그레이션·예약 정리가 누락되었습니다.');
}

const soupRoot = path.join(root, 'data', 'toybox', 'function', 'soup');
const soupFiles = functionFiles.filter((file) => file.startsWith(soupRoot + path.sep));
const soupPath = (...segments) => path.join(soupRoot, ...segments) + '.mcfunction';
const readSoup = (...segments) => {
  const file = soupPath(...segments);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
};
const soupRay = readSoup('find_cauldron');
const soupLoadCheck = readSoup('load', 'check');
const soupFinalize = readSoup('load', 'finalize');
const soupServeCheck = readSoup('serve', 'check');
const soupDispense = readSoup('serve', 'dispense');
const soupMaintenance = readSoup('maintenance');
if ((soupRay.match(/anchored eyes positioned \^ \^ \^/g) ?? []).length !== 21 ||
    !soupRay.includes('^5.25 align xyz') ||
    !soupRay.includes('minecraft:cauldron') ||
    !soupLoadCheck.includes('minecraft:campfire[lit=true]') ||
    !soupLoadCheck.includes('matches 64..') ||
    (soupLoadCheck.match(/run clear @s minecraft:(?:mushroom_stew|rabbit_stew|beetroot_soup) 0/g) ?? []).length !== 3) {
  failures.push('[SOUP_TARGET] 수프 냄비의 5.25블록 제한 시선·구조·4그릇 사전검사·64개 상한이 누락되었습니다.');
}
if (!soupFinalize.includes('clear @s minecraft:mushroom_stew 4') ||
    !soupFinalize.includes('clear @s minecraft:rabbit_stew 4') ||
    !soupFinalize.includes('clear @s minecraft:beetroot_soup 4') ||
    !soupFinalize.includes('matches 4 run scoreboard players add $soup_total') ||
    !soupFinalize.includes('unless score $soup_removed tb_data matches 4 run kill') ||
    !soupFinalize.includes('run give @s minecraft:mushroom_stew 3') ||
    !soupFinalize.includes('run give @s minecraft:rabbit_stew 3') ||
    !soupFinalize.includes('run give @s minecraft:beetroot_soup 3')) {
  failures.push('[SOUP_TRANSACTION] 수프 4개 소비·등록·부분 실패 환불 순서가 불완전합니다.');
}
const itemReplaceIndex = soupDispense.indexOf('item replace entity @a[tag=toybox.soup_user,limit=1] weapon.mainhand');
const servingRemoveIndex = soupDispense.indexOf('scoreboard players remove @s tb_sleft 1');
if (!soupServeCheck.includes('unless items entity @s weapon.mainhand *') ||
    itemReplaceIndex < 0 || servingRemoveIndex < 0 || itemReplaceIndex > servingRemoveIndex ||
    !soupDispense.includes('store success score $soup_given tb_data') ||
    !soupDispense.includes('if score $soup_given tb_data matches 1 if score @s tb_sleft matches 0')) {
  failures.push('[SOUP_SERVE] 빈 주 손 지급 성공 후에만 회분을 줄이고 마지막 marker를 제거해야 합니다.');
}
if (!soupMaintenance.includes('schedule function toybox:soup/maintenance 6000t replace') ||
    (soupMaintenance.match(/@e\[type=minecraft:marker,tag=toybox\.soup_pot\]/g) ?? []).length !== 2 ||
    !soupMaintenance.includes('unless block ~ ~ ~ minecraft:cauldron') ||
    !soupMaintenance.includes('unless block ~ ~-1 ~ minecraft:campfire')) {
  failures.push('[SOUP_MAINTENANCE] 5분 간격·64개 상한의 파손 구조 정리가 누락되었습니다.');
}
for (const file of soupFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const isMaintenance = file === soupPath('maintenance');
  if (!isMaintenance && /\bschedule\s+function\b/.test(source)) {
    failures.push('[SOUP_EVENT] 요청 처리 함수가 예약 함수를 만들면 안 됩니다: ' + relative(file));
  }
  for (const selector of source.matchAll(/@e(?:\[([^\]]*)\])?/g)) {
    const options = selector[1] ?? '';
    if (isMaintenance) {
      if (!/\btype\s*=\s*minecraft:marker\b/.test(options) || !/\btag\s*=\s*toybox\.soup_pot\b/.test(options)) {
        failures.push('[SOUP_SELECTOR] 유지보수 검색은 수프 marker 태그로 제한해야 합니다: ' + relative(file) + ': ' + selector[0]);
      }
    } else if (!/\btype\s*=\s*minecraft:marker\b/.test(options) ||
               !/\bdistance\s*=/.test(options) ||
               !/\blimit\s*=\s*1\b/.test(options)) {
      failures.push('[SOUP_SELECTOR] 요청 시 marker 검색은 type+distance+limit=1이어야 합니다: ' + relative(file) + ': ' + selector[0]);
    }
  }
}
const soupSummons = soupFiles.reduce((count, file) =>
  count + (fs.readFileSync(file, 'utf8').match(/\bsummon\s+minecraft:marker\b/g) ?? []).length, 0);
if (soupSummons !== 1 || !readSoup('load', 'register').includes('toybox.soup_new')) {
  failures.push('[SOUP_MARKER] 수프 marker는 성공 직전 등록 경로 한 곳에서만 생성해야 합니다.');
}
const soupSmokePath = path.join(root, 'data', 'toybox', 'function', 'dev', 'soup_smoke.mcfunction');
const soupSmoke = fs.existsSync(soupSmokePath) ? fs.readFileSync(soupSmokePath, 'utf8') : '';
if (!serverSmoke.includes('function toybox:dev/soup_smoke') ||
    !serverSmoke.includes('$smoke_soup_fail tb_gid') ||
    !soupSmoke.includes('function toybox:soup/remove/empty') ||
    !soupSmoke.includes('function toybox:soup/maintenance') ||
    !soupSmoke.includes('forceload remove 8 8')) {
  failures.push('[SOUP_SMOKE] 수프 냄비 구조·점수·마지막 회분 정리 스모크가 최종 실패 점수에 연결되지 않았습니다.');
}

const v080ObjectivesPath = path.join(root, 'data', 'toybox', 'function', 'system', 'init_v080_objectives.mcfunction');
const v080PlayerPath = path.join(root, 'data', 'toybox', 'function', 'system', 'init_v080_player.mcfunction');
const v080Objectives = fs.existsSync(v080ObjectivesPath) ? fs.readFileSync(v080ObjectivesPath, 'utf8') : '';
const v080Player = fs.existsSync(v080PlayerPath) ? fs.readFileSync(v080PlayerPath, 'utf8') : '';
if (Number(packVersion) < 800 ||
    !loadFunction.includes('v080_objectives_initialized:1b') ||
    !migrateFunction.includes('function toybox:system/init_v080_player') ||
    !v080Objectives.includes('scoreboard objectives add tb_compass trigger') ||
    !v080Player.includes('scoreboard players set @s tb_compass 0') ||
    !tickFunction.includes('scoreboard players enable @a tb_compass') ||
    !tickFunction.includes('scores={tb_compass=1..}') ||
    !tickFunction.includes('scores={tb_compass=..-1}')) {
  failures.push('[SURVEY_MIGRATION] v0.8 데이터 버전·나침반 trigger·플레이어 마이그레이션이 누락되었습니다.');
}

const compassRoot = path.join(buildingRoot, 'compass');
const compassDispatchPath = path.join(compassRoot, 'dispatch.mcfunction');
const compassDispatch = fs.existsSync(compassDispatchPath) ? fs.readFileSync(compassDispatchPath, 'utf8') : '';
if (!compassDispatch.includes('message.toybox.compass.invalid_slot') ||
    !compassDispatch.includes('scoreboard players set @s tb_compass 0')) {
  failures.push('[SURVEY_COMPASS] 분필 나침반 슬롯 범위 또는 trigger 재설정이 누락되었습니다.');
}
for (let slot = 1; slot <= 8; slot++) {
  const slotPath = path.join(compassRoot, 'slot', slot + '.mcfunction');
  const preparePath = path.join(compassRoot, 'prepare', slot + '.mcfunction');
  const slotText = fs.existsSync(slotPath) ? fs.readFileSync(slotPath, 'utf8') : '';
  const prepareText = fs.existsSync(preparePath) ? fs.readFileSync(preparePath, 'utf8') : '';
  if (!slotText.includes('SelectedItem.count 1') ||
      !slotText.includes('unless score $compass_count tb_data matches 1') ||
      !slotText.includes('if data entity @s SelectedItem.components') ||
      !slotText.includes('message.toybox.compass.modified') ||
      !slotText.includes('unless items entity @s inventory.* minecraft:amethyst_shard') ||
      !prepareText.includes('data remove storage toybox:scratch compass') ||
      !prepareText.includes('with storage toybox:scratch compass') ||
      !prepareText.includes('if score $compass_applied tb_data matches 1 run clear @s minecraft:amethyst_shard 1') ||
      prepareText.indexOf('with storage toybox:scratch compass') >
        prepareText.indexOf('clear @s minecraft:amethyst_shard 1')) {
    failures.push('[SURVEY_COMPASS] 슬롯 ' + slot + '의 단일 나침반·비용 선검사·동기 scratch 정리가 누락되었습니다.');
  }
}
for (const [dimension, target] of [
  ['overworld', 'minecraft:overworld'],
  ['nether', 'minecraft:the_nether'],
  ['end', 'minecraft:the_end'],
]) {
  const applyPath = path.join(compassRoot, 'apply', dimension + '.mcfunction');
  const applyText = fs.existsSync(applyPath) ? fs.readFileSync(applyPath, 'utf8') : '';
  if (!applyText.startsWith('$execute store success score $compass_applied tb_data run item replace entity @s weapon.mainhand') ||
      !applyText.includes('minecraft:lodestone_tracker={target:{dimension:"' + target + '"') ||
      !applyText.includes('tracked:false') ||
      !applyText.includes('minecraft:max_stack_size=1') ||
      !applyText.includes('toybox:{chalk_compass:{version:1') ||
      !applyText.includes('item.toybox.chalk_compass.target')) {
    failures.push('[SURVEY_COMPASS] ' + dimension + ' 나침반의 고정 목표·비추적·비중첩·식별 컴포넌트가 누락되었습니다.');
  }
}

const surveySmokePath = path.join(root, 'data', 'toybox', 'function', 'dev', 'survey_smoke.mcfunction');
const surveySmoke = fs.existsSync(surveySmokePath) ? fs.readFileSync(surveySmokePath, 'utf8') : '';
if (!serverSmoke.includes('function toybox:dev/survey_smoke') ||
    !serverSmoke.includes('$smoke_survey_fail tb_gid') ||
    !surveySmoke.includes('$smoke_survey_geometry tb_gid') ||
    !surveySmoke.includes('$smoke_survey_compass_forms tb_gid') ||
    !surveySmoke.includes('Items[{Slot:0b}].components."minecraft:lodestone_tracker"') ||
    !surveySmoke.includes('Items[{Slot:0b}].components."minecraft:custom_data"') ||
    !surveySmoke.includes('kill @e[type=minecraft:armor_stand,tag=toybox.debug_survey]')) {
  failures.push('[SURVEY_SMOKE] 측량 산술·3차원 나침반 컴포넌트·임시 엔티티 정리 스모크가 누락되었습니다.');
}


const v090ObjectivesPath = path.join(root, 'data', 'toybox', 'function', 'system', 'init_v090_objectives.mcfunction');
const v090PlayerPath = path.join(root, 'data', 'toybox', 'function', 'system', 'init_v090_player.mcfunction');
const v090Objectives = fs.existsSync(v090ObjectivesPath) ? fs.readFileSync(v090ObjectivesPath, 'utf8') : '';
const v090Player = fs.existsSync(v090PlayerPath) ? fs.readFileSync(v090PlayerPath, 'utf8') : '';
const sickleRecipePath = path.join(root, 'data', 'toybox', 'recipe', 'harvest_sickle.json');
const sickleAdvancementPath = path.join(root, 'data', 'toybox', 'advancement', 'interaction', 'sickle_use.json');
const sickleModifierPath = path.join(root, 'data', 'toybox', 'item_modifier', 'farming', 'sickle_damage.json');
const sickleRecipe = parsed.get(sickleRecipePath);
const sickleAdvancement = parsed.get(sickleAdvancementPath);
const sickleModifier = parsed.get(sickleModifierPath);
if (packVersion !== '900' ||
    !loadFunction.includes('v090_objectives_initialized:1b') ||
    !migrateFunction.includes('function toybox:system/init_v090_player') ||
    !migrateFunction.includes('recipe give @s toybox:harvest_sickle') ||
    !v090Objectives.includes('scoreboard objectives add tb_scd dummy') ||
    !v090Player.includes('advancement revoke @s only toybox:interaction/sickle_use')) {
  failures.push('[SICKLE_MIGRATION] v0.9 데이터 버전·쿨다운 objective·플레이어 마이그레이션이 누락되었습니다.');
}
if (sickleRecipe?.result?.id !== 'minecraft:iron_hoe' ||
    sickleRecipe?.result?.components?.['minecraft:custom_data']?.toybox?.harvest_sickle !== true ||
    sickleRecipe?.result?.components?.['minecraft:blocks_attacks']?.block_delay_seconds !== 3600 ||
    sickleRecipe?.result?.components?.['minecraft:lore']?.length !== 3) {
  failures.push('[SICKLE_ITEM] 수확 낫의 철 괭이 기반·식별 데이터·비소모 사용 동작·설명문이 올바르지 않습니다.');
}
const sickleCriterion = sickleAdvancement?.criteria?.use;
if (sickleCriterion?.trigger !== 'minecraft:using_item' ||
    sickleCriterion?.conditions?.item?.items !== 'minecraft:iron_hoe' ||
    sickleCriterion?.conditions?.item?.predicates?.['minecraft:custom_data'] !== '{toybox:{harvest_sickle:1b}}' ||
    sickleAdvancement?.rewards?.function !== 'toybox:farming/sickle/interact') {
  failures.push('[SICKLE_EVENT] 수확 낫은 식별된 아이템의 using_item 사건으로만 진입해야 합니다.');
}
if (sickleModifier?.function !== 'minecraft:set_damage' || sickleModifier?.damage !== -0.0041 || sickleModifier?.add !== true) {
  failures.push('[SICKLE_DURABILITY] 수확 성공당 철 괭이 잔여 내구도를 1/250만큼 줄이는 수정자가 필요합니다.');
}
const sickleRoot = path.join(root, 'data', 'toybox', 'function', 'farming', 'sickle');
const readSickle = (name) => {
  const file = path.join(sickleRoot, name + '.mcfunction');
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
};
const sickleRaycast = readSickle('raycast');
const sickleGrid = readSickle('harvest_grid');
const sickleOne = readSickle('harvest_one');
const sickleFinish = readSickle('finish');
if (!sickleRaycast.includes('matches ..24') ||
    !sickleRaycast.includes('positioned ^ ^ ^0.2') ||
    !sickleRaycast.includes('#toybox:sickle_raycast_passable') ||
    (sickleRaycast.match(/\[age=(?:7|3)\]/g) ?? []).length !== 5 ||
    (sickleGrid.match(/function toybox:farming\/sickle\/harvest_one/g) ?? []).length !== 9) {
  failures.push('[SICKLE_RAYCAST] 수확 낫은 최대 5블록·공기 관통만 허용하는 고정 25단계 레이와 정확한 3×3 호출을 사용해야 합니다.');
}
const sickleLootIndex = sickleOne.indexOf('run loot spawn');
const sickleAirIndex = sickleOne.indexOf('run setblock ~ ~ ~ minecraft:air');
if ((sickleOne.match(/minecraft:(?:wheat|carrots|potatoes|beetroots|nether_wart)\[age=(?:7|3)\]/g) ?? []).length !== 5 ||
    !sickleOne.includes('mine ~ ~ ~ mainhand') ||
    !sickleOne.includes('mine ~ ~ ~ offhand') ||
    sickleLootIndex < 0 || sickleAirIndex < 0 || sickleLootIndex > sickleAirIndex ||
    !sickleFinish.includes('minecraft:damage=249') ||
    !sickleFinish.includes('toybox:farming/sickle_damage')) {
  failures.push('[SICKLE_HARVEST] 완숙 5종만 바닐라 도구 전리품 생성 후 제거하고 내구도·파손을 처리해야 합니다.');
}
if (!tickFunction.includes('@a[tag=toybox.sickle_active,scores={tb_scd=1..}]') ||
    !tickFunction.includes('@a[tag=toybox.sickle_active,scores={tb_scd=..0}]') ||
    tickFunction.includes('@e')) {
  failures.push('[SICKLE_TICK] 수확 낫 재무장은 활성 플레이어 태그에만 제한되어야 합니다.');
}
const sickleSmokePath = path.join(root, 'data', 'toybox', 'function', 'dev', 'sickle_smoke.mcfunction');
const sickleSmoke = fs.existsSync(sickleSmokePath) ? fs.readFileSync(sickleSmokePath, 'utf8') : '';
if (!serverSmoke.includes('function toybox:dev/sickle_smoke') ||
    !serverSmoke.includes('$smoke_sickle_fail tb_gid') ||
    !sickleSmoke.includes('$smoke_sickle_raycast tb_gid') ||
    !sickleSmoke.includes('$smoke_sickle_grid tb_gid') ||
    !sickleSmoke.includes('$smoke_sickle_damage tb_gid') ||
    !sickleSmoke.includes('$smoke_sickle_break tb_gid') ||
    !sickleSmoke.includes('forceload remove 0 0')) {
  failures.push('[SICKLE_SMOKE] 수확 낫 레이·3×3·내구도·파손·정리 스모크가 최종 실패 점수에 연결되지 않았습니다.');
}

const enPath = path.join(resourceRoot, 'assets', 'toybox', 'lang', 'en_us.json');
const koPath = path.join(resourceRoot, 'assets', 'toybox', 'lang', 'ko_kr.json');
const en = parsed.get(enPath);
const ko = parsed.get(koPath);
if (en && ko) {
  const enKeys = Object.keys(en).sort();
  const koKeys = Object.keys(ko).sort();
  if (JSON.stringify(enKeys) !== JSON.stringify(koKeys)) failures.push('en_us/ko_kr 번역 키 집합이 다릅니다.');
  for (const [file, value] of parsed) {
    const stack = [value];
    while (stack.length) {
      const item = stack.pop();
      if (Array.isArray(item)) stack.push(...item);
      else if (item && typeof item === 'object') {
        if (typeof item.translate === 'string' && (item.translate.includes('.toybox.') || item.translate.startsWith('pack.toybox.'))) {
          if (!(item.translate in en) || !(item.translate in ko)) failures.push(`번역 키 누락: ${item.translate} (${relative(file)})`);
          if (typeof item.fallback === 'string' && en[item.translate] !== item.fallback) failures.push(`영어 fallback 불일치: ${item.translate} (${relative(file)})`);
        }
        stack.push(...Object.values(item));
      }
    }
  }
  const missingFunctionTranslations = new Map();
  for (const file of functionFiles) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/["']?translate["']?\s*:\s*["']([^"']+)["']/g)) {
      const key = match[1];
      if ((key.includes('.toybox.') || key.startsWith('pack.toybox.')) && (!(key in en) || !(key in ko))) {
        if (!missingFunctionTranslations.has(key)) missingFunctionTranslations.set(key, []);
        missingFunctionTranslations.get(key).push(relative(file));
      }
    }
  }
  for (const [key, sources] of missingFunctionTranslations) {
    const more = sources.length > 1 ? ` 외 ${sources.length - 1}개` : '';
    failures.push(`[MCFUNCTION_TRANSLATION] 번역 키 누락: ${key} (${sources[0]}${more})`);
  }
} else if (functionFiles.some((file) =>
  /["']?translate["']?\s*:\s*["'][^"']*(?:\.toybox\.|pack\.toybox\.)/.test(fs.readFileSync(file, 'utf8')))) {
  failures.push('[MCFUNCTION_TRANSLATION] mcfunction 번역 키를 검사할 en_us.json/ko_kr.json이 없습니다.');
}

if (failures.length) {
  console.error([...new Set(failures)].join('\n'));
  process.exit(1);
}
const packJsonCount = packFiles.filter((p) => p.endsWith('.json') || p.endsWith('.mcmeta')).length;
console.log(`검증 통과: 데이터팩 JSON/메타데이터 ${packJsonCount}개, 함수/레시피/조건/태그 참조, 틱 호출 그래프 ${reachable.size}개, BOM/번역 키`);
