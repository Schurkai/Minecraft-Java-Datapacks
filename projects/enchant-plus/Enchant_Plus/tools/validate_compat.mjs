import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Enchant_Plus.validate';

const toolsRoot = path.dirname(fileURLToPath(import.meta.url));
const packRoot = path.resolve(toolsRoot, '..');
const projectRoot = path.resolve(packRoot, '..');
const resourceRoot = path.join(projectRoot, 'Enchant_Plus_Resources');
const harnessRoot = path.join(toolsRoot, 'test_harness');
const vanillaReportsRoot = process.env.MINECRAFT_26_2_REPORTS
  ? path.resolve(process.env.MINECRAFT_26_2_REPORTS)
  : path.join(projectRoot, '.vanilla_reports');
const vanillaEnchantRoot = path.join(vanillaReportsRoot, 'generated', 'data', 'minecraft', 'enchantment');
const vanillaExclusiveRoot = path.join(vanillaReportsRoot, 'generated', 'data', 'minecraft', 'tags', 'enchantment', 'exclusive_set');
const vanillaEnchantableRoot = path.join(vanillaReportsRoot, 'generated', 'data', 'minecraft', 'tags', 'item', 'enchantable');

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
assertFile(path.join(harnessRoot, 'pack.mcmeta'), 'Test-harness metadata');
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
assert.equal(packMeta.pack.description.translate, 'pack.enchant_plus.description', 'Pack title must use Enchant Plus branding.');
assert.equal(packMeta.pack.description.fallback, '인챈트플러스 v1.1.4 — Minecraft Java 26.2', 'Default pack title must be Korean.');

const resourceMeta = readJson(path.join(resourceRoot, 'pack.mcmeta'));
assert.deepEqual(resourceMeta.pack.min_format, [88, 0], 'Resource-pack min_format must be 88.0.');
assert.deepEqual(resourceMeta.pack.max_format, [88, 0], 'Resource-pack max_format must be 88.0.');
const harnessMeta = readJson(path.join(harnessRoot, 'pack.mcmeta'));
assert.deepEqual(harnessMeta.pack.min_format, [107, 1], 'Test-harness min_format must be 107.1.');
assert.deepEqual(harnessMeta.pack.max_format, [107, 1], 'Test-harness max_format must be 107.1.');
assert.equal(harnessMeta.features, undefined, 'Test harness must not enable experimental feature flags.');
const loadFunction = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'load.mcfunction'), 'utf8');
assert.ok(loadFunction.includes('scoreboard players set $pack ep_data 1104'), 'Compatibility data version must be 1104.');
assert.ok(loadFunction.includes('ep_objectives_1104:1b'), 'Existing v1.1.3 worlds must initialize the new separation objectives once.');
const initObjectives = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'system', 'init_objectives.mcfunction'), 'utf8');
for (const objective of ['ep_help trigger', 'ep_anvil trigger', 'ep_pver dummy', 'ep_data dummy', 'ep_scan dummy']) {
  assert.ok(initObjectives.includes(`scoreboard objectives add ${objective}`), `Missing Enchant Plus objective ${objective}.`);
}
assert.ok(
  initObjectives.includes('scoreboard objectives add ep_star_drop minecraft.dropped:minecraft.nether_star'),
  'Nether Star drops must use the player statistic criterion.',
);
assert.ok(
  initObjectives.includes('scoreboard objectives add ep_item_drop minecraft.custom:minecraft.drop'),
  'Q-drop detection must use the official generic drop statistic.',
);
assert.ok(initObjectives.includes('scoreboard objectives add ep_wing_scan dummy'), 'Wingbound separation requires a bounded scan score.');
const initObjectives1104 = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'system', 'init_objectives_1104.mcfunction'), 'utf8');
assert.ok(initObjectives1104.includes('scoreboard objectives add ep_item_drop minecraft.custom:minecraft.drop'), 'Upgrade initializer must add ep_item_drop.');
assert.ok(initObjectives1104.includes('scoreboard objectives add ep_wing_scan dummy'), 'Upgrade initializer must add ep_wing_scan.');
assert.ok(initObjectives1104.includes('ep_objectives_1104 set value 1b'), 'Upgrade initializer must be one-shot.');
const migrateObjectives = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'system', 'migrate_objectives.mcfunction'), 'utf8');
assert.ok(migrateObjectives.includes('ep_pver = @s tb_pver'), 'Legacy player data version must migrate to ep_pver.');
for (const objective of ['tb_help', 'tb_anvil', 'tb_pver', 'tb_data']) {
  assert.ok(migrateObjectives.includes(`scoreboard objectives remove ${objective}`), `Legacy objective ${objective} must be retired.`);
}

// Unknown-pack resources in a data-driven registry receive an experimental
// lifecycle in 26.2. Realm-safe compatibility must therefore use tags only:
// no vanilla override and no custom enchantment registry entry may exist.
const dataRoot = path.join(packRoot, 'data');
const registryEnchantFiles = walk(dataRoot).filter((file) => {
  const parts = rel(dataRoot, file).split('/');
  return parts.length >= 3 && parts[1] === 'enchantment';
});
assert.deepEqual(
  registryEnchantFiles.map((file) => rel(packRoot, file)),
  [],
  'Realm-safe flavor must not contain data-driven enchantment registry entries.',
);

const officialFiles = fs.readdirSync(vanillaEnchantRoot).filter((name) => name.endsWith('.json'));
assert.equal(officialFiles.length, 43, 'Official 26.2 enchantment count changed; re-audit tag assumptions.');
const expectedCaps = {
  sharpness: 5,
  smite: 5,
  bane_of_arthropods: 5,
  density: 5,
  breach: 4,
  protection: 4,
  blast_protection: 4,
  fire_protection: 4,
  projectile_protection: 4,
  infinity: 1,
  mending: 1,
  multishot: 1,
  piercing: 4,
};
for (const [name, cap] of Object.entries(expectedCaps)) {
  const official = readJson(path.join(vanillaEnchantRoot, `${name}.json`));
  assert.equal(official.max_level, cap, `Official 26.2 max level changed for ${name}.`);
}

const officialExclusive = {
  damage: ['minecraft:sharpness', 'minecraft:smite', 'minecraft:bane_of_arthropods', 'minecraft:impaling', 'minecraft:density', 'minecraft:breach'],
  armor: ['minecraft:protection', 'minecraft:blast_protection', 'minecraft:fire_protection', 'minecraft:projectile_protection'],
  bow: ['minecraft:infinity', 'minecraft:mending'],
  crossbow: ['minecraft:multishot', 'minecraft:piercing'],
};
const realmSafeExclusive = {
  damage: ['minecraft:impaling'],
  armor: [],
  bow: [],
  crossbow: [],
};
const minecraftExclusiveRoot = path.join(packRoot, 'data', 'minecraft', 'tags', 'enchantment', 'exclusive_set');
assert.deepEqual(
  fs.readdirSync(minecraftExclusiveRoot).filter((name) => name.endsWith('.json')).sort(),
  Object.keys(realmSafeExclusive).map((name) => `${name}.json`).sort(),
  'Only the four audited vanilla exclusive-set tags may be replaced.',
);
for (const [name, values] of Object.entries(realmSafeExclusive)) {
  const official = readJson(path.join(vanillaExclusiveRoot, `${name}.json`));
  assert.deepEqual(official.values, officialExclusive[name], `Official 26.2 exclusive set changed for ${name}.`);
  const actual = readJson(path.join(minecraftExclusiveRoot, `${name}.json`));
  assert.equal(actual.replace, true, `${name} must replace, not merge with, the vanilla exclusive set.`);
  assert.deepEqual(actual.values, values, `Realm-safe exclusive set is wrong for ${name}.`);
}

const officialSharpness = readJson(path.join(vanillaEnchantRoot, 'sharpness.json'));
assert.equal(officialSharpness.supported_items, '#minecraft:enchantable/sharp_weapon', 'Sharpness support tag changed in official 26.2 data.');
const sharpnessUsers = officialFiles
  .filter((filename) => readJson(path.join(vanillaEnchantRoot, filename)).supported_items === '#minecraft:enchantable/sharp_weapon')
  .map((filename) => filename.slice(0, -5));
assert.deepEqual(sharpnessUsers, ['sharpness'], 'Adding the mace to sharp_weapon would affect an unexpected enchantment.');
const officialSharpItems = readJson(path.join(vanillaEnchantableRoot, 'sharp_weapon.json'));
assert.deepEqual(officialSharpItems.values, ['#minecraft:enchantable/melee_weapon', '#minecraft:axes'], 'Official sharp_weapon tag changed.');
const sharpnessItems = readJson(path.join(packRoot, 'data', 'minecraft', 'tags', 'item', 'enchantable', 'sharp_weapon.json'));
assert.equal(sharpnessItems.replace, false, 'Mace support must merge with the vanilla sharp_weapon tag.');
assert.deepEqual(sharpnessItems.values, ['minecraft:mace'], 'Sharpness item support must add only the mace.');

for (const material of ['leather', 'copper', 'chainmail', 'golden', 'iron', 'diamond', 'netherite']) {
  const item = `minecraft:${material}_chestplate`;
  const recipe = readJson(path.join(packRoot, 'data', 'toybox', 'recipe', `winged_${material}_chestplate.json`));
  assert.equal(recipe.type, 'minecraft:crafting_transmute', `Wingbound ${material} recipe must use crafting_transmute.`);
  assert.equal(recipe.input, item, `Wingbound ${material} recipe has the wrong chestplate input.`);
  assert.equal(recipe.material, 'minecraft:elytra', `Wingbound ${material} recipe must consume an elytra.`);
  assert.equal(recipe.result?.id, item, `Wingbound ${material} recipe must return the same chestplate tier.`);
  assert.deepEqual(recipe.result?.components?.['minecraft:glider'], {}, `Wingbound ${material} result must contain the glider component.`);
}
const recipeRoot = path.join(packRoot, 'data', 'toybox', 'recipe');
assert.deepEqual(
  fs.readdirSync(recipeRoot).filter((name) => name.endsWith('.json')).sort(),
  ['chainmail', 'copper', 'diamond', 'golden', 'iron', 'leather', 'netherite'].map((name) => `winged_${name}_chestplate.json`).sort(),
  'Only the seven Wingbound Chestplate recipes may remain.',
);
const wingboundItems = readJson(path.join(packRoot, 'data', 'toybox', 'tags', 'item', 'wingbound_chestplates.json'));
assert.deepEqual(
  wingboundItems.values,
  ['leather', 'copper', 'chainmail', 'golden', 'iron', 'diamond', 'netherite'].map((material) => `minecraft:${material}_chestplate`),
  'Grindstone separation must accept exactly the seven supported chestplates.',
);

const removeWingbound = readJson(path.join(packRoot, 'data', 'toybox', 'item_modifier', 'remove_wingbound_components.json'));
assert.deepEqual(
  removeWingbound,
  {
    function: 'minecraft:set_components',
    components: {
      '!minecraft:glider': {},
      '!minecraft:item_name': {},
      '!minecraft:rarity': {},
      '!minecraft:enchantment_glint_override': {},
    },
  },
  'Separation must remove only the four components added by Wingbound crafting.',
);

assert.ok(
  !fs.existsSync(path.join(packRoot, 'data', 'minecraft', 'tags', 'enchantment', 'in_enchanting_table.json')),
  'Retired custom enchantments must not be added to the enchanting table.',
);

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
assert.equal(loreInsert[0]?.lore?.[0]?.translate, 'message.enchant_plus.anvil.cost_lore', 'The cost line must be localized.');
assert.equal(loreInsert[0]?.lore?.[0]?.with?.[0]?.storage, 'toybox:runtime', 'The cost line must read the exact stored repair_cost.');
assert.equal(loreInsert[1]?.function, 'minecraft:set_custom_data', 'New cost lore must receive a managed marker.');
assert.equal(loreInsert[1]?.tag?.toybox?.anvil_lore, true, 'The lore marker must be namespaced under toybox.');
const loreReplace = readJson(path.join(packRoot, 'data', 'toybox', 'item_modifier', 'anvil_lore_replace.json'));
assert.equal(loreReplace.mode, 'replace_section', 'Managed cost lore must be updated in place.');
assert.equal(loreReplace.offset, 0, 'Only the managed first lore line may be replaced.');
assert.equal(loreReplace.size, 1, 'Existing user lore after the managed line must be preserved.');
assert.equal(loreReplace.entity, 'this', 'Refreshed dynamic cost text must resolve against the modified entity.');
const loreRemove = readJson(path.join(packRoot, 'data', 'toybox', 'item_modifier', 'anvil_lore_remove.json'));
assert.equal(loreRemove[0]?.function, 'minecraft:set_lore', 'Zero-cost cleanup must remove the managed lore through set_lore.');
assert.deepEqual(loreRemove[0]?.lore, [], 'Zero-cost cleanup must insert no replacement line.');
assert.equal(loreRemove[0]?.mode, 'replace_section', 'Zero-cost cleanup must remove only the managed section.');
assert.equal(loreRemove[0]?.offset, 0, 'Zero-cost cleanup must start at the managed first line.');
assert.equal(loreRemove[0]?.size, 1, 'Zero-cost cleanup must preserve all later user lore.');
assert.equal(loreRemove[1]?.tag?.toybox?.anvil_lore, false, 'Removed lore must not retain an active marker.');
assert.ok(
  !fs.existsSync(path.join(packRoot, 'data', 'toybox', 'advancement', 'interaction', 'anvil_open.json')),
  'Opening an anvil must not trigger intrusive guidance.',
);
const repairInventory = readJson(path.join(packRoot, 'data', 'toybox', 'advancement', 'interaction', 'repair_cost_inventory.json'));
assert.equal(repairInventory.criteria?.changed?.trigger, 'minecraft:inventory_changed', 'Repair-cost lore and ritual scans must remain event-driven.');
assert.ok(!fs.existsSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'reset_inventory.mcfunction')), 'Automatic inventory cleanup must not remain.');
const inventoryRefresh = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'refresh_inventory.mcfunction'), 'utf8');
const inventorySlots = [];
for (let slot = 0; slot < 9; slot++) inventorySlots.push({ command: `hotbar.${slot}`, nbt: `${slot}b` });
for (let slot = 0; slot < 27; slot++) inventorySlots.push({ command: `inventory.${slot}`, nbt: `${slot + 9}b` });
inventorySlots.push(
  { command: 'weapon.offhand', nbt: '-106b' },
  { command: 'armor.feet', nbt: '100b' },
  { command: 'armor.legs', nbt: '101b' },
  { command: 'armor.chest', nbt: '102b' },
  { command: 'armor.head', nbt: '103b' },
);
for (const slot of inventorySlots) {
  assert.ok(
    inventoryRefresh.includes(`Inventory[{Slot:${slot.nbt}}].components."minecraft:repair_cost"`),
    `Raw repair_cost lookup is missing ${slot.command}.`,
  );
  for (const modifier of ['insert', 'replace', 'remove']) {
    assert.ok(
      inventoryRefresh.includes(`${slot.command} toybox:anvil_lore_${modifier}`),
      `Anvil lore ${modifier} is missing ${slot.command}.`,
    );
  }
}
assert.ok(inventoryRefresh.includes('if score $anvil_cost ep_data matches 1..'), 'Only positive stored costs may show a lore line.');
assert.ok(inventoryRefresh.includes('unless score $anvil_cost ep_data matches 1..'), 'Zero or absent costs must remove old managed lore.');
assert.ok(!inventoryRefresh.includes('*[minecraft:repair_cost]'), 'Default component predicates must not decide whether +0 lore is shown.');
assert.ok(inventoryRefresh.includes('toybox:anvil_lore_insert'), 'Lore refresh must safely insert the first managed line.');
assert.ok(inventoryRefresh.includes('toybox:anvil_lore_replace'), 'Lore refresh must update an existing managed line.');
assert.ok(inventoryRefresh.includes('toybox:anvil_lore_remove'), 'Lore refresh must remove an obsolete +0 line.');
const inventoryEvent = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'inventory_changed.mcfunction'), 'utf8');
assert.ok(
  inventoryEvent.includes('execute if data entity @s Inventory[].components."minecraft:repair_cost"'),
  'Inventory events must refresh slots only when a stored repair_cost exists.',
);
assert.ok(
  inventoryEvent.indexOf('function toybox:anvil_reset/refresh_inventory') < inventoryEvent.indexOf('advancement revoke'),
  'Inventory advancement must remain granted during lore updates to prevent recursive re-awards.',
);
assert.ok(!inventoryEvent.includes('schedule function'), 'Broad inventory changes must not schedule ritual entity scans.');
assert.ok(!inventoryEvent.includes('scan_player'), 'Broad inventory changes must not invoke ritual entity scans.');
const armScan = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'arm_scan.mcfunction'), 'utf8');
assert.ok(armScan.includes('scoreboard players set @s ep_star_drop 0'), 'The drop event must be acknowledged once.');
assert.ok(armScan.includes('scoreboard players set @s ep_scan 80'), 'A Nether Star drop must arm a bounded four-second scan window.');
const scanPlayer = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'scan_player.mcfunction'), 'utf8');
assert.ok(scanPlayer.includes('distance=..4'), 'Ritual item scans must stay player-local.');
assert.ok(scanPlayer.includes('#minecraft:anvil'), 'The Nether Star catalyst must rest on an anvil.');
assert.ok(scanPlayer.includes('contents minecraft:nether_star'), 'The ritual must require a Nether Star.');
const scanStar = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'scan_star.mcfunction'), 'utf8');
assert.ok(!scanStar.includes('*[minecraft:repair_cost]'), 'Candidate selection must not mistake a default zero component for stored cost.');
assert.ok(scanStar.includes('scoreboard players set $anvil_done ep_data 0'), 'Each catalyst must begin with one unfinished reset.');
assert.ok(scanStar.includes('sort=nearest'), 'Candidate items must be tried in stable distance order.');
const resetTarget = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'reset_target.mcfunction'), 'utf8');
assert.ok(resetTarget.includes('Item.components."minecraft:repair_cost"'), 'Candidate cost must come from stored item-entity NBT.');
assert.ok(resetTarget.includes('if score $anvil_cost ep_data matches 1..'), 'Only a positive prior-work penalty may be reset.');
assert.ok(resetTarget.includes('if score $anvil_done ep_data matches 0'), 'One catalyst scan may reset only one item.');
const resetEntity = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'reset_entity.mcfunction'), 'utf8');
assert.ok(resetEntity.includes('toybox:reset_repair_cost'), 'The ritual must use the component-preserving reset modifier.');
assert.ok(resetEntity.includes('Item.components."minecraft:repair_cost"'), 'Reset success must be verified against stored NBT, not the default component.');
assert.ok(resetEntity.includes('unless score $anvil_remaining ep_data matches 1..'), 'A missing or zero stored cost must count as a successful reset.');
assert.ok(resetEntity.includes('toybox:anvil_lore_remove'), 'A successful reset must remove the managed cost line.');
assert.ok(!resetEntity.includes('toybox:anvil_lore_insert'), 'A successful reset must never create a +0 line.');
assert.ok(resetEntity.includes('function toybox:anvil_reset/finish'), 'Catalyst consumption must happen only after a successful reset.');
const consumeStar = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'consume_star.mcfunction'), 'utf8');
assert.ok(consumeStar.includes('scoreboard players remove $anvil_star_count ep_data 1'), 'Exactly one Nether Star must be consumed.');
const manualAttempt = fs.readFileSync(path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'attempt.mcfunction'), 'utf8');
assert.ok(!manualAttempt.includes('reset_repair_cost'), 'The public trigger must not bypass the Nether Star cost.');

const forbiddenPaths = [
  path.join(packRoot, 'data', 'toybox', 'function', 'advanced_enchant'),
  path.join(packRoot, 'data', 'toybox', 'item_modifier', 'advanced_enchant'),
  path.join(packRoot, 'data', 'toybox', 'function', 'dev'),
  path.join(packRoot, 'data', 'toybox', 'item_modifier', 'dev'),
  path.join(packRoot, 'data', 'toybox', 'advancement', 'interaction', 'enchanting_table.json'),
  path.join(packRoot, 'data', 'toybox', 'function', 'alchemy'),
  path.join(packRoot, 'data', 'toybox', 'function', 'building'),
  path.join(packRoot, 'data', 'toybox', 'function', 'enchantment'),
  path.join(packRoot, 'data', 'toybox', 'function', 'farming'),
  path.join(packRoot, 'data', 'toybox', 'function', 'grappling'),
  path.join(packRoot, 'data', 'toybox', 'function', 'soup'),
  path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'check_pending.mcfunction'),
  path.join(packRoot, 'data', 'toybox', 'function', 'anvil_reset', 'opened.mcfunction'),
  path.join(packRoot, 'data', 'toybox', 'advancement', 'interaction', 'anvil_open.json'),
  path.join(packRoot, 'data', 'toybox', 'advancement', 'interaction', 'brewing_stand.json'),
  path.join(packRoot, 'data', 'toybox', 'advancement', 'interaction', 'sickle_use.json'),
  path.join(packRoot, 'data', 'toybox', 'tags', 'block'),
  path.join(packRoot, 'data', 'toybox', 'predicate'),
];
for (const candidate of forbiddenPaths) {
  assert.equal(walk(candidate).length, 0, `Core flavor must not contain files under ${rel(packRoot, candidate)}.`);
}

const dataFiles = walk(path.join(packRoot, 'data'));
for (const file of dataFiles) {
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(!/advanced_enchant|client_test/i.test(text), `Removed high-level enchant path is still referenced by ${rel(packRoot, file)}.`);
  assert.ok(!/"max_level"\s*:/.test(text), `Runtime pack must not define enchantment level caps: ${rel(packRoot, file)}.`);
  assert.ok(!/\brun\s+enchant\s+/.test(text), `Runtime pack must not apply enchantments by command: ${rel(packRoot, file)}.`);
  assert.ok(!/amethyst|자수정/i.test(text), `Anvil renewal must not reference amethyst: ${rel(packRoot, file)}.`);
  assert.ok(!/(?:message|item|pack)\.toybox\./.test(text), `Toybox-branded translation remains in ${rel(packRoot, file)}.`);
  if (file !== path.join(packRoot, 'data', 'toybox', 'function', 'system', 'migrate_objectives.mcfunction')) {
    assert.ok(!/\btb_(?:help|anvil|pver|data)\b/.test(text), `Legacy public objective remains in ${rel(packRoot, file)}.`);
  }
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

const harnessDataRoot = path.join(harnessRoot, 'data');
const harnessDataFiles = walk(harnessDataRoot);
const harnessFunctionRoot = path.join(harnessDataRoot, 'toybox', 'function');
const harnessFunctions = new Set(
  walk(harnessFunctionRoot)
    .filter((file) => file.endsWith('.mcfunction'))
    .map((file) => rel(harnessFunctionRoot, file).slice(0, -'.mcfunction'.length)),
);
assert.deepEqual(
  [...harnessFunctions].sort(),
  ['dev/anvil_compat_probe', 'dev/server_smoke', 'dev/vanilla_compat_smoke'],
  'The isolated test harness must contain only the three audited smoke functions.',
);
const allTestFunctions = new Set([...functions, ...harnessFunctions]);
for (const file of harnessDataFiles.filter((candidate) => candidate.endsWith('.json') || candidate.endsWith('.mcfunction'))) {
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(!/advanced_enchant|client_test/i.test(text), `Removed high-level enchant path remains in the test harness: ${rel(harnessRoot, file)}.`);
  for (const match of text.matchAll(/\bfunction\s+toybox:([a-z0-9_./-]+)/g)) {
    assert.ok(allTestFunctions.has(match[1]), `Test harness references missing function toybox:${match[1]}.`);
  }
  for (const match of text.matchAll(/\brun\s+enchant\s+\S+\s+minecraft:([a-z0-9_]+)\s+(\d+)/g)) {
    const [, enchantment, rawLevel] = match;
    assert.ok(Object.hasOwn(expectedCaps, enchantment), `Test harness uses an unaudited enchantment command: ${enchantment}.`);
    assert.ok(Number(rawLevel) <= expectedCaps[enchantment], `Test harness exceeds the vanilla ${enchantment} cap.`);
  }
}
const harnessModifierRoot = path.join(harnessDataRoot, 'toybox', 'item_modifier', 'dev', 'compat');
const expectedHarnessModifiers = [
  'bane_of_arthropods', 'blast_protection', 'breach', 'density', 'fire_protection',
  'infinity', 'piercing', 'projectile_protection', 'sharpness', 'smite',
];
assert.deepEqual(
  fs.readdirSync(harnessModifierRoot).filter((name) => name.endsWith('.json')).sort(),
  expectedHarnessModifiers.map((name) => `${name}.json`).sort(),
  'The isolated test harness modifier set changed.',
);
for (const name of expectedHarnessModifiers) {
  const modifier = readJson(path.join(harnessModifierRoot, `${name}.json`));
  assert.deepEqual(
    modifier,
    {
      function: 'minecraft:enchant_randomly',
      include_additional_cost_component: false,
      only_compatible: true,
      options: `minecraft:${name}`,
    },
    `Test modifier ${name} must use vanilla-compatible random levels only.`,
  );
}

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
const tickFunction = fs.readFileSync(path.join(functionRoot, 'tick.mcfunction'), 'utf8');
assert.ok(tickFunction.includes('@a[scores={ep_star_drop=1..}]'), 'Only a Nether Star drop may arm ritual scanning.');
assert.ok(tickFunction.includes('@a[scores={ep_scan=1..}] at @s run function toybox:anvil_reset/scan_player'), 'Ritual scans must be gated by the bounded player score.');
assert.ok(tickFunction.includes('scoreboard players remove @a[scores={ep_scan=1..}] ep_scan 1'), 'The ritual scan window must count down every tick.');
assert.ok(tickFunction.includes('@a[scores={ep_item_drop=1..}] run function toybox:wingbound/arm_scan'), 'A Q-drop event must arm Wingbound separation scanning.');
assert.ok(tickFunction.includes('@a[scores={ep_wing_scan=1..}] at @s run function toybox:wingbound/scan_player'), 'Wingbound scans must be gated by the bounded player score.');
assert.ok(tickFunction.includes('scoreboard players remove @a[scores={ep_wing_scan=1..}] ep_wing_scan 1'), 'The Wingbound scan window must count down every tick.');
assert.ok(!tickFunction.includes('@e['), 'The root tick function must never perform a global entity query.');
assert.ok(tickReachable.has('anvil_reset/scan_player'), 'The bounded Nether Star event must reach the local ritual scan.');
assert.ok(tickReachable.has('anvil_reset/scan_star'), 'The bounded ritual scan must reach catalyst processing.');
assert.ok(tickReachable.has('wingbound/scan_player'), 'The bounded Q-drop event must reach Wingbound scanning.');
assert.ok(tickReachable.has('wingbound/separate'), 'Wingbound scanning must reach component-safe separation.');

const wingArm = fs.readFileSync(path.join(functionRoot, 'wingbound', 'arm_scan.mcfunction'), 'utf8');
assert.ok(wingArm.includes('scoreboard players set @s ep_item_drop 0'), 'The generic item-drop event must be acknowledged once.');
assert.ok(wingArm.includes('scoreboard players set @s ep_wing_scan 60'), 'Wingbound separation must use a bounded three-second scan window.');
const wingScan = fs.readFileSync(path.join(functionRoot, 'wingbound', 'scan_player.mcfunction'), 'utf8');
assert.ok(wingScan.includes('distance=..4'), 'Wingbound item scans must stay player-local.');
assert.ok(wingScan.includes('minecraft:grindstone'), 'Wingbound separation must require the grindstone top.');
assert.ok(wingScan.includes('#toybox:wingbound_chestplates'), 'Wingbound separation must restrict candidate item types.');
const wingSeparate = fs.readFileSync(path.join(functionRoot, 'wingbound', 'separate.mcfunction'), 'utf8');
assert.ok(wingSeparate.includes('Item.components."minecraft:glider"'), 'Separation must require a stored glider component.');
assert.ok(wingSeparate.includes('toybox:remove_wingbound_components'), 'Separation must use the component-preserving modifier.');
assert.ok(wingSeparate.includes('if score $wing_remaining ep_data matches 0'), 'An elytra may be returned only after glider removal is verified.');
const wingFinish = fs.readFileSync(path.join(functionRoot, 'wingbound', 'finish.mcfunction'), 'utf8');
assert.equal((wingFinish.match(/summon minecraft:item/g) ?? []).length, 1, 'One successful separation must summon exactly one item entity.');
assert.ok(wingFinish.includes('Item:{id:"minecraft:elytra",count:1}'), 'One successful separation must return exactly one elytra.');
assert.ok(wingFinish.includes('message.enchant_plus.wingbound.separated'), 'Separation feedback must be localized.');

assert.equal(walk(path.join(resourceRoot, 'assets', 'toybox')).length, 0, 'Resource pack must not retain Toybox branding files.');
const en = readJson(path.join(resourceRoot, 'assets', 'enchant_plus', 'lang', 'en_us.json'));
const ko = readJson(path.join(resourceRoot, 'assets', 'enchant_plus', 'lang', 'ko_kr.json'));
assert.deepEqual(Object.keys(en).sort(), Object.keys(ko).sort(), 'English and Korean translation key sets must match.');
for (const file of dataFiles.filter((candidate) => candidate.endsWith('.json') || candidate.endsWith('.mcfunction'))) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/"translate"\s*:\s*"((?:message|item|enchantment|pack)\.enchant_plus\.[^"]+)"/g)) {
    assert.ok(Object.hasOwn(en, match[1]), `Missing English translation ${match[1]} referenced by ${rel(packRoot, file)}.`);
    assert.ok(Object.hasOwn(ko, match[1]), `Missing Korean translation ${match[1]} referenced by ${rel(packRoot, file)}.`);
  }
}

const fallbackPattern = /"translate"\s*:\s*"([^"]+)"\s*,\s*"fallback"\s*:\s*"((?:\\.|[^"\\])*)"/g;
for (const file of [path.join(packRoot, 'pack.mcmeta'), ...dataFiles.filter((candidate) => candidate.endsWith('.json') || candidate.endsWith('.mcfunction'))]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(fallbackPattern)) {
    const key = match[1];
    if (!Object.hasOwn(ko, key)) continue;
    const fallback = JSON.parse(`"${match[2]}"`);
    assert.equal(fallback, ko[key], `Korean default fallback is out of sync for ${key} in ${rel(packRoot, file)}.`);
  }
}

assert.equal(en['message.enchant_plus.help.enchantments'].includes('vanilla level caps'), true, 'English help must identify vanilla caps.');
assert.equal(ko['message.enchant_plus.help.enchantments'].includes('바닐라 상한'), true, 'Korean help must identify vanilla caps.');
assert.equal(en['pack.enchant_plus.description'], 'Enchant Plus v1.1.4 — Minecraft Java 26.2', 'English resource title is stale.');
assert.equal(ko['pack.enchant_plus.description'], '인챈트플러스 v1.1.4 — Minecraft Java 26.2', 'Korean resource title is stale.');
assert.ok(en['message.enchant_plus.enabled'].startsWith('[Enchant Plus]'), 'English message prefix is stale.');
assert.ok(ko['message.enchant_plus.enabled'].startsWith('[인챈트플러스]'), 'Korean message prefix is stale.');
assert.ok(en['message.enchant_plus.enabled'].includes('/trigger ep_help'), 'English help trigger is stale.');
assert.ok(ko['message.enchant_plus.enabled'].includes('/trigger ep_help'), 'Korean help trigger is stale.');
assert.ok(en['message.enchant_plus.help.anvil_cost'].includes('+0 is hidden'), 'English help must explain zero-cost suppression.');
assert.ok(ko['message.enchant_plus.help.anvil_cost'].includes('+0은 표시하지 않음'), 'Korean help must explain zero-cost suppression.');
assert.ok(ko['message.enchant_plus.help.wingbound_separate'].includes('숫돌 윗면'), 'Korean help must explain grindstone separation.');
assert.ok(en['message.enchant_plus.help.wingbound_separate'].includes('grindstone'), 'English help must explain grindstone separation.');
assert.ok(Object.values(ko).every((value) => typeof value !== 'string' || !value.includes('밀도')), 'Korean user-facing text must call Density 육중, not 밀도.');
assert.equal(Object.keys(en).some((key) => key.includes('.toybox.')), false, 'Toybox-branded translation keys must not remain.');
for (const removedFragment of ['alchemy', 'chalk', 'compass', 'grappling_hook', 'harvest_sickle', 'soup', 'wind_bottle']) {
  assert.ok(
    !Object.keys(en).some((key) => key.includes(removedFragment)),
    `Removed feature translation remains: ${removedFragment}`,
  );
}
assert.equal(Object.keys(en).some((key) => key.startsWith('enchantment.')), false, 'Retired custom enchantment translations must not remain.');

console.log(`Validated ${jsonFiles.length} JSON/metadata files.`);
console.log(`Verified tag-only compatibility against ${officialFiles.length} official 26.2 enchantments; no custom registry entries.`);
console.log(`Resolved ${referencedFunctions.size} runtime references and isolated ${harnessFunctions.size} test functions; tick graph reaches ${tickReachable.size} functions.`);
console.log('Enchant Plus static validation passed.');
