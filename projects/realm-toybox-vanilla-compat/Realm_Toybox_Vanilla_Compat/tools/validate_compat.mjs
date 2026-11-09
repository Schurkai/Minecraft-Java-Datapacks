import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Realm_Toybox.vanilla_compat.validate';

const toolsRoot = path.dirname(fileURLToPath(import.meta.url));
const packRoot = path.resolve(toolsRoot, '..');
const projectRoot = path.resolve(packRoot, '..');
const resourceRoot = path.join(projectRoot, 'Realm_Toybox_Vanilla_Compat_Resources');
const vanillaReportsRoot = process.env.MINECRAFT_26_2_REPORTS
  ? path.resolve(process.env.MINECRAFT_26_2_REPORTS)
  : path.join(projectRoot, '.vanilla_reports');
const vanillaEnchantRoot = path.join(vanillaReportsRoot, 'generated', 'data', 'minecraft', 'enchantment');

function walk(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function rel(root, file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON: ${rel(projectRoot, file)}\n${error.message}`);
  }
}

function assertFile(file, label) {
  assert.ok(fs.existsSync(file) && fs.statSync(file).isFile(), `${label} is missing: ${rel(projectRoot, file)}`);
}

assertFile(path.join(packRoot, 'pack.mcmeta'), 'Data-pack metadata');
assertFile(path.join(resourceRoot, 'pack.mcmeta'), 'Resource-pack metadata');
assert.ok(fs.existsSync(vanillaEnchantRoot), 'Official 26.2 generated vanilla enchantment report is missing.');

const jsonFiles = [
  ...walk(packRoot).filter((file) => file.endsWith('.json') || file.endsWith('.mcmeta')),
  ...walk(resourceRoot).filter((file) => file.endsWith('.json') || file.endsWith('.mcmeta')),
];
for (const file of jsonFiles) readJson(file);

const packMeta = readJson(path.join(packRoot, 'pack.mcmeta'));
assert.deepEqual(packMeta.pack.min_format, [107, 1], 'Data-pack min_format must be 107.1.');
assert.deepEqual(packMeta.pack.max_format, [107, 1], 'Data-pack max_format must be 107.1.');
assert.equal(packMeta.features, undefined, 'Experimental feature flags are not permitted.');

const resourceMeta = readJson(path.join(resourceRoot, 'pack.mcmeta'));
assert.deepEqual(resourceMeta.pack.min_format, [88, 0], 'Resource-pack min_format must be 88.0.');
assert.deepEqual(resourceMeta.pack.max_format, [88, 0], 'Resource-pack max_format must be 88.0.');
const loadFunction = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'load.mcfunction'), 'utf8');
assert.ok(loadFunction.includes('scoreboard players set $pack tb_data 904'), 'Compatibility data version must be 904.');

const overrideRoot = path.join(packRoot, 'data', 'minecraft', 'enchantment');
const relaxed = new Set([
  'bane_of_arthropods',
  'blast_protection',
  'breach',
  'density',
  'fire_protection',
  'infinity',
  'multishot',
  'piercing',
  'projectile_protection',
  'protection',
  'sharpness',
  'smite',
]);
const maceDamageGroup = new Set(['bane_of_arthropods', 'breach', 'density', 'sharpness', 'smite']);
const overrides = fs.readdirSync(overrideRoot)
  .filter((name) => name.endsWith('.json'))
  .map((name) => name.slice(0, -5))
  .sort();
assert.deepEqual(overrides, [...relaxed].sort(), 'Only the twelve requested vanilla enchantments may be overridden.');

const officialFiles = fs.readdirSync(vanillaEnchantRoot).filter((name) => name.endsWith('.json'));
for (const filename of officialFiles) {
  const name = filename.slice(0, -5);
  const official = readJson(path.join(vanillaEnchantRoot, filename));
  if (!relaxed.has(name)) continue;

  const expected = structuredClone(official);
  if (maceDamageGroup.has(name)) expected.exclusive_set = '#toybox:exclusive_set/trident_damage';
  else delete expected.exclusive_set;
  if (name === 'sharpness') expected.supported_items = '#toybox:enchantable/sharpness_plus_mace';

  const actual = readJson(path.join(overrideRoot, filename));
  assert.equal(actual.max_level, official.max_level, `${name} must keep its official vanilla max_level.`);
  assert.deepEqual(actual, expected, `${name} differs from the official 26.2 definition outside the approved compatibility edits.`);
}

for (const protectedName of ['fortune', 'silk_touch', 'riptide', 'loyalty', 'channeling', 'impaling']) {
  assert.ok(!fs.existsSync(path.join(overrideRoot, `${protectedName}.json`)), `${protectedName} must remain fully vanilla.`);
}

const minecraftExclusiveTags = path.join(packRoot, 'data', 'minecraft', 'tags', 'enchantment', 'exclusive_set');
assert.ok(!fs.existsSync(minecraftExclusiveTags), 'Do not replace vanilla exclusive_set tags.');

const customExclusiveRoot = path.join(packRoot, 'data', 'toybox', 'tags', 'enchantment', 'exclusive_set');
for (const file of walk(customExclusiveRoot).filter((candidate) => candidate.endsWith('.json'))) {
  const tag = readJson(file);
  assert.ok(Array.isArray(tag.values) && tag.values.length > 0, `Empty exclusive_set tag is forbidden: ${rel(packRoot, file)}`);
}
const bridge = readJson(path.join(customExclusiveRoot, 'trident_damage.json'));
assert.deepEqual(bridge.values, ['minecraft:impaling'], 'The five mace damage enchantments must remain incompatible with Impaling.');
assert.ok(!fs.existsSync(path.join(customExclusiveRoot, 'mace_trident_damage.json')), 'The superseded mace_trident_damage tag must not remain.');

const sharpnessItems = readJson(path.join(packRoot, 'data', 'toybox', 'tags', 'item', 'enchantable', 'sharpness_plus_mace.json'));
assert.deepEqual(
  sharpnessItems.values,
  ['#minecraft:enchantable/sharp_weapon', 'minecraft:mace'],
  'Sharpness item support must add only the mace to the official sharp-weapon tag.',
);

for (const material of ['leather', 'copper', 'chainmail', 'golden', 'iron', 'diamond', 'netherite']) {
  const item = `minecraft:${material}_chestplate`;
  const recipe = readJson(path.join(packRoot, 'data', 'toybox', 'recipe', `winged_${material}_chestplate.json`));
  assert.equal(recipe.type, 'minecraft:crafting_transmute', `Wingbound ${material} recipe must use crafting_transmute.`);
  assert.equal(recipe.input, item, `Wingbound ${material} recipe has the wrong chestplate input.`);
  assert.equal(recipe.material, 'minecraft:elytra', `Wingbound ${material} recipe must consume an elytra.`);
  assert.equal(recipe.result?.id, item, `Wingbound ${material} recipe must return the same chestplate tier.`);
  assert.deepEqual(recipe.result?.components?.['minecraft:glider'], {}, `Wingbound ${material} result must contain the glider component.`);
}

const resetRepairCost = readJson(path.join(packRoot, 'data', 'toybox', 'item_modifier', 'reset_repair_cost.json'));
assert.deepEqual(
  resetRepairCost,
  { function: 'minecraft:set_components', components: { '!minecraft:repair_cost': {} } },
  'Anvil cleanup must remove only repair_cost and preserve every other item component.',
);
const loreInsert = readJson(path.join(packRoot, 'data', 'toybox', 'item_modifier', 'anvil_lore_insert.json'));
assert.equal(loreInsert[0]?.function, 'minecraft:set_lore', 'Anvil lore insertion must use set_lore.');
assert.equal(loreInsert[0]?.mode, 'insert', 'The first cost line must be inserted without replacing existing lore.');
assert.equal(loreInsert[0]?.offset, 0, 'The managed cost line must stay at lore index zero.');
assert.equal(loreInsert[0]?.entity, 'this', 'Dynamic cost text must resolve against the modified entity.');
assert.equal(loreInsert[0]?.lore?.[0]?.translate, 'message.toybox.anvil.cost_lore', 'The cost line must be localized.');
assert.equal(loreInsert[0]?.lore?.[0]?.with?.[0]?.storage, 'toybox:runtime', 'The cost line must read the exact stored repair_cost.');
assert.equal(loreInsert[1]?.function, 'minecraft:set_custom_data', 'New cost lore must receive a managed marker.');
assert.equal(loreInsert[1]?.tag?.toybox?.anvil_lore, true, 'The lore marker must be namespaced under toybox.');
const loreReplace = readJson(path.join(packRoot, 'data', 'toybox', 'item_modifier', 'anvil_lore_replace.json'));
assert.equal(loreReplace.mode, 'replace_section', 'Managed cost lore must be updated in place.');
assert.equal(loreReplace.offset, 0, 'Only the managed first lore line may be replaced.');
assert.equal(loreReplace.size, 1, 'Existing user lore after the managed line must be preserved.');
assert.equal(loreReplace.entity, 'this', 'Refreshed dynamic cost text must resolve against the modified entity.');
const anvilOpen = readJson(path.join(packRoot, 'data', 'toybox', 'advancement', 'interaction', 'anvil_open.json'));
assert.equal(anvilOpen.criteria?.open?.trigger, 'minecraft:default_block_use', 'Anvil guidance must be triggered by block use.');
assert.equal(
  anvilOpen.criteria?.open?.conditions?.location?.[0]?.predicate?.block?.blocks,
  '#minecraft:anvil',
  'Anvil-open guidance must cover the vanilla anvil block tag.',
);
const repairInventory = readJson(path.join(packRoot, 'data', 'toybox', 'advancement', 'interaction', 'repair_cost_inventory.json'));
assert.equal(repairInventory.criteria?.changed?.trigger, 'minecraft:inventory_changed', 'Repair-cost lore and ritual scans must remain event-driven.');
assert.ok(!fs.existsSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'reset_inventory.mcfunction')), 'Automatic inventory cleanup must not remain.');
const inventoryRefresh = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'refresh_inventory.mcfunction'), 'utf8');
for (let slot = 0; slot < 27; slot++) {
  assert.ok(inventoryRefresh.includes(`inventory.${slot} *[minecraft:repair_cost]`), `Anvil lore refresh is missing inventory slot ${slot}.`);
}
for (let slot = 0; slot < 9; slot++) {
  assert.ok(inventoryRefresh.includes(`hotbar.${slot} *[minecraft:repair_cost]`), `Anvil lore refresh is missing hotbar slot ${slot}.`);
}
for (const slot of ['weapon.offhand', 'armor.feet', 'armor.legs', 'armor.chest', 'armor.head']) {
  assert.ok(inventoryRefresh.includes(`${slot} *[minecraft:repair_cost]`), `Anvil lore refresh is missing ${slot}.`);
}
assert.ok(inventoryRefresh.includes('toybox:anvil_lore_insert'), 'Lore refresh must safely insert the first managed line.');
assert.ok(inventoryRefresh.includes('toybox:anvil_lore_replace'), 'Lore refresh must update an existing managed line.');
const inventoryEvent = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'inventory_changed.mcfunction'), 'utf8');
assert.ok(
  inventoryEvent.includes('execute if data entity @s Inventory[].components."minecraft:repair_cost"'),
  'Inventory events must refresh slots only when a stored repair_cost exists.',
);
assert.ok(
  inventoryEvent.indexOf('function toybox:anvil_reset/refresh_inventory') < inventoryEvent.indexOf('advancement revoke'),
  'Inventory advancement must remain granted during lore updates to prevent recursive re-awards.',
);
assert.ok(inventoryEvent.includes('schedule function toybox:anvil_reset/check_pending 1t replace'), 'Item-drop detection must be a one-tick event follow-up.');
const checkPending = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'check_pending.mcfunction'), 'utf8');
assert.ok(
  checkPending.indexOf('remove toybox.anvil_scan_pending') < checkPending.indexOf('function toybox:anvil_reset/scan_player'),
  'Pending tags must be moved aside before scanning so a new inventory event is not erased.',
);
const scanPlayer = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'scan_player.mcfunction'), 'utf8');
assert.ok(scanPlayer.includes('distance=..4'), 'Ritual item scans must stay player-local.');
assert.ok(scanPlayer.includes('#minecraft:anvil'), 'The Nether Star catalyst must rest on an anvil.');
assert.ok(scanPlayer.includes('contents minecraft:nether_star'), 'The ritual must require a Nether Star.');
const scanStar = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'scan_star.mcfunction'), 'utf8');
assert.ok(scanStar.includes('*[minecraft:repair_cost]'), 'Only items with an explicit prior-work penalty may be reset.');
assert.ok(scanStar.includes('limit=1'), 'One catalyst scan may reset only one item.');
const resetEntity = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'reset_entity.mcfunction'), 'utf8');
assert.ok(resetEntity.includes('toybox:reset_repair_cost'), 'The ritual must use the component-preserving reset modifier.');
assert.ok(resetEntity.includes('function toybox:anvil_reset/finish'), 'Catalyst consumption must happen only after a successful reset.');
const consumeStar = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'consume_star.mcfunction'), 'utf8');
assert.ok(consumeStar.includes('scoreboard players remove $anvil_star_count tb_data 1'), 'Exactly one Nether Star must be consumed.');
const manualAttempt = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'attempt.mcfunction'), 'utf8');
assert.ok(!manualAttempt.includes('reset_repair_cost'), 'The public trigger must not bypass the Nether Star cost.');

const forbiddenPaths = [
  path.join(packRoot, 'data', 'toybox', 'function', 'advanced_enchant'),
  path.join(packRoot, 'data', 'toybox', 'item_modifier', 'advanced_enchant'),
  path.join(packRoot, 'data', 'toybox', 'advancement', 'interaction', 'enchanting_table.json'),
];
for (const candidate of forbiddenPaths) assert.ok(!fs.existsSync(candidate), `Vanilla-cap flavor must not contain ${rel(packRoot, candidate)}.`);

const dataFiles = walk(path.join(packRoot, 'data'));
for (const file of dataFiles) {
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(!/advanced_enchant|client_test/i.test(text), `Removed high-level enchant path is still referenced by ${rel(packRoot, file)}.`);
}

const functionRoot = path.join(packRoot, 'data', 'toybox', 'function');
const functions = new Set(
  walk(functionRoot)
    .filter((file) => file.endsWith('.mcfunction'))
    .map((file) => rel(functionRoot, file).slice(0, -'.mcfunction'.length)),
);
const referencedFunctions = new Set();
for (const file of dataFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\bfunction\s+toybox:([a-z0-9_./-]+)/g)) referencedFunctions.add(match[1]);
  for (const match of text.matchAll(/"function"\s*:\s*"toybox:([a-z0-9_./-]+)"/g)) referencedFunctions.add(match[1]);
}
for (const id of referencedFunctions) assert.ok(functions.has(id), `Missing function referenced as toybox:${id}.`);

for (const tagName of ['load', 'tick']) {
  const tagFile = path.join(packRoot, 'data', 'minecraft', 'tags', 'function', `${tagName}.json`);
  const tag = readJson(tagFile);
  for (const id of tag.values) {
    if (typeof id === 'string' && id.startsWith('toybox:')) {
      assert.ok(functions.has(id.slice('toybox:'.length)), `Missing ${tagName} function ${id}.`);
    }
  }
}

const tickTag = readJson(path.join(packRoot, 'data', 'minecraft', 'tags', 'function', 'tick.json'));
const tickQueue = tickTag.values.filter((id) => typeof id === 'string' && id.startsWith('toybox:')).map((id) => id.slice(7));
const tickReachable = new Set();
while (tickQueue.length) {
  const id = tickQueue.pop();
  if (tickReachable.has(id) || !functions.has(id)) continue;
  tickReachable.add(id);
  const file = path.join(functionRoot, `${id}.mcfunction`);
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\bfunction\s+toybox:([a-z0-9_./-]+)/g)) tickQueue.push(match[1]);
}
assert.ok(!tickReachable.has('dev/vanilla_compat_smoke'), 'Compatibility smoke test must never run from the tick graph.');
for (const ritualFunction of ['anvil_reset/check_pending', 'anvil_reset/scan_player', 'anvil_reset/scan_star']) {
  assert.ok(!tickReachable.has(ritualFunction), `Event-bounded ritual function must not be tick-reachable: ${ritualFunction}.`);
}

const en = readJson(path.join(resourceRoot, 'assets', 'toybox', 'lang', 'en_us.json'));
const ko = readJson(path.join(resourceRoot, 'assets', 'toybox', 'lang', 'ko_kr.json'));
assert.deepEqual(Object.keys(en).sort(), Object.keys(ko).sort(), 'English and Korean translation key sets must match.');
for (const file of dataFiles.filter((candidate) => candidate.endsWith('.json') || candidate.endsWith('.mcfunction'))) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/"translate"\s*:\s*"((?:message|item|enchantment|pack)\.toybox\.[^"]+)"/g)) {
    assert.ok(Object.hasOwn(en, match[1]), `Missing English translation ${match[1]} referenced by ${rel(packRoot, file)}.`);
    assert.ok(Object.hasOwn(ko, match[1]), `Missing Korean translation ${match[1]} referenced by ${rel(packRoot, file)}.`);
  }
}

assert.equal(en['message.toybox.help.levels'].includes('Vanilla caps'), true, 'English help must identify vanilla caps.');
assert.equal(ko['message.toybox.help.levels'].includes('바닐라 상한'), true, 'Korean help must identify vanilla caps.');

console.log(`Validated ${jsonFiles.length} JSON/metadata files.`);
console.log(`Compared ${relaxed.size} approved overrides against ${officialFiles.length} official 26.2 enchantments.`);
console.log(`Resolved ${referencedFunctions.size} local function references; tick graph reaches ${tickReachable.size} functions.`);
console.log('Vanilla Compat static validation passed.');
