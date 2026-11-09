import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Realm_Toybox.generate_v040';

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDir, '..');

function safePath(relative) {
  const target = path.resolve(root, relative);
  const boundary = root.endsWith(path.sep) ? root : root + path.sep;
  if (!target.startsWith(boundary)) throw new Error(`Unsafe generated path: ${target}`);
  return target;
}

function resetDir(relative) {
  const target = safePath(relative);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
}

function write(relative, content) {
  const target = safePath(relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
}

function writeJson(relative, value) {
  write(relative, JSON.stringify(value, null, 2));
}

function lines(...values) {
  return `${values.flat().join('\n')}\n`;
}

for (const directory of [
  'data/toybox/function/advanced_enchant',
  'data/toybox/function/alchemy',
  'data/toybox/function/dev/client_test',
  'data/toybox/item_modifier/advanced_enchant',
]) resetDir(directory);

const interactionCondition = (block, reward) => ({
  criteria: {
    use: {
      trigger: 'minecraft:default_block_use',
      conditions: {
        location: [
          {
            condition: 'minecraft:location_check',
            predicate: { block: { blocks: block } },
          },
        ],
      },
    },
  },
  rewards: { function: reward },
});

writeJson(
  'data/toybox/advancement/interaction/enchanting_table.json',
  interactionCondition('minecraft:enchanting_table', 'toybox:advanced_enchant/interact'),
);
writeJson(
  'data/toybox/advancement/interaction/brewing_stand.json',
  interactionCondition('minecraft:brewing_stand', 'toybox:alchemy/interact'),
);
writeJson('data/toybox/tags/block/enchanting_transmitters.json', {
  values: [
    '#minecraft:enchantment_power_transmitter',
    '#minecraft:enchantment_power_provider',
  ],
});
writeJson('data/toybox/tags/item/alchemy_bottles.json', {
  values: [
    'minecraft:potion',
    'minecraft:splash_potion',
    'minecraft:lingering_potion',
  ],
});

// ---------------------------------------------------------------------------
// Advanced enchanting
// ---------------------------------------------------------------------------

const enchantments = [
  { id: 'minecraft:bane_of_arthropods', slug: 'bane_of_arthropods', base: 5, max: 10 },
  { id: 'minecraft:blast_protection', slug: 'blast_protection', base: 4, max: 10 },
  { id: 'minecraft:fire_protection', slug: 'fire_protection', base: 4, max: 10 },
  { id: 'minecraft:impaling', slug: 'impaling', base: 5, max: 10 },
  { id: 'minecraft:power', slug: 'power', base: 5, max: 10 },
  { id: 'minecraft:projectile_protection', slug: 'projectile_protection', base: 4, max: 10 },
  { id: 'minecraft:protection', slug: 'protection', base: 4, max: 10 },
  { id: 'minecraft:sharpness', slug: 'sharpness', base: 5, max: 10 },
  { id: 'minecraft:smite', slug: 'smite', base: 5, max: 10 },
  { id: 'minecraft:density', slug: 'density', base: 5, max: 7 },
  { id: 'minecraft:efficiency', slug: 'efficiency', base: 5, max: 7 },
  { id: 'minecraft:fortune', slug: 'fortune', base: 3, max: 5 },
  { id: 'minecraft:looting', slug: 'looting', base: 3, max: 5 },
  { id: 'minecraft:unbreaking', slug: 'unbreaking', base: 3, max: 5 },
];

write(
  'data/toybox/function/advanced_enchant/interact.mcfunction',
  lines(
    '# Event-only entry point. Nothing from this graph is called by the tick function.',
    'advancement revoke @s only toybox:interaction/enchanting_table',
    'execute if items entity @s weapon.offhand minecraft:enchanted_book if items entity @s weapon.mainhand * run function toybox:advanced_enchant/prepare',
  ),
);

const rayLines = [
  '# The advancement proves an enchanting table was used; this short view ray recovers its block position.',
  'scoreboard players set $found tb_data 0',
];
for (let step = 1; step <= 21; step++) {
  const distance = (step * 0.25).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  rayLines.push(
    `execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^${distance} align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table`,
  );
}
rayLines.push(
  'execute if score $found tb_data matches 0 run tellraw @s {"translate":"message.toybox.advanced_enchant.no_table","fallback":"[Toybox] Could not resolve the enchanting table you used. Face its top or side and try again.","color":"red"}',
);
write('data/toybox/function/advanced_enchant/find_table.mcfunction', lines(rayLines));

write(
  'data/toybox/function/advanced_enchant/prepare.mcfunction',
  lines(
    'scoreboard players set $book_count tb_data 0',
    'execute store result score $book_count tb_data run data get entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"',
    'execute if score $book_count tb_data matches 1 run function toybox:advanced_enchant/find_table',
    'execute unless score $book_count tb_data matches 1 run tellraw @s {"translate":"message.toybox.advanced_enchant.one_book","fallback":"[Toybox] The off-hand book must contain exactly one supported enchantment.","color":"red"}',
  ),
);

function symmetricRound(value) {
  return Math.sign(value) * Math.round(Math.abs(value));
}

function ring(radius) {
  const result = [];
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      if (Math.max(Math.abs(x), Math.abs(z)) === radius) result.push([x, z]);
    }
  }
  return result;
}

function shelfCommand(x, y, z, radius) {
  const checks = [`if block ~${x} ~${y} ~${z} #minecraft:enchantment_power_provider`];
  const seen = new Set();
  for (let step = 1; step < radius; step++) {
    const mx = symmetricRound((x * step) / radius);
    const mz = symmetricRound((z * step) / radius);
    const key = `${mx},${mz}`;
    if (seen.has(key) || (mx === 0 && mz === 0)) continue;
    seen.add(key);
    checks.push(`if block ~${mx} ~${y} ~${mz} #toybox:enchanting_transmitters`);
  }
  return `execute ${checks.join(' ')} run scoreboard players add $shelves tb_data 1`;
}

const shelfSlots = [];
for (const y of [0, 1]) {
  for (const [x, z] of ring(2)) shelfSlots.push([x, y, z, 2]);
}
for (const [x, z] of ring(3)) shelfSlots.push([x, 0, z, 3]);
for (const [x, z] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) shelfSlots.push([x, 1, z, 3]);
if (shelfSlots.length !== 60) throw new Error(`Expected 60 shelf slots, got ${shelfSlots.length}`);

write(
  'data/toybox/function/advanced_enchant/count_shelves.mcfunction',
  lines(
    '# 60 documented fixed slots: radius-2 rings at table height and one block up,',
    '# radius-3 ring at table height, plus four upper cardinal radius-3 slots.',
    'scoreboard players set $shelves tb_data 0',
    shelfSlots.map(([x, y, z, r]) => shelfCommand(x, y, z, r)),
  ),
);

const tableLines = [
  'scoreboard players set $found tb_data 1',
  'function toybox:advanced_enchant/count_shelves',
  'execute store result score $lapis tb_data run clear @s minecraft:lapis_lazuli 0',
  'execute store result score $amethyst tb_data run clear @s minecraft:amethyst_shard 0',
  'execute store result score $player_levels tb_data run experience query @s levels',
  'scoreboard players set $candidate tb_data 0',
];
for (const enchantment of enchantments) {
  tableLines.push(
    `execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."${enchantment.id}" run function toybox:advanced_enchant/check/${enchantment.slug}`,
  );
}
tableLines.push(
  'execute if score $candidate tb_data matches 0 run tellraw @s {"translate":"message.toybox.advanced_enchant.unsupported","fallback":"[Toybox] That enchantment has no advanced tier in this pack.","color":"red"}',
);
write('data/toybox/function/advanced_enchant/table.mcfunction', lines(tableLines));

const generatedConsumeLevels = new Set();
for (const enchantment of enchantments) {
  const checkLines = [
    'scoreboard players set $candidate tb_data 1',
    'scoreboard players set $book_level tb_data -1',
    'scoreboard players set $item_level tb_data -1',
    'scoreboard players set $valid tb_data 0',
    `execute store result score $book_level tb_data run data get entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."${enchantment.id}"`,
    `execute store result score $item_level tb_data run data get entity @s SelectedItem.components."minecraft:enchantments"."${enchantment.id}"`,
    `execute if score $book_level tb_data = $item_level tb_data if score $item_level tb_data matches ${enchantment.base}..${enchantment.max - 1} run scoreboard players set $valid tb_data 1`,
    'execute if score $valid tb_data matches 0 run tellraw @s {"translate":"message.toybox.advanced_enchant.level_mismatch","fallback":"[Toybox] The item and book must have the same level, starting at the enchantment’s vanilla maximum.","color":"red"}',
  ];
  for (let current = enchantment.base; current < enchantment.max; current++) {
    checkLines.push(
      `execute if score $valid tb_data matches 1 if score $item_level tb_data matches ${current} run function toybox:advanced_enchant/try/${enchantment.slug}/${current + 1}`,
    );
  }
  write(`data/toybox/function/advanced_enchant/check/${enchantment.slug}.mcfunction`, lines(checkLines));

  for (let result = enchantment.base + 1; result <= enchantment.max; result++) {
    const shelfRequirement =
      result <= 5 ? 15 :
      result === 6 ? 24 :
      result === 7 ? 32 :
      result === 8 ? 40 :
      result === 9 ? 48 : 60;
    const xp = 4 + 2 * result;
    const lapis = Math.ceil(result / 2);
    const amethyst = Math.max(0, result - 5);
    write(
      `data/toybox/function/advanced_enchant/try/${enchantment.slug}/${result}.mcfunction`,
      lines(
        `scoreboard players set $result_level tb_data ${result}`,
        'scoreboard players set $reason tb_data 0',
        `execute unless score $shelves tb_data matches ${shelfRequirement}.. run scoreboard players set $reason tb_data 1`,
        `execute if score $reason tb_data matches 0 unless score $player_levels tb_data matches ${xp}.. run scoreboard players set $reason tb_data 2`,
        `execute if score $reason tb_data matches 0 unless score $lapis tb_data matches ${lapis}.. run scoreboard players set $reason tb_data 3`,
        `execute if score $reason tb_data matches 0 unless score $amethyst tb_data matches ${amethyst}.. run scoreboard players set $reason tb_data 4`,
        'execute if score $reason tb_data matches 1 run tellraw @s [{"translate":"message.toybox.advanced_enchant.need_shelves","fallback":"[Toybox] Not enough active fixed-slot bookshelves. Active: %s","color":"red","with":[{"score":{"name":"$shelves","objective":"tb_data"}}]}]',
        `execute if score $reason tb_data matches 2 run tellraw @s {"translate":"message.toybox.advanced_enchant.need_xp","fallback":"[Toybox] Not enough experience levels for this tier.","color":"red"}`,
        `execute if score $reason tb_data matches 3 run tellraw @s {"translate":"message.toybox.advanced_enchant.need_lapis","fallback":"[Toybox] Not enough lapis lazuli for this tier.","color":"red"}`,
        `execute if score $reason tb_data matches 4 run tellraw @s {"translate":"message.toybox.advanced_enchant.need_amethyst","fallback":"[Toybox] Not enough amethyst shards for this tier.","color":"red"}`,
        `execute if score $reason tb_data matches 0 run function toybox:advanced_enchant/apply/${enchantment.slug}/${result}`,
      ),
    );
    write(
      `data/toybox/function/advanced_enchant/apply/${enchantment.slug}/${result}.mcfunction`,
      lines(
        'scoreboard players set $applied tb_data 0',
        `execute store success score $applied tb_data run item modify entity @s weapon.mainhand toybox:advanced_enchant/${enchantment.slug}/${result}`,
        `execute if score $applied tb_data matches 1 run function toybox:advanced_enchant/consume/${result}`,
        'execute unless score $applied tb_data matches 1 run tellraw @s {"translate":"message.toybox.advanced_enchant.apply_failed","fallback":"[Toybox] The item could not be upgraded; nothing was consumed.","color":"red"}',
      ),
    );
    writeJson(`data/toybox/item_modifier/advanced_enchant/${enchantment.slug}/${result}.json`, {
      function: 'minecraft:set_enchantments',
      enchantments: { [enchantment.id]: result },
      add: false,
    });

    if (!generatedConsumeLevels.has(result)) {
      generatedConsumeLevels.add(result);
      const consumeLines = [
        'item replace entity @s weapon.offhand with air',
        `clear @s minecraft:lapis_lazuli ${lapis}`,
      ];
      if (amethyst > 0) consumeLines.push(`clear @s minecraft:amethyst_shard ${amethyst}`);
      consumeLines.push(
        `experience add @s -${xp} levels`,
        'tellraw @s [{"translate":"message.toybox.advanced_enchant.success","fallback":"[Toybox] Advanced enchantment complete: level %s.","color":"aqua","with":[{"score":{"name":"$result_level","objective":"tb_data"}}]}]',
      );
      write(`data/toybox/function/advanced_enchant/consume/${result}.mcfunction`, lines(consumeLines));
    }
  }
}

// ---------------------------------------------------------------------------
// Potion synthesis and higher potion caps
// ---------------------------------------------------------------------------

const potionMap = {
  'minecraft:water': [],
  'minecraft:mundane': [],
  'minecraft:thick': [],
  'minecraft:awkward': [],
  'minecraft:night_vision': [{ id: 'minecraft:night_vision', duration: 3600, amplifier: 0 }],
  'minecraft:long_night_vision': [{ id: 'minecraft:night_vision', duration: 9600, amplifier: 0 }],
  'minecraft:invisibility': [{ id: 'minecraft:invisibility', duration: 3600, amplifier: 0 }],
  'minecraft:long_invisibility': [{ id: 'minecraft:invisibility', duration: 9600, amplifier: 0 }],
  'minecraft:leaping': [{ id: 'minecraft:jump_boost', duration: 3600, amplifier: 0 }],
  'minecraft:long_leaping': [{ id: 'minecraft:jump_boost', duration: 9600, amplifier: 0 }],
  'minecraft:strong_leaping': [{ id: 'minecraft:jump_boost', duration: 1800, amplifier: 1 }],
  'minecraft:fire_resistance': [{ id: 'minecraft:fire_resistance', duration: 3600, amplifier: 0 }],
  'minecraft:long_fire_resistance': [{ id: 'minecraft:fire_resistance', duration: 9600, amplifier: 0 }],
  'minecraft:swiftness': [{ id: 'minecraft:speed', duration: 3600, amplifier: 0 }],
  'minecraft:long_swiftness': [{ id: 'minecraft:speed', duration: 9600, amplifier: 0 }],
  'minecraft:strong_swiftness': [{ id: 'minecraft:speed', duration: 1800, amplifier: 1 }],
  'minecraft:slowness': [{ id: 'minecraft:slowness', duration: 1800, amplifier: 0 }],
  'minecraft:long_slowness': [{ id: 'minecraft:slowness', duration: 4800, amplifier: 0 }],
  'minecraft:strong_slowness': [{ id: 'minecraft:slowness', duration: 400, amplifier: 3 }],
  'minecraft:turtle_master': [
    { id: 'minecraft:slowness', duration: 400, amplifier: 3 },
    { id: 'minecraft:resistance', duration: 400, amplifier: 2 },
  ],
  'minecraft:long_turtle_master': [
    { id: 'minecraft:slowness', duration: 800, amplifier: 3 },
    { id: 'minecraft:resistance', duration: 800, amplifier: 2 },
  ],
  'minecraft:strong_turtle_master': [
    { id: 'minecraft:slowness', duration: 400, amplifier: 5 },
    { id: 'minecraft:resistance', duration: 400, amplifier: 3 },
  ],
  'minecraft:water_breathing': [{ id: 'minecraft:water_breathing', duration: 3600, amplifier: 0 }],
  'minecraft:long_water_breathing': [{ id: 'minecraft:water_breathing', duration: 9600, amplifier: 0 }],
  'minecraft:healing': [{ id: 'minecraft:instant_health', duration: 1, amplifier: 0 }],
  'minecraft:strong_healing': [{ id: 'minecraft:instant_health', duration: 1, amplifier: 1 }],
  'minecraft:harming': [{ id: 'minecraft:instant_damage', duration: 1, amplifier: 0 }],
  'minecraft:strong_harming': [{ id: 'minecraft:instant_damage', duration: 1, amplifier: 1 }],
  'minecraft:poison': [{ id: 'minecraft:poison', duration: 900, amplifier: 0 }],
  'minecraft:long_poison': [{ id: 'minecraft:poison', duration: 1800, amplifier: 0 }],
  'minecraft:strong_poison': [{ id: 'minecraft:poison', duration: 432, amplifier: 1 }],
  'minecraft:regeneration': [{ id: 'minecraft:regeneration', duration: 900, amplifier: 0 }],
  'minecraft:long_regeneration': [{ id: 'minecraft:regeneration', duration: 1800, amplifier: 0 }],
  'minecraft:strong_regeneration': [{ id: 'minecraft:regeneration', duration: 450, amplifier: 1 }],
  'minecraft:strength': [{ id: 'minecraft:strength', duration: 3600, amplifier: 0 }],
  'minecraft:long_strength': [{ id: 'minecraft:strength', duration: 9600, amplifier: 0 }],
  'minecraft:strong_strength': [{ id: 'minecraft:strength', duration: 1800, amplifier: 1 }],
  'minecraft:weakness': [{ id: 'minecraft:weakness', duration: 1800, amplifier: 0 }],
  'minecraft:long_weakness': [{ id: 'minecraft:weakness', duration: 4800, amplifier: 0 }],
  'minecraft:luck': [{ id: 'minecraft:luck', duration: 6000, amplifier: 0 }],
  'minecraft:slow_falling': [{ id: 'minecraft:slow_falling', duration: 1800, amplifier: 0 }],
  'minecraft:long_slow_falling': [{ id: 'minecraft:slow_falling', duration: 4800, amplifier: 0 }],
  'minecraft:wind_charged': [{ id: 'minecraft:wind_charged', duration: 3600, amplifier: 0 }],
  'minecraft:weaving': [{ id: 'minecraft:weaving', duration: 3600, amplifier: 0 }],
  'minecraft:oozing': [{ id: 'minecraft:oozing', duration: 3600, amplifier: 0 }],
  'minecraft:infested': [{ id: 'minecraft:infested', duration: 3600, amplifier: 0 }],
};

const effects = [
  'minecraft:absorption',
  'minecraft:bad_omen',
  'minecraft:blindness',
  'minecraft:breath_of_the_nautilus',
  'minecraft:conduit_power',
  'minecraft:darkness',
  'minecraft:dolphins_grace',
  'minecraft:fire_resistance',
  'minecraft:glowing',
  'minecraft:haste',
  'minecraft:health_boost',
  'minecraft:hero_of_the_village',
  'minecraft:hunger',
  'minecraft:infested',
  'minecraft:instant_damage',
  'minecraft:instant_health',
  'minecraft:invisibility',
  'minecraft:jump_boost',
  'minecraft:levitation',
  'minecraft:luck',
  'minecraft:mining_fatigue',
  'minecraft:nausea',
  'minecraft:night_vision',
  'minecraft:oozing',
  'minecraft:poison',
  'minecraft:raid_omen',
  'minecraft:regeneration',
  'minecraft:resistance',
  'minecraft:saturation',
  'minecraft:slow_falling',
  'minecraft:slowness',
  'minecraft:speed',
  'minecraft:strength',
  'minecraft:trial_omen',
  'minecraft:unluck',
  'minecraft:water_breathing',
  'minecraft:weakness',
  'minecraft:weaving',
  'minecraft:wind_charged',
  'minecraft:wither',
];

const effectSlug = (id) => id.slice('minecraft:'.length);
const effectPath = (side, id) => `alchemy.${side}_effects."${id}"`;
const nbtEffect = ({ id, duration, amplifier }) =>
  `{id:"${id}",duration:${duration},amplifier:${amplifier}}`;

write(
  'data/toybox/function/alchemy/interact.mcfunction',
  lines(
    '# Event-only entry point; all scratch data is created and removed synchronously.',
    'advancement revoke @s only toybox:interaction/brewing_stand',
    'execute if items entity @s weapon.mainhand #toybox:alchemy_bottles if items entity @s weapon.offhand #toybox:alchemy_bottles run function toybox:alchemy/prepare',
  ),
);

write(
  'data/toybox/function/alchemy/prepare.mcfunction',
  lines(
    'data remove storage toybox:scratch alchemy',
    'scoreboard players set $invalid tb_data 0',
    'scoreboard players set $reason tb_data 0',
    'scoreboard players set $main_form tb_data 0',
    'scoreboard players set $off_form tb_data 0',
    'execute if items entity @s weapon.mainhand minecraft:potion run scoreboard players set $main_form tb_data 1',
    'execute if items entity @s weapon.mainhand minecraft:splash_potion run scoreboard players set $main_form tb_data 2',
    'execute if items entity @s weapon.mainhand minecraft:lingering_potion run scoreboard players set $main_form tb_data 3',
    'execute if items entity @s weapon.offhand minecraft:potion run scoreboard players set $off_form tb_data 1',
    'execute if items entity @s weapon.offhand minecraft:splash_potion run scoreboard players set $off_form tb_data 2',
    'execute if items entity @s weapon.offhand minecraft:lingering_potion run scoreboard players set $off_form tb_data 3',
    'scoreboard players operation $result_form tb_data = $main_form tb_data',
    'scoreboard players operation $result_form tb_data > $off_form tb_data',
    'scoreboard players set $gunpowder_cost tb_data 0',
    'scoreboard players set $dragon_cost tb_data 0',
    'execute if score $result_form tb_data matches 2 if score $main_form tb_data matches 1 run scoreboard players set $gunpowder_cost tb_data 1',
    'execute if score $result_form tb_data matches 2 if score $off_form tb_data matches 1 run scoreboard players set $gunpowder_cost tb_data 1',
    'execute if score $result_form tb_data matches 3 if score $main_form tb_data matches ..2 run scoreboard players set $dragon_cost tb_data 1',
    'execute if score $result_form tb_data matches 3 if score $off_form tb_data matches ..2 run scoreboard players set $dragon_cost tb_data 1',
    'execute store result score $glowstone tb_data run clear @s minecraft:glowstone_dust 0',
    'execute store result score $redstone tb_data run clear @s minecraft:redstone 0',
    'execute store result score $amethyst tb_data run clear @s minecraft:amethyst_shard 0',
    'execute store result score $gunpowder tb_data run clear @s minecraft:gunpowder 0',
    'execute store result score $dragon tb_data run clear @s minecraft:dragon_breath 0',
    'execute store result score $player_levels tb_data run experience query @s levels',
    'data modify storage toybox:scratch alchemy.main set from entity @s SelectedItem',
    'data modify storage toybox:scratch alchemy.off set from entity @s Inventory[{Slot:-106b}]',
    'function toybox:alchemy/canonicalize/main',
    'execute if score $invalid tb_data matches 0 run function toybox:alchemy/canonicalize/off',
    'execute if score $invalid tb_data matches 0 if score $main_count tb_data matches 0 run scoreboard players set $invalid tb_data 1',
    'execute if score $invalid tb_data matches 0 if score $off_count tb_data matches 0 run scoreboard players set $invalid tb_data 1',
    'execute if score $invalid tb_data matches 1 if score $reason tb_data matches 0 run scoreboard players set $reason tb_data 1',
    'execute if score $invalid tb_data matches 0 run function toybox:alchemy/decide',
    'execute if score $reason tb_data matches 1 run tellraw @s {"translate":"message.toybox.alchemy.invalid","fallback":"[Toybox] Unsupported or unsafe potion data. Effects must be vanilla IDs, level I–V, 1–72000 ticks, with no hidden or duplicate effect.","color":"red"}',
    'execute if score $reason tb_data matches 2 run tellraw @s {"translate":"message.toybox.alchemy.choose_mode","fallback":"[Toybox] For one matching effect, carry glowstone only for potency or redstone only for duration.","color":"red"}',
    'execute if score $reason tb_data matches 3 run tellraw @s {"translate":"message.toybox.alchemy.overlap","fallback":"[Toybox] Multi-effect potions may be fused only when their effect IDs do not overlap.","color":"red"}',
    'execute if score $reason tb_data matches 4 run tellraw @s {"translate":"message.toybox.alchemy.too_many","fallback":"[Toybox] A mixed potion can contain at most five effects.","color":"red"}',
    'execute if score $reason tb_data matches 5 run tellraw @s {"translate":"message.toybox.alchemy.cost","fallback":"[Toybox] Missing experience or catalysts (amethyst, mode dust, or bottle-promotion reagent).","color":"red"}',
    'execute if score $reason tb_data matches 6 run tellraw @s {"translate":"message.toybox.alchemy.apply_failed","fallback":"[Toybox] The result bottle could not be created; nothing else was consumed.","color":"red"}',
    'data remove storage toybox:scratch alchemy',
  ),
);

for (const side of ['main', 'off']) {
  write(
    `data/toybox/function/alchemy/canonicalize/${side}.mcfunction`,
    lines(
      `data modify storage toybox:scratch alchemy.${side}_effects set value {}`,
      `scoreboard players set $${side}_count tb_data 0`,
      `scoreboard players set $${side}_high tb_data 0`,
      `scoreboard players set $input_side tb_data ${side === 'main' ? 1 : 2}`,
      `data modify storage toybox:scratch alchemy.input set from storage toybox:scratch alchemy.${side}`,
      'data modify storage toybox:scratch alchemy.queue set value []',
      'function toybox:alchemy/canonicalize/base',
    ),
  );
}

const baseLines = [
  'scoreboard players set $base_known tb_data 0',
  'execute unless data storage toybox:scratch alchemy.input.components."minecraft:potion_contents".potion run scoreboard players set $base_known tb_data 1',
];
for (const [potion, mappedEffects] of Object.entries(potionMap)) {
  const condition = `if data storage toybox:scratch alchemy.input.components."minecraft:potion_contents"{potion:"${potion}"}`;
  baseLines.push(`execute ${condition} run scoreboard players set $base_known tb_data 1`);
  for (const effect of mappedEffects) {
    baseLines.push(
      `execute ${condition} run data modify storage toybox:scratch alchemy.queue append value ${nbtEffect(effect)}`,
    );
  }
}
baseLines.push(
  'execute unless score $base_known tb_data matches 1 run scoreboard players set $invalid tb_data 1',
  'execute unless score $base_known tb_data matches 1 run scoreboard players set $reason tb_data 1',
  'execute if score $invalid tb_data matches 0 run data modify storage toybox:scratch alchemy.queue append from storage toybox:scratch alchemy.input.components."minecraft:potion_contents".custom_effects[]',
  'execute if score $invalid tb_data matches 0 run function toybox:alchemy/canonicalize/queue',
);
write('data/toybox/function/alchemy/canonicalize/base.mcfunction', lines(baseLines));

write(
  'data/toybox/function/alchemy/canonicalize/queue.mcfunction',
  lines(
    'execute if score $invalid tb_data matches 0 if data storage toybox:scratch alchemy.queue[0] run function toybox:alchemy/canonicalize/step',
  ),
);

write(
  'data/toybox/function/alchemy/canonicalize/step.mcfunction',
  lines(
    'data modify storage toybox:scratch alchemy.current set from storage toybox:scratch alchemy.queue[0]',
    'data remove storage toybox:scratch alchemy.queue[0]',
    'execute unless data storage toybox:scratch alchemy.current.amplifier run data modify storage toybox:scratch alchemy.current.amplifier set value 0',
    'execute unless data storage toybox:scratch alchemy.current.duration run data modify storage toybox:scratch alchemy.current.duration set value 1',
    'scoreboard players set $amp tb_data -999',
    'scoreboard players set $duration tb_data -999',
    'execute store result score $amp tb_data run data get storage toybox:scratch alchemy.current.amplifier',
    'execute store result score $duration tb_data run data get storage toybox:scratch alchemy.current.duration',
    'execute unless data storage toybox:scratch alchemy.current.id run scoreboard players set $invalid tb_data 1',
    'execute if data storage toybox:scratch alchemy.current.hidden_effect run scoreboard players set $invalid tb_data 1',
    'execute unless score $amp tb_data matches 0..4 run scoreboard players set $invalid tb_data 1',
    'execute unless score $duration tb_data matches 1..72000 run scoreboard players set $invalid tb_data 1',
    'execute if score $invalid tb_data matches 1 run scoreboard players set $reason tb_data 1',
    'execute if score $invalid tb_data matches 0 run function toybox:alchemy/canonicalize/dispatch',
    'execute if score $invalid tb_data matches 0 run function toybox:alchemy/canonicalize/queue',
  ),
);

const dispatchLines = ['scoreboard players set $recognized tb_data 0'];
for (const effect of effects) {
  dispatchLines.push(
    `execute if data storage toybox:scratch alchemy.current{id:"${effect}"} run function toybox:alchemy/canonicalize/effect/${effectSlug(effect)}`,
  );
}
dispatchLines.push(
  'execute unless score $recognized tb_data matches 1 run scoreboard players set $invalid tb_data 1',
  'execute unless score $recognized tb_data matches 1 run scoreboard players set $reason tb_data 1',
);
write('data/toybox/function/alchemy/canonicalize/dispatch.mcfunction', lines(dispatchLines));

for (const effect of effects) {
  const mainPath = effectPath('main', effect);
  const offPath = effectPath('off', effect);
  write(
    `data/toybox/function/alchemy/canonicalize/effect/${effectSlug(effect)}.mcfunction`,
    lines(
      'scoreboard players set $recognized tb_data 1',
      'scoreboard players set $duplicate tb_data 0',
      `execute if score $input_side tb_data matches 1 if data storage toybox:scratch ${mainPath} run scoreboard players set $duplicate tb_data 1`,
      `execute if score $input_side tb_data matches 2 if data storage toybox:scratch ${offPath} run scoreboard players set $duplicate tb_data 1`,
      'execute if score $duplicate tb_data matches 1 run scoreboard players set $invalid tb_data 1',
      'execute if score $duplicate tb_data matches 1 run scoreboard players set $reason tb_data 1',
      `execute if score $duplicate tb_data matches 0 if score $input_side tb_data matches 1 run data modify storage toybox:scratch ${mainPath} set from storage toybox:scratch alchemy.current`,
      `execute if score $duplicate tb_data matches 0 if score $input_side tb_data matches 2 run data modify storage toybox:scratch ${offPath} set from storage toybox:scratch alchemy.current`,
      'execute if score $duplicate tb_data matches 0 if score $input_side tb_data matches 1 run scoreboard players add $main_count tb_data 1',
      'execute if score $duplicate tb_data matches 0 if score $input_side tb_data matches 2 run scoreboard players add $off_count tb_data 1',
      'execute if score $duplicate tb_data matches 0 if score $amp tb_data matches 2.. if score $input_side tb_data matches 1 run scoreboard players add $main_high tb_data 1',
      'execute if score $duplicate tb_data matches 0 if score $amp tb_data matches 2.. if score $input_side tb_data matches 2 run scoreboard players add $off_high tb_data 1',
    ),
  );
}

const decideLines = [
  'scoreboard players set $overlap tb_data 0',
  ...effects.map(
    (effect) =>
      `execute if data storage toybox:scratch ${effectPath('main', effect)} if data storage toybox:scratch ${effectPath('off', effect)} run scoreboard players add $overlap tb_data 1`,
  ),
  'scoreboard players operation $total_effects tb_data = $main_count tb_data',
  'scoreboard players operation $total_effects tb_data += $off_count tb_data',
  'execute if score $overlap tb_data matches 0 if score $total_effects tb_data matches 1..5 run function toybox:alchemy/union/start',
  'execute if score $overlap tb_data matches 0 if score $total_effects tb_data matches 6.. run scoreboard players set $reason tb_data 4',
  'execute if score $overlap tb_data matches 1 if score $main_count tb_data matches 1 if score $off_count tb_data matches 1 run function toybox:alchemy/same/start',
  'execute if score $overlap tb_data matches 1 unless score $main_count tb_data matches 1 run scoreboard players set $reason tb_data 3',
  'execute if score $overlap tb_data matches 1 unless score $off_count tb_data matches 1 run scoreboard players set $reason tb_data 3',
  'execute if score $overlap tb_data matches 2.. run scoreboard players set $reason tb_data 3',
];
write('data/toybox/function/alchemy/decide.mcfunction', lines(decideLines));

write(
  'data/toybox/function/alchemy/same/start.mcfunction',
  lines(
    'scoreboard players set $mode tb_data 0',
    'scoreboard players set $merge_ok tb_data 0',
    'execute if score $glowstone tb_data matches 1.. if score $redstone tb_data matches 0 run scoreboard players set $mode tb_data 1',
    'execute if score $redstone tb_data matches 1.. if score $glowstone tb_data matches 0 run scoreboard players set $mode tb_data 2',
    'execute if score $mode tb_data matches 0 run scoreboard players set $reason tb_data 2',
    ...effects.map(
      (effect) =>
        `execute if score $mode tb_data matches 1..2 if data storage toybox:scratch ${effectPath('main', effect)} if data storage toybox:scratch ${effectPath('off', effect)} run function toybox:alchemy/merge/${effectSlug(effect)}`,
    ),
    'execute if score $mode tb_data matches 1..2 if score $merge_ok tb_data matches 0 run scoreboard players set $reason tb_data 3',
    'execute if score $merge_ok tb_data matches 1 run function toybox:alchemy/same/after_merge',
  ),
);

for (const effect of effects) {
  const instant = effect === 'minecraft:instant_damage' || effect === 'minecraft:instant_health';
  write(
    `data/toybox/function/alchemy/merge/${effectSlug(effect)}.mcfunction`,
    lines(
      `data modify storage toybox:scratch alchemy.a set from storage toybox:scratch ${effectPath('main', effect)}`,
      `data modify storage toybox:scratch alchemy.b set from storage toybox:scratch ${effectPath('off', effect)}`,
      `function toybox:alchemy/merge/${instant ? 'instant' : 'timed'}`,
    ),
  );
}

const mergeSetup = [
  'scoreboard players set $a_amp tb_data -999',
  'scoreboard players set $b_amp tb_data -999',
  'scoreboard players set $a_duration tb_data -999',
  'scoreboard players set $b_duration tb_data -999',
  'execute store result score $a_amp tb_data run data get storage toybox:scratch alchemy.a.amplifier',
  'execute store result score $b_amp tb_data run data get storage toybox:scratch alchemy.b.amplifier',
  'execute store result score $a_duration tb_data run data get storage toybox:scratch alchemy.a.duration',
  'execute store result score $b_duration tb_data run data get storage toybox:scratch alchemy.b.duration',
  'scoreboard players set $minus_one tb_data -1',
  'scoreboard players operation $diff tb_data = $a_amp tb_data',
  'scoreboard players operation $diff tb_data -= $b_amp tb_data',
  'execute if score $diff tb_data matches ..-1 run scoreboard players operation $diff tb_data *= $minus_one tb_data',
  'data modify storage toybox:scratch alchemy.merged set from storage toybox:scratch alchemy.a',
];

write(
  'data/toybox/function/alchemy/merge/timed.mcfunction',
  lines(
    mergeSetup,
    'execute if score $mode tb_data matches 1 if score $a_amp tb_data = $b_amp tb_data if score $a_amp tb_data matches 0..3 run scoreboard players set $merge_ok tb_data 1',
    'execute if score $mode tb_data matches 1 if score $merge_ok tb_data matches 1 run scoreboard players operation $result_amp tb_data = $a_amp tb_data',
    'execute if score $mode tb_data matches 1 if score $merge_ok tb_data matches 1 run scoreboard players add $result_amp tb_data 1',
    'execute if score $mode tb_data matches 1 if score $merge_ok tb_data matches 1 run scoreboard players operation $result_duration tb_data = $a_duration tb_data',
    'execute if score $mode tb_data matches 1 if score $merge_ok tb_data matches 1 run scoreboard players operation $result_duration tb_data < $b_duration tb_data',
    'execute if score $mode tb_data matches 1 if score $merge_ok tb_data matches 1 run scoreboard players set $three tb_data 3',
    'execute if score $mode tb_data matches 1 if score $merge_ok tb_data matches 1 run scoreboard players set $four tb_data 4',
    'execute if score $mode tb_data matches 1 if score $merge_ok tb_data matches 1 run scoreboard players operation $result_duration tb_data *= $three tb_data',
    'execute if score $mode tb_data matches 1 if score $merge_ok tb_data matches 1 run scoreboard players operation $result_duration tb_data /= $four tb_data',
    'execute if score $mode tb_data matches 1 if score $merge_ok tb_data matches 1 if score $result_duration tb_data matches ..0 run scoreboard players set $result_duration tb_data 1',
    'execute if score $mode tb_data matches 2 if score $diff tb_data matches 0..1 run scoreboard players set $merge_ok tb_data 1',
    'execute if score $mode tb_data matches 2 if score $merge_ok tb_data matches 1 run scoreboard players operation $result_amp tb_data = $a_amp tb_data',
    'execute if score $mode tb_data matches 2 if score $merge_ok tb_data matches 1 run scoreboard players operation $result_amp tb_data < $b_amp tb_data',
    'execute if score $mode tb_data matches 2 if score $merge_ok tb_data matches 1 run scoreboard players operation $result_duration tb_data = $a_duration tb_data',
    'execute if score $mode tb_data matches 2 if score $merge_ok tb_data matches 1 run scoreboard players operation $result_duration tb_data += $b_duration tb_data',
    'execute if score $mode tb_data matches 2 if score $merge_ok tb_data matches 1 if score $result_duration tb_data matches 72001.. run scoreboard players set $result_duration tb_data 72000',
    'execute if score $merge_ok tb_data matches 1 store result storage toybox:scratch alchemy.merged.amplifier int 1 run scoreboard players get $result_amp tb_data',
    'execute if score $merge_ok tb_data matches 1 store result storage toybox:scratch alchemy.merged.duration int 1 run scoreboard players get $result_duration tb_data',
  ),
);

write(
  'data/toybox/function/alchemy/merge/instant.mcfunction',
  lines(
    mergeSetup,
    'execute if score $mode tb_data matches 1 if score $a_amp tb_data = $b_amp tb_data if score $a_amp tb_data matches 0..3 run scoreboard players set $merge_ok tb_data 1',
    'execute if score $merge_ok tb_data matches 1 run scoreboard players operation $result_amp tb_data = $a_amp tb_data',
    'execute if score $merge_ok tb_data matches 1 run scoreboard players add $result_amp tb_data 1',
    'execute if score $merge_ok tb_data matches 1 run scoreboard players set $result_duration tb_data 1',
    'execute if score $merge_ok tb_data matches 1 store result storage toybox:scratch alchemy.merged.amplifier int 1 run scoreboard players get $result_amp tb_data',
    'execute if score $merge_ok tb_data matches 1 store result storage toybox:scratch alchemy.merged.duration int 1 run scoreboard players get $result_duration tb_data',
  ),
);

write(
  'data/toybox/function/alchemy/cost/add_current.mcfunction',
  lines(
    'scoreboard players set $cost_amp tb_data 0',
    'scoreboard players set $cost_duration tb_data 1',
    'execute store result score $cost_amp tb_data run data get storage toybox:scratch alchemy.current.amplifier',
    'execute store result score $cost_duration tb_data run data get storage toybox:scratch alchemy.current.duration',
    'scoreboard players add $cost_amp tb_data 1',
    'scoreboard players operation $cost_term tb_data = $cost_amp tb_data',
    'scoreboard players operation $cost_term tb_data *= $cost_amp tb_data',
    'scoreboard players operation $duration_units tb_data = $cost_duration tb_data',
    'scoreboard players set $twelve_hundred tb_data 1200',
    'scoreboard players operation $duration_units tb_data /= $twelve_hundred tb_data',
    'execute if score $duration_units tb_data matches ..0 run scoreboard players set $duration_units tb_data 1',
    'scoreboard players operation $cost_term tb_data *= $duration_units tb_data',
    'scoreboard players operation $potion_score tb_data += $cost_term tb_data',
  ),
);

const xpLines = [
  'scoreboard players set $four tb_data 4',
  'scoreboard players operation $four_score tb_data = $potion_score tb_data',
  'scoreboard players operation $four_score tb_data *= $four tb_data',
  'scoreboard players set $xp_cost tb_data 3',
];
for (let k = 1; k <= 174; k++) {
  const threshold = (k - 1) ** 2 + 1;
  xpLines.push(
    `execute if score $four_score tb_data matches ${threshold}.. run scoreboard players add $xp_cost tb_data 1`,
  );
}
write('data/toybox/function/alchemy/cost/calculate_xp.mcfunction', lines(xpLines));

write(
  'data/toybox/function/alchemy/result/append_current.mcfunction',
  lines(
    'data modify storage toybox:scratch alchemy.result_effects append from storage toybox:scratch alchemy.current',
    'function toybox:alchemy/cost/add_current',
  ),
);

const unionBuild = [
  'data modify storage toybox:scratch alchemy.result_effects set value []',
  'scoreboard players set $potion_score tb_data 0',
];
for (const effect of effects) {
  unionBuild.push(
    `execute if data storage toybox:scratch ${effectPath('main', effect)} run data modify storage toybox:scratch alchemy.current set from storage toybox:scratch ${effectPath('main', effect)}`,
    `execute if data storage toybox:scratch ${effectPath('main', effect)} run function toybox:alchemy/result/append_current`,
    `execute if data storage toybox:scratch ${effectPath('off', effect)} run data modify storage toybox:scratch alchemy.current set from storage toybox:scratch ${effectPath('off', effect)}`,
    `execute if data storage toybox:scratch ${effectPath('off', effect)} run function toybox:alchemy/result/append_current`,
  );
}
unionBuild.push('function toybox:alchemy/cost/calculate_xp');
write('data/toybox/function/alchemy/union/build.mcfunction', lines(unionBuild));

write(
  'data/toybox/function/alchemy/union/start.mcfunction',
  lines(
    'scoreboard players set $mode tb_data 3',
    'scoreboard players set $glowstone_cost tb_data 0',
    'scoreboard players set $redstone_cost tb_data 0',
    'scoreboard players operation $amethyst_cost tb_data = $total_effects tb_data',
    'scoreboard players operation $amethyst_cost tb_data += $main_high tb_data',
    'scoreboard players operation $amethyst_cost tb_data += $off_high tb_data',
    'function toybox:alchemy/union/build',
    'function toybox:alchemy/finalize',
  ),
);

write(
  'data/toybox/function/alchemy/same/after_merge.mcfunction',
  lines(
    'data modify storage toybox:scratch alchemy.result_effects set value []',
    'data modify storage toybox:scratch alchemy.current set from storage toybox:scratch alchemy.merged',
    'scoreboard players set $potion_score tb_data 0',
    'function toybox:alchemy/result/append_current',
    'scoreboard players set $amethyst_cost tb_data 1',
    'execute if score $result_amp tb_data matches 2.. run scoreboard players add $amethyst_cost tb_data 1',
    'scoreboard players set $glowstone_cost tb_data 0',
    'scoreboard players set $redstone_cost tb_data 0',
    'execute if score $mode tb_data matches 1 run scoreboard players operation $glowstone_cost tb_data = $result_amp tb_data',
    'execute if score $mode tb_data matches 1 if score $glowstone_cost tb_data matches ..0 run scoreboard players set $glowstone_cost tb_data 1',
    'execute if score $mode tb_data matches 2 run scoreboard players operation $redstone_cost tb_data = $result_duration tb_data',
    'execute if score $mode tb_data matches 2 run scoreboard players add $redstone_cost tb_data 17999',
    'scoreboard players set $eighteen_thousand tb_data 18000',
    'execute if score $mode tb_data matches 2 run scoreboard players operation $redstone_cost tb_data /= $eighteen_thousand tb_data',
    'execute if score $redstone_cost tb_data matches 5.. run scoreboard players set $redstone_cost tb_data 4',
    'function toybox:alchemy/cost/calculate_xp',
    'function toybox:alchemy/finalize',
  ),
);

write(
  'data/toybox/function/alchemy/finalize.mcfunction',
  lines(
    'scoreboard players set $missing tb_data 0',
    'execute if score $amethyst_cost tb_data > $amethyst tb_data run scoreboard players set $missing tb_data 1',
    'execute if score $glowstone_cost tb_data > $glowstone tb_data run scoreboard players set $missing tb_data 1',
    'execute if score $redstone_cost tb_data > $redstone tb_data run scoreboard players set $missing tb_data 1',
    'execute if score $gunpowder_cost tb_data > $gunpowder tb_data run scoreboard players set $missing tb_data 1',
    'execute if score $dragon_cost tb_data > $dragon tb_data run scoreboard players set $missing tb_data 1',
    'execute if score $xp_cost tb_data > $player_levels tb_data run scoreboard players set $missing tb_data 1',
    'execute if score $missing tb_data matches 1 run scoreboard players set $reason tb_data 5',
    'execute if score $missing tb_data matches 0 run data modify storage toybox:scratch alchemy.output.contents set value {custom_color:9133302,custom_effects:[]}',
    'execute if score $missing tb_data matches 0 run data modify storage toybox:scratch alchemy.output.contents.custom_effects set from storage toybox:scratch alchemy.result_effects',
    'execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.amethyst int 1 run scoreboard players get $amethyst_cost tb_data',
    'execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.glowstone int 1 run scoreboard players get $glowstone_cost tb_data',
    'execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.redstone int 1 run scoreboard players get $redstone_cost tb_data',
    'execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.gunpowder int 1 run scoreboard players get $gunpowder_cost tb_data',
    'execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.dragon int 1 run scoreboard players get $dragon_cost tb_data',
    'execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.xp int 1 run scoreboard players get $xp_cost tb_data',
    'scoreboard players set $applied tb_data 0',
    'execute if score $missing tb_data matches 0 if score $result_form tb_data matches 1 run function toybox:alchemy/apply/potion with storage toybox:scratch alchemy.output',
    'execute if score $missing tb_data matches 0 if score $result_form tb_data matches 2 run function toybox:alchemy/apply/splash with storage toybox:scratch alchemy.output',
    'execute if score $missing tb_data matches 0 if score $result_form tb_data matches 3 run function toybox:alchemy/apply/lingering with storage toybox:scratch alchemy.output',
    'execute if score $missing tb_data matches 0 if score $applied tb_data matches 1 run function toybox:alchemy/consume with storage toybox:scratch alchemy.output',
    'execute if score $missing tb_data matches 0 unless score $applied tb_data matches 1 run scoreboard players set $reason tb_data 6',
  ),
);

const resultItem = (kind) =>
  `$execute store success score $applied tb_data run item replace entity @s weapon.mainhand with minecraft:${kind}[minecraft:potion_contents=$(contents),minecraft:custom_name={translate:"item.toybox.mixed_potion",fallback:"Mixed Potion",color:"light_purple",italic:false},minecraft:custom_data={toybox:{mixed_potion:true}}]`;
write('data/toybox/function/alchemy/apply/potion.mcfunction', resultItem('potion'));
write('data/toybox/function/alchemy/apply/splash.mcfunction', resultItem('splash_potion'));
write('data/toybox/function/alchemy/apply/lingering.mcfunction', resultItem('lingering_potion'));

const resultBlockItem = (kind) =>
  `$execute store success score $applied tb_data run item replace block 0 100 0 container.0 with minecraft:${kind}[minecraft:potion_contents=$(contents),minecraft:custom_name={translate:"item.toybox.mixed_potion",fallback:"Mixed Potion",color:"light_purple",italic:false},minecraft:custom_data={toybox:{mixed_potion:true}}]`;
write('data/toybox/function/alchemy/dev_apply/potion.mcfunction', resultBlockItem('potion'));
write('data/toybox/function/alchemy/dev_apply/splash.mcfunction', resultBlockItem('splash_potion'));
write('data/toybox/function/alchemy/dev_apply/lingering.mcfunction', resultBlockItem('lingering_potion'));

write(
  'data/toybox/function/alchemy/consume.mcfunction',
  lines(
    'item replace entity @s weapon.offhand with air',
    '$clear @s minecraft:amethyst_shard $(amethyst)',
    '$clear @s minecraft:glowstone_dust $(glowstone)',
    '$clear @s minecraft:redstone $(redstone)',
    '$clear @s minecraft:gunpowder $(gunpowder)',
    '$clear @s minecraft:dragon_breath $(dragon)',
    '$experience add @s -$(xp) levels',
    'execute if score $mode tb_data matches 1 run tellraw @s {"translate":"message.toybox.alchemy.success_potency","fallback":"[Toybox] Potency synthesis complete.","color":"light_purple"}',
    'execute if score $mode tb_data matches 2 run tellraw @s {"translate":"message.toybox.alchemy.success_duration","fallback":"[Toybox] Duration synthesis complete.","color":"light_purple"}',
    'execute if score $mode tb_data matches 3 run tellraw @s {"translate":"message.toybox.alchemy.success_union","fallback":"[Toybox] Multi-effect potion fusion complete.","color":"light_purple"}',
  ),
);

// ---------------------------------------------------------------------------
// Explicit live-client validation kit
// ---------------------------------------------------------------------------

const clientTestData = 'minecraft:custom_data={toybox:{client_test:1b}}';
const testName = (key, fallback, color = 'yellow', withValue = null) => {
  const withPart = withValue === null ? '' : `,with:["${withValue}"]`;
  return `minecraft:custom_name={translate:"${key}",fallback:"${fallback}"${withPart},color:"${color}",italic:false}`;
};
const testLore =
  'minecraft:lore=[{translate:"item.toybox.test.temporary_lore",fallback:"Temporary manual-test item; remove with /function toybox:dev/client_test_cleanup",color:"gray",italic:false}]';

write(
  'data/toybox/function/dev/client_test/build.mcfunction',
  lines(
    '# Explicit developer command. Builds in empty space eight blocks ahead without replacing occupied blocks.',
    'execute rotated ~ 0 positioned ^ ^ ^8 align xyz run function toybox:dev/client_test/build_here',
  ),
);

write(
  'data/toybox/function/dev/client_test/build_here.mcfunction',
  lines(
    '# Origin is the enchanting-table block. Every placement uses keep to avoid overwriting terrain.',
    'setblock ~ ~ ~ minecraft:enchanting_table keep',
    shelfSlots.map(([x, y, z]) => `setblock ~${x} ~${y} ~${z} minecraft:bookshelf keep`),
    'setblock ~ ~ ~-5 minecraft:brewing_stand keep',
    'function toybox:advanced_enchant/count_shelves',
    'scoreboard players operation $client_kit_shelves tb_gid = $shelves tb_data',
    'execute if entity @s[type=minecraft:player] run tellraw @s [{"translate":"message.toybox.dev.client_test.rig_ready","fallback":"[Toybox Test] Rig ready eight blocks ahead: %s/60 active shelves. Use a disposable open test world.","color":"aqua","with":[{"score":{"name":"$client_kit_shelves","objective":"tb_gid"}}]}]',
  ),
);

const sharpnessBooks = [
  [5, 'V'],
  [6, 'VI'],
  [7, 'VII'],
  [8, 'VIII'],
  [9, 'IX'],
];
const kitLines = [
  '# Test sword: Sharpness V -> X should preserve every non-target component below.',
  `give @s minecraft:diamond_sword[minecraft:enchantments={"minecraft:sharpness":5,"minecraft:unbreaking":3},minecraft:damage=37,minecraft:repair_cost=17,${testName('item.toybox.test.advanced_sword', '[TEST] Advanced Enchant Sword', 'aqua')},minecraft:lore=[{translate:"item.toybox.test.preserve_lore",fallback:"Name, lore, damage, repair cost, Unbreaking III, and test marker must survive.",color:"gray",italic:false}],minecraft:custom_data={toybox:{client_test:1b,preserve_test:1b}}] 1`,
  ...sharpnessBooks.map(
    ([level, roman]) =>
      `give @s minecraft:enchanted_book[minecraft:stored_enchantments={"minecraft:sharpness":${level}},${testName('item.toybox.test.sharpness_book', '[TEST] Sharpness %s Book', 'light_purple', roman)},${testLore},${clientTestData}] 1`,
  ),
  '# TEST A: equal Speed IV normal potions -> Speed V, 30,000 ticks.',
  ...Array.from({ length: 2 }, () =>
    `give @s minecraft:potion[minecraft:potion_contents={custom_effects:[{id:"minecraft:speed",amplifier:3,duration:40000}]},${testName('item.toybox.test.potency_potion', '[TEST A] Potency: Speed IV', 'light_purple')},${testLore},${clientTestData}] 1`,
  ),
  '# TEST B: Speed IV normal + splash -> splash Speed IV, capped at 72,000 ticks.',
  `give @s minecraft:potion[minecraft:potion_contents={custom_effects:[{id:"minecraft:speed",amplifier:3,duration:40000}]},${testName('item.toybox.test.duration_normal', '[TEST B] Duration: Normal Speed IV', 'dark_aqua')},${testLore},${clientTestData}] 1`,
  `give @s minecraft:splash_potion[minecraft:potion_contents={custom_effects:[{id:"minecraft:speed",amplifier:3,duration:40000}]},${testName('item.toybox.test.duration_splash', '[TEST B] Duration: Splash Speed IV', 'dark_aqua')},${testLore},${clientTestData}] 1`,
  '# TEST C: two effects + three disjoint effects -> lingering five-effect boundary.',
  `give @s minecraft:potion[minecraft:potion_contents={potion:"minecraft:night_vision",custom_effects:[{id:"minecraft:speed",amplifier:0,duration:1200}]},${testName('item.toybox.test.union_normal', '[TEST C] Union: Normal Two Effects', 'gold')},${testLore},${clientTestData}] 1`,
  `give @s minecraft:lingering_potion[minecraft:potion_contents={potion:"minecraft:strength",custom_effects:[{id:"minecraft:luck",amplifier:0,duration:1200},{id:"minecraft:fire_resistance",amplifier:0,duration:1200}]},${testName('item.toybox.test.union_lingering', '[TEST C] Union: Lingering Three Effects', 'gold')},${testLore},${clientTestData}] 1`,
];
kitLines.push(
  '# Exact positive-path budget: enchant 100 levels, potions 53+65+9 levels.',
  `give @s minecraft:lapis_lazuli[${testName('item.toybox.test.material', '[TEST] Exact-Budget Material', 'yellow')},${clientTestData}] 21`,
  `give @s minecraft:amethyst_shard[${testName('item.toybox.test.material', '[TEST] Exact-Budget Material', 'yellow')},${clientTestData}] 24`,
  `give @s minecraft:gunpowder[${testName('item.toybox.test.material', '[TEST] Exact-Budget Material', 'yellow')},${clientTestData}] 1`,
  `give @s minecraft:dragon_breath[${testName('item.toybox.test.material', '[TEST] Exact-Budget Material', 'yellow')},${clientTestData}] 1`,
  '# A disposable test world is required: the exact-budget check intentionally resets XP.',
  'experience set @s 0 levels',
  'experience set @s 0 points',
  'experience add @s 227 levels',
  'function toybox:dev/client_test/build',
  'function toybox:dev/client_test/help',
);
write('data/toybox/function/dev/client_test/kit.mcfunction', lines(kitLines));

write(
  'data/toybox/function/dev/client_test/potency_material.mcfunction',
  lines(
    '# Keep the two mutually exclusive mode dusts out of the inventory at the same time.',
    'clear @s minecraft:glowstone_dust[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:redstone[minecraft:custom_data~{toybox:{client_test:1b}}]',
    `give @s minecraft:glowstone_dust[${testName('item.toybox.test.material', '[TEST] Exact-Budget Material', 'yellow')},${clientTestData}] 4`,
    'tellraw @s {"translate":"message.toybox.dev.client_test.potency_ready","fallback":"[Toybox Test] Potency mode ready: exactly 4 tagged glowstone dust added. Carry no redstone.","color":"light_purple"}',
  ),
);

write(
  'data/toybox/function/dev/client_test/duration_material.mcfunction',
  lines(
    'clear @s minecraft:glowstone_dust[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:redstone[minecraft:custom_data~{toybox:{client_test:1b}}]',
    `give @s minecraft:redstone[${testName('item.toybox.test.material', '[TEST] Exact-Budget Material', 'yellow')},${clientTestData}] 4`,
    'tellraw @s {"translate":"message.toybox.dev.client_test.duration_ready","fallback":"[Toybox Test] Duration mode ready: exactly 4 tagged redstone dust added. Carry no glowstone.","color":"dark_aqua"}',
  ),
);

write(
  'data/toybox/function/dev/client_test/reject_inputs.mcfunction',
  lines(
    `give @s minecraft:potion[minecraft:potion_contents={potion:"minecraft:strong_turtle_master"},${testName('item.toybox.test.reject_turtle', '[TEST D] Reject: Strong Turtle Master', 'red')},${testLore},${clientTestData}] 1`,
    `give @s minecraft:potion[minecraft:potion_contents={potion:"minecraft:swiftness"},${testName('item.toybox.test.reject_partner', '[TEST D] Reject Partner', 'red')},${testLore},${clientTestData}] 1`,
    'tellraw @s {"translate":"message.toybox.dev.client_test.reject_ready","fallback":"[Toybox Test] Rejection pair added. It must fail without consuming bottles, materials, or XP.","color":"red"}',
  ),
);

write(
  'data/toybox/function/dev/client_test/help.mcfunction',
  lines(
    'tellraw @s {"translate":"message.toybox.dev.client_test.title","fallback":"[Toybox Test] Manual validation kit — use an empty inventory in a disposable world","color":"aqua","bold":true}',
    'tellraw @s {"translate":"message.toybox.dev.client_test.enchant","fallback":"1. Enchant: test sword in main hand + Sharpness V book off hand. Use V, VI, VII, VIII, IX books in order; before X remove one outer shelf to verify no-cost failure, restore it, then reach X.","color":"light_purple"}',
    'tellraw @s {"translate":"message.toybox.dev.client_test.preserve","fallback":"2. At X verify Unbreaking III, name, lore, 37 damage, repair cost 17, and the test marker all survived.","color":"aqua"}',
    'tellraw @s {"translate":"message.toybox.dev.client_test.potency","fallback":"3. Run /function toybox:dev/client_test_potency, then combine the two TEST A potions. Expect Speed V, 30,000 ticks; level 74 remains.","color":"light_purple"}',
    'tellraw @s {"translate":"message.toybox.dev.client_test.duration","fallback":"4. Run /function toybox:dev/client_test_duration, then combine the TEST B normal+splash pair. Expect splash Speed IV, 72,000 ticks; level 9 remains.","color":"dark_aqua"}',
    'tellraw @s {"translate":"message.toybox.dev.client_test.union","fallback":"5. Combine the TEST C normal two-effect + lingering three-effect pair. Expect a lingering five-effect potion, all exact-budget resources and levels at zero, then throw it.","color":"gold"}',
    'tellraw @s {"translate":"message.toybox.dev.client_test.reject","fallback":"6. Run /function toybox:dev/client_test_reject and combine the TEST D pair. Strong Turtle Master must fail with no consumption.","color":"red"}',
    'tellraw @s {"translate":"message.toybox.dev.client_test.cleanup_hint","fallback":"Cleanup: stand on the test enchanting table, then run /function toybox:dev/client_test_cleanup. Added XP and synthesized results are not removed or restored.","color":"gray"}',
  ),
);

write(
  'data/toybox/function/dev/client_test/cleanup.mcfunction',
  lines(
    'scoreboard players set $client_rig_found tb_gid 0',
    '# Entity-free cleanup: stand directly on the test enchanting table.',
    'execute at @s if block ~ ~-1 ~ minecraft:enchanting_table positioned ~ ~-1 ~ run function toybox:dev/client_test/cleanup_here',
    'execute at @s if score $client_rig_found tb_gid matches 0 if block ~ ~ ~ minecraft:enchanting_table positioned ~ ~ ~ run function toybox:dev/client_test/cleanup_here',
    'clear @s minecraft:diamond_sword[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:enchanted_book[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:potion[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:splash_potion[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:lingering_potion[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:lapis_lazuli[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:amethyst_shard[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:glowstone_dust[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:redstone[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:gunpowder[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'clear @s minecraft:dragon_breath[minecraft:custom_data~{toybox:{client_test:1b}}]',
    'execute if score $client_rig_found tb_gid matches 0 run tellraw @s {"translate":"message.toybox.dev.client_test.no_rig","fallback":"[Toybox Test] Stand directly on the test enchanting table and run cleanup again; tagged unused inputs were still removed.","color":"yellow"}',
    'execute if score $client_rig_found tb_gid matches 1 run tellraw @s {"translate":"message.toybox.dev.client_test.cleanup_done","fallback":"[Toybox Test] Rig under your feet and tagged unused inputs removed. Added XP and synthesized results were left alone.","color":"green"}',
  ),
);

write(
  'data/toybox/function/dev/client_test/cleanup_here.mcfunction',
  lines(
    'scoreboard players set $client_rig_found tb_gid 1',
    'execute if block ~ ~ ~ minecraft:enchanting_table run setblock ~ ~ ~ minecraft:air',
    shelfSlots.map(([x, y, z]) =>
      `execute if block ~${x} ~${y} ~${z} minecraft:bookshelf run setblock ~${x} ~${y} ~${z} minecraft:air`,
    ),
    'execute if block ~ ~ ~-5 minecraft:brewing_stand run setblock ~ ~ ~-5 minecraft:air',
  ),
);

for (const [alias, target] of [
  ['client_test_kit', 'kit'],
  ['client_test_help', 'help'],
  ['client_test_build', 'build'],
  ['client_test_potency', 'potency_material'],
  ['client_test_duration', 'duration_material'],
  ['client_test_reject', 'reject_inputs'],
  ['client_test_cleanup', 'cleanup'],
]) {
  write(`data/toybox/function/dev/${alias}.mcfunction`, `function toybox:dev/client_test/${target}`);
}

write(
  'data/toybox/function/dev/client_test_rig_smoke.mcfunction',
  lines(
    'execute in minecraft:overworld run forceload add 32 32',
    'execute in minecraft:overworld run fill 28 100 27 36 102 36 minecraft:air',
    'execute in minecraft:overworld positioned 32 100 32 run function toybox:dev/client_test/build_here',
    'scoreboard players set $client_rig_found tb_gid 0',
    'scoreboard players operation $smoke_client_rig_shelves tb_gid = $client_kit_shelves tb_gid',
    'execute unless score $smoke_client_rig_shelves tb_gid matches 60 run scoreboard players add $smoke_client_kit_fail tb_gid 1',
    'execute in minecraft:overworld unless block 32 100 32 minecraft:enchanting_table run scoreboard players add $smoke_client_kit_fail tb_gid 1',
    'execute in minecraft:overworld unless block 32 100 27 minecraft:brewing_stand run scoreboard players add $smoke_client_kit_fail tb_gid 1',
    'execute in minecraft:overworld positioned 32 100 32 run function toybox:dev/client_test/cleanup_here',
    'scoreboard players operation $smoke_client_cleanup_called tb_gid = $client_rig_found tb_gid',
    'execute in minecraft:overworld positioned 32 100 32 run function toybox:advanced_enchant/count_shelves',
    'scoreboard players operation $smoke_client_cleanup_shelves tb_gid = $shelves tb_data',
    'execute unless score $smoke_client_cleanup_shelves tb_gid matches 0 run scoreboard players add $smoke_client_kit_fail tb_gid 1',
    'execute in minecraft:overworld unless block 32 100 32 minecraft:air run scoreboard players add $smoke_client_kit_fail tb_gid 1',
    'execute in minecraft:overworld unless block 32 100 27 minecraft:air run scoreboard players add $smoke_client_kit_fail tb_gid 1',
    'execute in minecraft:overworld run forceload remove 32 32',
  ),
);

// ---------------------------------------------------------------------------
// Headless official-server assertions
// ---------------------------------------------------------------------------

write(
  'data/toybox/function/dev/advanced_enchant_smoke.mcfunction',
  lines(
    'execute in minecraft:overworld run forceload add 0 0',
    'execute in minecraft:overworld run setblock 0 100 0 minecraft:barrel',
    'execute in minecraft:overworld run item replace block 0 100 0 container.0 with minecraft:diamond_sword[minecraft:enchantments={"minecraft:sharpness":5,"minecraft:unbreaking":3},minecraft:repair_cost=17,minecraft:custom_data={toybox:{preserve_test:1b}}]',
    'execute in minecraft:overworld run item modify block 0 100 0 container.0 toybox:advanced_enchant/sharpness/6',
    'scoreboard players set $smoke_level tb_gid -1',
    'scoreboard players set $smoke_other_enchant tb_gid -1',
    'execute in minecraft:overworld store result score $smoke_level tb_gid run data get block 0 100 0 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:sharpness"',
    'execute in minecraft:overworld store result score $smoke_other_enchant tb_gid run data get block 0 100 0 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:unbreaking"',
    'execute unless score $smoke_level tb_gid matches 6 run scoreboard players add $smoke_adv_fail tb_gid 1',
    'execute unless score $smoke_other_enchant tb_gid matches 3 run scoreboard players add $smoke_adv_fail tb_gid 1',
    'scoreboard players set $smoke_adv_custom tb_gid 0',
    'scoreboard players set $smoke_adv_repair tb_gid 0',
    'execute in minecraft:overworld if data block 0 100 0 Items[{Slot:0b}].components."minecraft:custom_data"{toybox:{preserve_test:1b}} run scoreboard players set $smoke_adv_custom tb_gid 1',
    'execute in minecraft:overworld if data block 0 100 0 Items[{Slot:0b}].components."minecraft:repair_cost" run scoreboard players set $smoke_adv_repair tb_gid 1',
    'execute unless score $smoke_adv_custom tb_gid matches 1 run scoreboard players add $smoke_adv_fail tb_gid 1',
    'execute unless score $smoke_adv_repair tb_gid matches 1 run scoreboard players add $smoke_adv_fail tb_gid 1',
    'data modify storage toybox:scratch advanced_book set value {"minecraft:sharpness":5}',
    'scoreboard players set $smoke_count tb_gid 0',
    'execute store result score $smoke_count tb_gid run data get storage toybox:scratch advanced_book',
    'execute unless score $smoke_count tb_gid matches 1 run scoreboard players add $smoke_adv_fail tb_gid 1',
    'data remove storage toybox:scratch advanced_book',
    'execute in minecraft:overworld run setblock 0 100 0 minecraft:air',
    '# All 60 fixed shelf slots must count, and an opaque transmitter obstruction must reduce the count.',
    'execute in minecraft:overworld run fill -3 110 -3 3 111 3 minecraft:air',
    'execute in minecraft:overworld run setblock 0 110 0 minecraft:enchanting_table',
    shelfSlots.map(([x, y, z]) => `execute in minecraft:overworld run setblock ${x} ${110 + y} ${z} minecraft:bookshelf`),
    'execute in minecraft:overworld positioned 0 110 0 run function toybox:advanced_enchant/count_shelves',
    'scoreboard players operation $smoke_shelves tb_gid = $shelves tb_data',
    'execute unless score $smoke_shelves tb_gid matches 60 run scoreboard players add $smoke_adv_fail tb_gid 1',
    'execute in minecraft:overworld run setblock 1 110 0 minecraft:stone',
    'execute in minecraft:overworld positioned 0 110 0 run function toybox:advanced_enchant/count_shelves',
    'scoreboard players operation $smoke_blocked_shelves tb_gid = $shelves tb_data',
    'execute unless score $smoke_blocked_shelves tb_gid matches ..59 run scoreboard players add $smoke_adv_fail tb_gid 1',
    'execute in minecraft:overworld run fill -3 110 -3 3 111 3 minecraft:air',
    'execute in minecraft:overworld run forceload remove 0 0',
  ),
);

write(
  'data/toybox/function/dev/alchemy_smoke.mcfunction',
  lines(
    '# Built-in potion normalization and potency merge.',
    'data remove storage toybox:scratch alchemy',
    'scoreboard players set $invalid tb_data 0',
    'scoreboard players set $reason tb_data 0',
    'data modify storage toybox:scratch alchemy.main set value {components:{"minecraft:potion_contents":{potion:"minecraft:swiftness"}}}',
    'data modify storage toybox:scratch alchemy.off set value {components:{"minecraft:potion_contents":{potion:"minecraft:swiftness"}}}',
    'function toybox:alchemy/canonicalize/main',
    'function toybox:alchemy/canonicalize/off',
    'scoreboard players set $mode tb_data 1',
    'scoreboard players set $merge_ok tb_data 0',
    'function toybox:alchemy/merge/speed',
    'execute unless score $merge_ok tb_data matches 1 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    'scoreboard players set $smoke_amp tb_gid -1',
    'scoreboard players set $smoke_duration tb_gid -1',
    'execute store result score $smoke_amp tb_gid run data get storage toybox:scratch alchemy.merged.amplifier',
    'execute store result score $smoke_duration tb_gid run data get storage toybox:scratch alchemy.merged.duration',
    'scoreboard players operation $smoke_alchemy_builtin_amp tb_gid = $smoke_amp tb_gid',
    'scoreboard players operation $smoke_alchemy_builtin_duration tb_gid = $smoke_duration tb_gid',
    'execute unless score $smoke_amp tb_gid matches 1 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    'execute unless score $smoke_duration tb_gid matches 2700 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    '# Custom level IV inputs can reach V, and duration mode clamps at 72,000 ticks.',
    'scoreboard players set $invalid tb_data 0',
    'scoreboard players set $reason tb_data 0',
    'data modify storage toybox:scratch alchemy.main set value {components:{"minecraft:potion_contents":{custom_effects:[{id:"minecraft:speed",amplifier:3,duration:40000}]}}}',
    'data modify storage toybox:scratch alchemy.off set value {components:{"minecraft:potion_contents":{custom_effects:[{id:"minecraft:speed",amplifier:3,duration:40000}]}}}',
    'function toybox:alchemy/canonicalize/main',
    'function toybox:alchemy/canonicalize/off',
    'scoreboard players set $mode tb_data 1',
    'scoreboard players set $merge_ok tb_data 0',
    'function toybox:alchemy/merge/speed',
    'scoreboard players set $smoke_amp tb_gid -1',
    'execute store result score $smoke_amp tb_gid run data get storage toybox:scratch alchemy.merged.amplifier',
    'scoreboard players operation $smoke_alchemy_level tb_gid = $smoke_amp tb_gid',
    'execute unless score $smoke_amp tb_gid matches 4 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    'scoreboard players set $mode tb_data 2',
    'scoreboard players set $merge_ok tb_data 0',
    'function toybox:alchemy/merge/speed',
    'scoreboard players set $smoke_duration tb_gid -1',
    'execute store result score $smoke_duration tb_gid run data get storage toybox:scratch alchemy.merged.duration',
    'scoreboard players operation $smoke_alchemy_cap tb_gid = $smoke_duration tb_gid',
    'execute unless score $smoke_duration tb_gid matches 72000 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    '# The one official built-in VI effect must be rejected by the V input/output cap.',
    'scoreboard players set $invalid tb_data 0',
    'scoreboard players set $reason tb_data 0',
    'data modify storage toybox:scratch alchemy.main set value {components:{"minecraft:potion_contents":{potion:"minecraft:strong_turtle_master"}}}',
    'function toybox:alchemy/canonicalize/main',
    'scoreboard players operation $smoke_alchemy_reject tb_gid = $invalid tb_data',
    'execute unless score $invalid tb_data matches 1 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    '# Disjoint built-in effects must normalize and survive union construction.',
    'data remove storage toybox:scratch alchemy',
    'scoreboard players set $invalid tb_data 0',
    'scoreboard players set $reason tb_data 0',
    'data modify storage toybox:scratch alchemy.main set value {components:{"minecraft:potion_contents":{potion:"minecraft:night_vision"}}}',
    'data modify storage toybox:scratch alchemy.off set value {components:{"minecraft:potion_contents":{potion:"minecraft:strength"}}}',
    'function toybox:alchemy/canonicalize/main',
    'function toybox:alchemy/canonicalize/off',
    'scoreboard players set $total_effects tb_data 2',
    'function toybox:alchemy/union/build',
    'scoreboard players set $smoke_union_count tb_gid -1',
    'execute store result score $smoke_union_count tb_gid run data get storage toybox:scratch alchemy.result_effects',
    'execute unless score $smoke_union_count tb_gid matches 2 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    'execute unless data storage toybox:scratch alchemy.result_effects[{id:"minecraft:night_vision"}] run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    'execute unless data storage toybox:scratch alchemy.result_effects[{id:"minecraft:strength"}] run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    '# Six disjoint effects must be rejected before any result or cost is applied.',
    'data remove storage toybox:scratch alchemy',
    'scoreboard players set $invalid tb_data 0',
    'scoreboard players set $reason tb_data 0',
    'data modify storage toybox:scratch alchemy.main set value {components:{"minecraft:potion_contents":{custom_effects:[{id:"minecraft:speed",amplifier:0,duration:1200},{id:"minecraft:strength",amplifier:0,duration:1200},{id:"minecraft:haste",amplifier:0,duration:1200}]}}}',
    'data modify storage toybox:scratch alchemy.off set value {components:{"minecraft:potion_contents":{custom_effects:[{id:"minecraft:night_vision",amplifier:0,duration:1200},{id:"minecraft:luck",amplifier:0,duration:1200},{id:"minecraft:fire_resistance",amplifier:0,duration:1200}]}}}',
    'function toybox:alchemy/canonicalize/main',
    'function toybox:alchemy/canonicalize/off',
    'execute if score $invalid tb_data matches 0 run function toybox:alchemy/decide',
    'scoreboard players operation $smoke_six_reason tb_gid = $reason tb_data',
    'execute unless score $smoke_six_reason tb_gid matches 4 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    '# Execute all three dynamic result item commands, including the V/72,000 boundary.',
    'data remove storage toybox:scratch alchemy',
    'data modify storage toybox:scratch alchemy.output.contents set value {custom_color:9133302,custom_effects:[{id:"minecraft:speed",amplifier:4,duration:72000}]}',
    'execute in minecraft:overworld run forceload add 0 0',
    'execute in minecraft:overworld run setblock 0 100 0 minecraft:barrel',
    'scoreboard players set $smoke_alchemy_forms tb_gid 0',
    'execute in minecraft:overworld run function toybox:alchemy/dev_apply/potion with storage toybox:scratch alchemy.output',
    'execute in minecraft:overworld unless data block 0 100 0 Items[{Slot:0b,id:"minecraft:potion"}] run scoreboard players add $smoke_alchemy_forms tb_gid 1',
    'execute in minecraft:overworld run function toybox:alchemy/dev_apply/splash with storage toybox:scratch alchemy.output',
    'execute in minecraft:overworld unless data block 0 100 0 Items[{Slot:0b,id:"minecraft:splash_potion"}] run scoreboard players add $smoke_alchemy_forms tb_gid 1',
    'execute in minecraft:overworld run function toybox:alchemy/dev_apply/lingering with storage toybox:scratch alchemy.output',
    'execute in minecraft:overworld unless data block 0 100 0 Items[{Slot:0b,id:"minecraft:lingering_potion"}] run scoreboard players add $smoke_alchemy_forms tb_gid 1',
    'scoreboard players operation $smoke_alchemy_fail tb_gid += $smoke_alchemy_forms tb_gid',
    'scoreboard players set $smoke_amp tb_gid -1',
    'scoreboard players set $smoke_duration tb_gid -1',
    'execute in minecraft:overworld store result score $smoke_amp tb_gid run data get block 0 100 0 Items[{Slot:0b}].components."minecraft:potion_contents".custom_effects[0].amplifier',
    'execute in minecraft:overworld store result score $smoke_duration tb_gid run data get block 0 100 0 Items[{Slot:0b}].components."minecraft:potion_contents".custom_effects[0].duration',
    'scoreboard players operation $smoke_alchemy_item_amp tb_gid = $smoke_amp tb_gid',
    'scoreboard players operation $smoke_alchemy_item_duration tb_gid = $smoke_duration tb_gid',
    'execute unless score $smoke_amp tb_gid matches 4 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    'execute unless score $smoke_duration tb_gid matches 72000 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    'scoreboard players set $smoke_alchemy_marker tb_gid 0',
    'scoreboard players set $smoke_alchemy_name tb_gid 0',
    'execute in minecraft:overworld if data block 0 100 0 Items[{Slot:0b}].components."minecraft:custom_data"{toybox:{mixed_potion:true}} run scoreboard players set $smoke_alchemy_marker tb_gid 1',
    'execute in minecraft:overworld if data block 0 100 0 Items[{Slot:0b}].components."minecraft:custom_name" run scoreboard players set $smoke_alchemy_name tb_gid 1',
    'execute unless score $smoke_alchemy_marker tb_gid matches 1 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    'execute unless score $smoke_alchemy_name tb_gid matches 1 run scoreboard players add $smoke_alchemy_fail tb_gid 1',
    'execute in minecraft:overworld run setblock 0 100 0 minecraft:air',
    'execute in minecraft:overworld run forceload remove 0 0',
    'data remove storage toybox:scratch alchemy',
  ),
);

console.log(
  `Generated v0.4.0-rc2 gameplay: ${enchantments.length} advanced enchantments, ` +
  `${shelfSlots.length} shelf slots, ${Object.keys(potionMap).length} potion IDs, ${effects.length} effects.`,
);
