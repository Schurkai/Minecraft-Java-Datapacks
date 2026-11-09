import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Minecraft Grappling Hook Validator';

const toolsRoot = path.dirname(fileURLToPath(import.meta.url));
const packRoot = path.resolve(toolsRoot, '..');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function rel(file) {
  return path.relative(packRoot, file).replaceAll('\\', '/');
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

const allFiles = walk(packRoot);
const jsonFiles = allFiles.filter((file) => file.endsWith('.json'));
const metadataFile = path.join(packRoot, 'pack.mcmeta');
assert.ok(fs.existsSync(metadataFile), 'pack.mcmeta is missing.');

const parsed = new Map();
for (const file of [metadataFile, ...jsonFiles]) {
  try {
    parsed.set(file, JSON.parse(read(file)));
  } catch (error) {
    throw new Error(`${rel(file)} is not valid JSON: ${error.message}`);
  }
}

const metadata = parsed.get(metadataFile);
assert.deepEqual(metadata.pack.min_format, [107, 1], 'min_format must be 107.1.');
assert.deepEqual(metadata.pack.max_format, [107, 1], 'max_format must be 107.1.');
assert.equal(Object.hasOwn(metadata, 'features'), false, 'pack.mcmeta must not request feature flags.');

const forbiddenRegistryPattern = /^data\/[^/]+\/(?:enchantment|dimension|dimension_type|damage_type|worldgen)\//;
for (const file of allFiles) {
  assert.ok(!forbiddenRegistryPattern.test(rel(file)), `Dynamic registry entry is forbidden: ${rel(file)}`);
  assert.ok(!/^data\/(?:toybox|enchant_plus)\//.test(rel(file)), `Foreign namespace is forbidden: ${rel(file)}`);
}

const functionFiles = allFiles.filter((file) => file.endsWith('.mcfunction'));
const functions = new Map();
for (const file of functionFiles) {
  const match = rel(file).match(/^data\/([^/]+)\/function\/(.+)\.mcfunction$/);
  assert.ok(match, `Function is outside the singular function directory: ${rel(file)}`);
  functions.set(`${match[1]}:${match[2]}`, file);
}

const referencedFunctions = new Set();
const functionEdges = new Map();
for (const [id, file] of functions) {
  const source = read(file);
  const edges = new Set();
  for (const match of source.matchAll(/\bfunction\s+(grapple:[a-z0-9_./-]+)/g)) {
    referencedFunctions.add(match[1]);
    edges.add(match[1]);
  }
  functionEdges.set(id, edges);
  for (const selector of source.matchAll(/@e(?:\[([^\]]*)\])?/g)) {
    assert.ok(selector[1], `Bare @e selector is forbidden: ${id}`);
    assert.match(selector[1], /(?:^|,)distance=/, `Every @e selector must be distance-bounded: ${id}`);
  }
  for (const objective of source.matchAll(/scoreboard objectives add\s+([A-Za-z0-9_.+-]+)/g)) {
    assert.ok(objective[1].length <= 16, `Objective exceeds 16 characters: ${objective[1]}`);
  }
}

for (const id of referencedFunctions) {
  assert.ok(functions.has(id), `Missing referenced function: ${id}`);
}
for (const required of ['grapple:load', 'grapple:tick', 'grapple:system/server_probe']) {
  assert.ok(functions.has(required), `Missing required function: ${required}`);
}

for (const tagName of ['load', 'tick']) {
  const file = path.join(packRoot, 'data', 'minecraft', 'tags', 'function', `${tagName}.json`);
  const tag = parsed.get(file);
  assert.ok(tag, `Missing ${tagName} function tag.`);
  assert.deepEqual(tag.values, [`grapple:${tagName}`], `Unexpected ${tagName} function tag.`);
}

const recipeFile = path.join(packRoot, 'data', 'grapple', 'recipe', 'grappling_hook.json');
const recipe = parsed.get(recipeFile);
assert.equal(recipe.type, 'minecraft:crafting_shaped');
assert.equal(recipe.result.id, 'minecraft:fishing_rod');
assert.equal(recipe.result.components['minecraft:custom_data'].grapple.hook, true);
assert.equal(recipe.result.components['minecraft:custom_data'].grapple.version, 1);
assert.equal(recipe.result.components['minecraft:custom_name'].fallback, '갈고리');
assert.ok(recipe.result.components['minecraft:unbreakable'], 'Hook must avoid irregular vanilla reel durability.');
assert.equal(Object.hasOwn(recipe.result.components, 'minecraft:enchantments'), false, 'Hook must not depend on an enchantment.');

const initSource = read(functions.get('grapple:system/init_objectives'));
assert.match(initSource, /minecraft\.used:minecraft\.fishing_rod/, 'Fishing-rod use statistic objective is missing.');

const inputSource = read(functions.get('grapple:input/use'));
assert.match(inputSource, /weapon\.mainhand/, 'Hook must explicitly require the main hand.');
assert.match(inputSource, /minecraft:custom_data~\{grapple:\{hook:1b\}\}/, 'Hook custom-data guard is missing.');

const ownerSource = read(functions.get('grapple:cast/check_candidate'));
assert.match(ownerSource, /execute on origin/, 'Bobber owner verification is missing.');

const scanSource = read(functions.get('grapple:cast/scan'));
assert.match(scanSource, /type=minecraft:fishing_bobber/, 'Pending scan must target fishing bobbers.');
assert.match(scanSource, /distance=\.\.5/, 'Pending bobber scan must remain within five blocks.');

const movementTagFile = path.join(packRoot, 'data', 'grapple', 'tags', 'block', 'movement_passable.json');
const movementTag = parsed.get(movementTagFile);
assert.ok(movementTag, 'Movement passable block tag is missing.');
assert.ok(movementTag.values.includes('#minecraft:air'));
assert.ok(movementTag.values.includes('minecraft:water'));
assert.equal(movementTag.values.includes('minecraft:lava'), false, 'Lava must never be movement-passable.');

const movementFunctions = [...functions.entries()].filter(([id]) => id.startsWith('grapple:movement/'));
assert.equal(movementFunctions.length, 12, 'Expected six speed functions and six half-step fallbacks.');
for (const [id, file] of movementFunctions) {
  const source = read(file);
  assert.equal([...source.matchAll(/if block /g)].length, 12, `${id} must check 12 player-volume samples.`);
  assert.match(source, /run tp @a\[tag=grapple\.current,limit=1\]/, `${id} must move only the current linked player.`);
}

const activeSource = read(functions.get('grapple:active/tick'));
assert.match(activeSource, /distance=\.\.30/, 'Active anchor lookup must enforce the 30-block range.');
assert.match(activeSource, /gh_state matches 3/, 'Pulling state is missing.');
assert.match(activeSource, /minecraft:slow_falling/, 'Pulling fall protection is missing.');

const flightSource = read(functions.get('grapple:flight/tick'));
assert.equal([...flightSource.matchAll(/execute positioned /g)].length, 6, 'Bobber contact must sample six directions.');
assert.match(flightSource, /grapple:entity\/is_on_ground/, 'Bobber ground contact predicate is missing.');

const latchSource = read(functions.get('grapple:flight/latch'));
assert.doesNotMatch(latchSource, /function grapple:pull\/tick/, 'Latch must not double-run pulling; tick_anchor dispatches it once.');

const reachable = new Set();
const stack = ['grapple:tick'];
while (stack.length) {
  const id = stack.pop();
  if (reachable.has(id)) continue;
  reachable.add(id);
  for (const edge of functionEdges.get(id) ?? []) stack.push(edge);
}
for (const [id] of movementFunctions) {
  assert.ok(reachable.has(id), `Movement function is not reachable from the tick entrypoint: ${id}`);
}

const runtimeText = allFiles
  .filter((file) => rel(file) === 'pack.mcmeta' || rel(file).startsWith('data/'))
  .map(read)
  .join('\n');
assert.equal(runtimeText.includes('toybox:grappling'), false, 'Retired enchantment ID must not appear in runtime data.');
assert.equal(runtimeText.includes('P0'), false, 'P0 diagnostic wording must not remain in runtime data.');

console.log(`Validated ${jsonFiles.length + 1} JSON/metadata files and ${functionFiles.length} functions.`);
console.log(`Resolved ${referencedFunctions.size} internal function references; all entity selectors are distance-bounded.`);
console.log(`Confirmed registry-free owner linking and ${movementFunctions.length} collision-checked movement functions.`);
console.log('Grappling Hook static validation passed.');
