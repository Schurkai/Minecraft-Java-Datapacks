import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Realm_Toybox.generate_v090';

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDir, '..');
const projectRoot = path.resolve(root, '..');
const resourceRoot = path.join(projectRoot, 'Realm_Toybox_Resources');

function safePath(base, relative) {
  const target = path.resolve(base, relative);
  const boundary = base.endsWith(path.sep) ? base : base + path.sep;
  if (!target.startsWith(boundary)) throw new Error('Unsafe generated path: ' + target);
  return target;
}

function write(relative, source) {
  const target = safePath(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source.endsWith('\n') ? source : source + '\n', 'utf8');
}

function lines(values) {
  return values.join('\n') + '\n';
}

function replaceOnce(base, relative, before, after) {
  const target = safePath(base, relative);
  const source = fs.readFileSync(target, 'utf8');
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`Missing replacement anchor in ${relative}: ${before}`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Ambiguous replacement anchor in ${relative}: ${before}`);
  }
  fs.writeFileSync(target, source.slice(0, first) + after + source.slice(first + before.length), 'utf8');
}

function insertBefore(base, relative, anchor, insertion) {
  replaceOnce(base, relative, anchor, insertion + anchor);
}

function updateLanguage(fileName, entries) {
  const file = safePath(resourceRoot, path.join('assets', 'toybox', 'lang', fileName));
  const current = JSON.parse(fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(file, JSON.stringify({ ...current, ...entries }, null, 2) + '\n', 'utf8');
}

const sicklePredicate = 'minecraft:iron_hoe[minecraft:custom_data~{toybox:{harvest_sickle:1b}}]';

write('data/toybox/function/system/init_v090_objectives.mcfunction', lines([
  'scoreboard objectives add tb_scd dummy',
  'data modify storage toybox:runtime v090_objectives_initialized set value 1b',
]));

write('data/toybox/function/system/init_v090_player.mcfunction', lines([
  'scoreboard players set @s tb_scd 0',
  'tag @s remove toybox.sickle_active',
  'advancement revoke @s only toybox:interaction/sickle_use',
]));

write('data/toybox/tags/block/sickle_raycast_passable.json', JSON.stringify({
  values: ['minecraft:air', 'minecraft:cave_air', 'minecraft:void_air'],
}, null, 2));

write('data/toybox/tags/block/sickle_targets.json', JSON.stringify({
  values: [
    'minecraft:wheat',
    'minecraft:carrots',
    'minecraft:potatoes',
    'minecraft:beetroots',
    'minecraft:nether_wart',
  ],
}, null, 2));

write('data/toybox/advancement/interaction/sickle_use.json', JSON.stringify({
  criteria: {
    use: {
      trigger: 'minecraft:using_item',
      conditions: {
        item: {
          items: 'minecraft:iron_hoe',
          predicates: {
            'minecraft:custom_data': '{toybox:{harvest_sickle:1b}}',
          },
        },
      },
    },
  },
  rewards: { function: 'toybox:farming/sickle/interact' },
}, null, 2));

write('data/toybox/recipe/harvest_sickle.json', JSON.stringify({
  type: 'minecraft:crafting_shaped',
  category: 'equipment',
  pattern: ['IIA', ' S ', ' S '],
  key: {
    I: 'minecraft:iron_ingot',
    A: 'minecraft:amethyst_shard',
    S: 'minecraft:stick',
  },
  result: {
    id: 'minecraft:iron_hoe',
    count: 1,
    components: {
      'minecraft:custom_data': { toybox: { harvest_sickle: true, version: 1 } },
      'minecraft:custom_name': {
        translate: 'item.toybox.harvest_sickle',
        fallback: 'Harvest Sickle',
        color: 'green',
        italic: false,
      },
      'minecraft:lore': [
        {
          translate: 'item.toybox.harvest_sickle.lore.use',
          fallback: 'Hold use while aiming at a mature crop to harvest a 3x3 area.',
          color: 'gray',
          italic: false,
        },
        {
          translate: 'item.toybox.harvest_sickle.lore.crops',
          fallback: 'Wheat, carrots, potatoes, beetroot, and nether wart.',
          color: 'dark_gray',
          italic: false,
        },
        {
          translate: 'item.toybox.harvest_sickle.lore.cost',
          fallback: 'Costs 1 durability per successful sweep; crops are not replanted.',
          color: 'dark_gray',
          italic: false,
        },
      ],
      'minecraft:blocks_attacks': { block_delay_seconds: 3600.0 },
    },
  },
  show_notification: true,
}, null, 2));

write('data/toybox/item_modifier/farming/sickle_damage.json', JSON.stringify({
  function: 'minecraft:set_damage',
  // set_damage works in remaining-durability fractions and floors the result.
  // Use a small epsilon beyond 1/250 so every current damage value advances once.
  damage: -0.0041,
  add: true,
}, null, 2));

write('data/toybox/function/farming/sickle/interact.mcfunction', lines([
  '# using_item awards once; a short player-tag cooldown rearms it without a global entity scan.',
  'scoreboard players set $sickle_hand tb_data -1',
  `execute if items entity @s weapon.mainhand ${sicklePredicate} run scoreboard players set $sickle_hand tb_data 0`,
  `execute unless score $sickle_hand tb_data matches 0 if items entity @s weapon.offhand ${sicklePredicate} run scoreboard players set $sickle_hand tb_data 1`,
  'execute if score $sickle_hand tb_data matches 0..1 at @s run function toybox:farming/sickle/start',
  'execute if score $sickle_hand tb_data matches 0..1 run scoreboard players set @s tb_scd 10',
  'execute if score $sickle_hand tb_data matches 0..1 run tag @s add toybox.sickle_active',
  'execute unless score $sickle_hand tb_data matches 0..1 run advancement revoke @s only toybox:interaction/sickle_use',
]));

write('data/toybox/function/farming/sickle/start.mcfunction', lines([
  'scoreboard players set $sickle_found tb_data 0',
  'scoreboard players set $sickle_step tb_data 0',
  'scoreboard players set $sickle_count tb_data 0',
  'execute anchored eyes positioned ^ ^ ^0.2 run function toybox:farming/sickle/raycast',
  'execute if score $sickle_count tb_data matches 1.. run function toybox:farming/sickle/finish',
]));

write('data/toybox/function/farming/sickle/raycast.mcfunction', lines([
  '# Twenty-five 0.2-block steps: a bounded five-block ray, stopped by any non-air block.',
  'scoreboard players add $sickle_step tb_data 1',
  'execute if score $sickle_found tb_data matches 0 if block ~ ~ ~ minecraft:wheat[age=7] align xyz run function toybox:farming/sickle/harvest_grid',
  'execute if score $sickle_found tb_data matches 0 if block ~ ~ ~ minecraft:carrots[age=7] align xyz run function toybox:farming/sickle/harvest_grid',
  'execute if score $sickle_found tb_data matches 0 if block ~ ~ ~ minecraft:potatoes[age=7] align xyz run function toybox:farming/sickle/harvest_grid',
  'execute if score $sickle_found tb_data matches 0 if block ~ ~ ~ minecraft:beetroots[age=3] align xyz run function toybox:farming/sickle/harvest_grid',
  'execute if score $sickle_found tb_data matches 0 if block ~ ~ ~ minecraft:nether_wart[age=3] align xyz run function toybox:farming/sickle/harvest_grid',
  'execute if score $sickle_found tb_data matches 0 if score $sickle_step tb_data matches ..24 if block ~ ~ ~ #toybox:sickle_raycast_passable positioned ^ ^ ^0.2 run function toybox:farming/sickle/raycast',
]));

const grid = [];
for (let z = -1; z <= 1; z++) {
  for (let x = -1; x <= 1; x++) {
    grid.push(`execute positioned ~${x} ~ ~${z} run function toybox:farming/sickle/harvest_one`);
  }
}
grid.push('execute if score $sickle_count tb_data matches 1.. run scoreboard players set $sickle_found tb_data 1');
write('data/toybox/function/farming/sickle/harvest_grid.mcfunction', lines(grid));

write('data/toybox/function/farming/sickle/harvest_one.mcfunction', lines([
  '# Generate the block\'s own loot before replacing it, preserving vanilla Fortune behavior.',
  'scoreboard players set $sickle_one tb_data 0',
  'execute if block ~ ~ ~ minecraft:wheat[age=7] run scoreboard players set $sickle_one tb_data 1',
  'execute if block ~ ~ ~ minecraft:carrots[age=7] run scoreboard players set $sickle_one tb_data 1',
  'execute if block ~ ~ ~ minecraft:potatoes[age=7] run scoreboard players set $sickle_one tb_data 1',
  'execute if block ~ ~ ~ minecraft:beetroots[age=3] run scoreboard players set $sickle_one tb_data 1',
  'execute if block ~ ~ ~ minecraft:nether_wart[age=3] run scoreboard players set $sickle_one tb_data 1',
  'execute if score $sickle_one tb_data matches 1 if score $sickle_hand tb_data matches 0 run loot spawn ~0.5 ~0.25 ~0.5 mine ~ ~ ~ mainhand',
  'execute if score $sickle_one tb_data matches 1 if score $sickle_hand tb_data matches 1 run loot spawn ~0.5 ~0.25 ~0.5 mine ~ ~ ~ offhand',
  'execute if score $sickle_one tb_data matches 1 run setblock ~ ~ ~ minecraft:air',
  'execute if score $sickle_one tb_data matches 1 run scoreboard players add $sickle_count tb_data 1',
]));

write('data/toybox/function/farming/sickle/finish.mcfunction', lines([
  'scoreboard players set $sickle_break tb_data 0',
  `execute if score $sickle_hand tb_data matches 0 if items entity @s weapon.mainhand ${sicklePredicate.replace(']', ',minecraft:damage=249]')} run scoreboard players set $sickle_break tb_data 1`,
  `execute if score $sickle_hand tb_data matches 1 if items entity @s weapon.offhand ${sicklePredicate.replace(']', ',minecraft:damage=249]')} run scoreboard players set $sickle_break tb_data 1`,
  'execute if score $sickle_break tb_data matches 0 if score $sickle_hand tb_data matches 0 run item modify entity @s weapon.mainhand toybox:farming/sickle_damage',
  'execute if score $sickle_break tb_data matches 0 if score $sickle_hand tb_data matches 1 run item modify entity @s weapon.offhand toybox:farming/sickle_damage',
  'execute if score $sickle_break tb_data matches 1 if score $sickle_hand tb_data matches 0 run item replace entity @s weapon.mainhand with minecraft:air',
  'execute if score $sickle_break tb_data matches 1 if score $sickle_hand tb_data matches 1 run item replace entity @s weapon.offhand with minecraft:air',
  'execute if score $sickle_break tb_data matches 1 at @s run playsound minecraft:entity.item.break player @a[distance=..16] ~ ~ ~ 0.8 1.0',
  'execute at @s run playsound minecraft:block.crop.break player @a[distance=..16] ~ ~ ~ 0.7 1.1',
  'execute at @s run particle minecraft:sweep_attack ~ ~1 ~ 0 0 0 0 1 force @a[distance=..16]',
]));

write('data/toybox/function/farming/sickle/rearm.mcfunction', lines([
  'advancement revoke @s only toybox:interaction/sickle_use',
  'scoreboard players set @s tb_scd 0',
  'tag @s remove toybox.sickle_active',
]));

const sickleSmokeLines = [
  '# Headless proof for bounded ray hit, five-crop 3x3 harvest, durability, break, and cleanup.',
  'scoreboard players set $smoke_sickle_fail tb_gid 0',
  'scoreboard players set $smoke_sickle_raycast tb_gid 0',
  'scoreboard players set $smoke_sickle_grid tb_gid 0',
  'scoreboard players set $smoke_sickle_damage tb_gid 0',
  'scoreboard players set $smoke_sickle_break tb_gid 0',
  'scoreboard players set $smoke_sickle_setup tb_gid 0',
  'scoreboard players set $smoke_sickle_ray_step tb_gid 0',
  'scoreboard players set $smoke_sickle_ray_count tb_gid 0',
  'scoreboard players set $smoke_sickle_plants tb_gid 0',
  'scoreboard players set $smoke_sickle_grid_count tb_gid 0',
  'execute unless data storage toybox:runtime {v090_objectives_initialized:1b} run scoreboard players add $smoke_sickle_fail tb_gid 1',
  'execute unless score $pack tb_data matches 900 run scoreboard players add $smoke_sickle_fail tb_gid 1',
  'execute in minecraft:overworld run forceload add 768 768',
  'execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox.debug_sickle]',
  'execute in minecraft:overworld run kill @e[type=minecraft:item,x=766,y=98,z=764,dx=6,dy=5,dz=8]',
  'execute in minecraft:overworld run fill 766 98 764 772 102 772 minecraft:air',
  'execute in minecraft:overworld run setblock 768 99 771 minecraft:farmland[moisture=7]',
  'execute in minecraft:overworld run setblock 768 100 771 minecraft:wheat[age=7]',
  'execute in minecraft:overworld run summon minecraft:armor_stand 768.5 100 768.5 {Tags:["toybox.debug_sickle"],Invisible:1b,NoGravity:1b,Rotation:[0f,24f]}',
  `execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] weapon.mainhand with ${sicklePredicate.replace('~', '=')}`,
  'execute in minecraft:overworld if block 768 100 771 minecraft:wheat[age=7] run scoreboard players add $smoke_sickle_setup tb_gid 1',
  'execute in minecraft:overworld if entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] run scoreboard players add $smoke_sickle_setup tb_gid 1',
  'execute in minecraft:overworld if items entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] weapon.mainhand minecraft:iron_hoe run scoreboard players add $smoke_sickle_setup tb_gid 1',
  'scoreboard players set $sickle_hand tb_data 0',
  'execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] at @s run function toybox:farming/sickle/start',
  'scoreboard players operation $smoke_sickle_ray_step tb_gid = $sickle_step tb_data',
  'scoreboard players operation $smoke_sickle_ray_count tb_gid = $sickle_count tb_data',
  'execute if score $sickle_found tb_data matches 1 if score $sickle_count tb_data matches 1 in minecraft:overworld unless block 768 100 771 #toybox:sickle_targets run scoreboard players set $smoke_sickle_raycast tb_gid 1',
  'scoreboard players set $sickle_damage_value tb_gid -1',
  'execute in minecraft:overworld store result score $sickle_damage_value tb_gid run data get entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] equipment.mainhand.components."minecraft:damage" 1',
  'execute if score $sickle_damage_value tb_gid matches 1 run scoreboard players set $smoke_sickle_damage tb_gid 1',
  'execute unless score $smoke_sickle_raycast tb_gid matches 1 run scoreboard players add $smoke_sickle_fail tb_gid 1',
  'execute unless score $smoke_sickle_damage tb_gid matches 1 run scoreboard players add $smoke_sickle_fail tb_gid 1',
  'execute in minecraft:overworld run kill @e[type=minecraft:item,x=766,y=98,z=764,dx=6,dy=5,dz=8]',
  'execute in minecraft:overworld run fill 767 99 767 769 99 768 minecraft:farmland[moisture=7]',
  'execute in minecraft:overworld run fill 767 99 769 769 99 769 minecraft:soul_sand',
  'execute in minecraft:overworld run setblock 767 100 767 minecraft:wheat[age=7]',
  'execute in minecraft:overworld run setblock 768 100 767 minecraft:carrots[age=7]',
  'execute in minecraft:overworld run setblock 769 100 767 minecraft:potatoes[age=7]',
  'execute in minecraft:overworld run setblock 767 100 768 minecraft:beetroots[age=3]',
  'execute in minecraft:overworld run setblock 768 100 768 minecraft:wheat[age=7]',
  'execute in minecraft:overworld run setblock 769 100 768 minecraft:carrots[age=7]',
  'execute in minecraft:overworld run setblock 767 100 769 minecraft:nether_wart[age=3]',
  'execute in minecraft:overworld run setblock 768 100 769 minecraft:nether_wart[age=3]',
  'execute in minecraft:overworld run setblock 769 100 769 minecraft:nether_wart[age=3]',
  'execute in minecraft:overworld if block 767 100 767 minecraft:wheat[age=7] run scoreboard players add $smoke_sickle_plants tb_gid 1',
  'execute in minecraft:overworld if block 768 100 767 minecraft:carrots[age=7] run scoreboard players add $smoke_sickle_plants tb_gid 1',
  'execute in minecraft:overworld if block 769 100 767 minecraft:potatoes[age=7] run scoreboard players add $smoke_sickle_plants tb_gid 1',
  'execute in minecraft:overworld if block 767 100 768 minecraft:beetroots[age=3] run scoreboard players add $smoke_sickle_plants tb_gid 1',
  'execute in minecraft:overworld if block 768 100 768 minecraft:wheat[age=7] run scoreboard players add $smoke_sickle_plants tb_gid 1',
  'execute in minecraft:overworld if block 769 100 768 minecraft:carrots[age=7] run scoreboard players add $smoke_sickle_plants tb_gid 1',
  'execute in minecraft:overworld if block 767 100 769 minecraft:nether_wart[age=3] run scoreboard players add $smoke_sickle_plants tb_gid 1',
  'execute in minecraft:overworld if block 768 100 769 minecraft:nether_wart[age=3] run scoreboard players add $smoke_sickle_plants tb_gid 1',
  'execute in minecraft:overworld if block 769 100 769 minecraft:nether_wart[age=3] run scoreboard players add $smoke_sickle_plants tb_gid 1',
  'scoreboard players set $sickle_count tb_data 0',
  'scoreboard players set $sickle_hand tb_data 0',
  'execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] positioned 768 100 768 run function toybox:farming/sickle/harvest_grid',
  'scoreboard players operation $smoke_sickle_grid_count tb_gid = $sickle_count tb_data',
  'execute if score $sickle_count tb_data matches 9 in minecraft:overworld unless block 767 100 767 #toybox:sickle_targets unless block 768 100 767 #toybox:sickle_targets unless block 769 100 767 #toybox:sickle_targets unless block 767 100 768 #toybox:sickle_targets unless block 768 100 768 #toybox:sickle_targets unless block 769 100 768 #toybox:sickle_targets unless block 767 100 769 #toybox:sickle_targets unless block 768 100 769 #toybox:sickle_targets unless block 769 100 769 #toybox:sickle_targets run scoreboard players set $smoke_sickle_grid tb_gid 1',
  'execute unless score $smoke_sickle_grid tb_gid matches 1 run scoreboard players add $smoke_sickle_fail tb_gid 1',
  `execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] weapon.mainhand with ${sicklePredicate.replace('~', '=').replace(']', ',minecraft:damage=249]')}`,
  'execute in minecraft:overworld run setblock 768 99 768 minecraft:farmland[moisture=7]',
  'execute in minecraft:overworld run setblock 768 100 768 minecraft:wheat[age=7]',
  'scoreboard players set $sickle_count tb_data 0',
  'scoreboard players set $sickle_hand tb_data 0',
  'execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] positioned 768 100 768 run function toybox:farming/sickle/harvest_one',
  'execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] at @s run function toybox:farming/sickle/finish',
  'execute in minecraft:overworld unless items entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] weapon.mainhand * unless block 768 100 768 #toybox:sickle_targets run scoreboard players set $smoke_sickle_break tb_gid 1',
  'execute unless score $smoke_sickle_break tb_gid matches 1 run scoreboard players add $smoke_sickle_fail tb_gid 1',
  'execute in minecraft:overworld run setblock 768 99 768 minecraft:farmland[moisture=7]',
  'execute in minecraft:overworld run setblock 768 100 768 minecraft:wheat[age=6]',
  'scoreboard players set $sickle_count tb_data 0',
  'execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] positioned 768 100 768 run function toybox:farming/sickle/harvest_one',
  'execute unless score $sickle_count tb_data matches 0 run scoreboard players add $smoke_sickle_fail tb_gid 1',
  'execute in minecraft:overworld unless block 768 100 768 minecraft:wheat[age=6] run scoreboard players add $smoke_sickle_fail tb_gid 1',
  'execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox.debug_sickle]',
  'execute in minecraft:overworld run kill @e[type=minecraft:item,x=766,y=98,z=764,dx=6,dy=5,dz=8]',
  'execute in minecraft:overworld run fill 766 98 764 772 102 772 minecraft:air',
  'execute in minecraft:overworld run forceload remove 768 768',
];
const sickleSmokeCoordinateMap = new Map([
  ['768.5', '0.5'], ['772', '4'], ['771', '3'], ['769', '1'],
  ['768', '0'], ['767', '-1'], ['766', '-2'], ['764', '-4'],
]);
const localSickleSmokeLines = sickleSmokeLines.map((line) => {
  let next = line;
  for (const [from, to] of sickleSmokeCoordinateMap) {
    next = next.replace(new RegExp(`\\b${from.replace('.', '\\.') }\\b`, 'g'), to);
  }
  return next;
});
write('data/toybox/function/dev/sickle_smoke.mcfunction', lines(localSickleSmokeLines));

replaceOnce(root, 'data/toybox/function/load.mcfunction',
  '# Realm Toybox v0.8.0-rc1 load.', '# Realm Toybox v0.9.0-rc1 load.');
insertBefore(root, 'data/toybox/function/load.mcfunction',
  'scoreboard players set $pack tb_data 800',
  'execute unless data storage toybox:runtime {v090_objectives_initialized:1b} run function toybox:system/init_v090_objectives\n');
replaceOnce(root, 'data/toybox/function/load.mcfunction',
  'scoreboard players set $pack tb_data 800', 'scoreboard players set $pack tb_data 900');
replaceOnce(root, 'data/toybox/function/load.mcfunction',
  'data modify storage toybox:runtime data_version set value 800',
  'data modify storage toybox:runtime data_version set value 900');

replaceOnce(root, 'data/toybox/function/tick.mcfunction',
  'execute as @a[scores={tb_pver=..799}] run function toybox:system/migrate_player',
  'execute as @a[scores={tb_pver=..899}] run function toybox:system/migrate_player');
insertBefore(root, 'data/toybox/function/tick.mcfunction',
  'tag @a[tag=toybox.grappling_current] remove toybox.grappling_current',
  'scoreboard players remove @a[tag=toybox.sickle_active,scores={tb_scd=1..}] tb_scd 1\n' +
  'execute as @a[tag=toybox.sickle_active,scores={tb_scd=..0}] run function toybox:farming/sickle/rearm\n');

insertBefore(root, 'data/toybox/function/system/migrate_player.mcfunction',
  'scoreboard players set @s tb_gcd 0',
  'execute if score @s tb_pver matches ..899 run function toybox:system/init_v090_player\n' +
  'execute if score @s tb_pver matches ..899 run recipe give @s toybox:harvest_sickle\n');
replaceOnce(root, 'data/toybox/function/system/migrate_player.mcfunction',
  'scoreboard players set @s tb_pver 800', 'scoreboard players set @s tb_pver 900');

insertBefore(root, 'data/toybox/function/player_init.mcfunction',
  'tellraw @s {"translate":"message.toybox.enabled"',
  'recipe give @s toybox:harvest_sickle\n');
replaceOnce(root, 'data/toybox/function/player_init.mcfunction',
  '[Toybox] v0.8.0-rc1 enabled.', '[Toybox] v0.9.0-rc1 enabled.');

replaceOnce(root, 'data/toybox/function/help.mcfunction',
  'Realm Toybox v0.8.0-rc1 | Java 26.2', 'Realm Toybox v0.9.0-rc1 | Java 26.2');
insertBefore(root, 'data/toybox/function/help.mcfunction',
  'tellraw @s {"translate":"message.toybox.help.soup"',
  'tellraw @s {"translate":"message.toybox.help.sickle","fallback":"• Harvest Sickle: hold use while aiming at a mature crop to harvest a 3x3 area; no automatic replanting","color":"green"}\n');

replaceOnce(root, 'data/toybox/function/dev/server_smoke.mcfunction',
  '# v0.8.0-rc1 migration/objective assertions.', '# v0.9.0-rc1 migration/objective assertions.');
insertBefore(root, 'data/toybox/function/dev/server_smoke.mcfunction',
  'execute unless score $pack tb_data matches 800 run scoreboard players add $smoke_fail tb_gid 1',
  'execute unless data storage toybox:runtime {v090_objectives_initialized:1b} run scoreboard players add $smoke_fail tb_gid 1\n');
replaceOnce(root, 'data/toybox/function/dev/server_smoke.mcfunction',
  'execute unless score $pack tb_data matches 800 run scoreboard players add $smoke_fail tb_gid 1',
  'execute unless score $pack tb_data matches 900 run scoreboard players add $smoke_fail tb_gid 1');
insertBefore(root, 'data/toybox/function/dev/server_smoke.mcfunction',
  'function toybox:dev/survey_smoke',
  'function toybox:dev/sickle_smoke\n');
insertBefore(root, 'data/toybox/function/dev/server_smoke.mcfunction',
  'scoreboard players operation $smoke_fail tb_gid += $smoke_survey_fail tb_gid',
  'scoreboard players operation $smoke_fail tb_gid += $smoke_sickle_fail tb_gid\n');

replaceOnce(root, 'data/toybox/function/dev/survey_smoke.mcfunction',
  'execute unless score $pack tb_data matches 800 run scoreboard players add $smoke_survey_fail tb_gid 1',
  'execute unless score $pack tb_data matches 900 run scoreboard players add $smoke_survey_fail tb_gid 1');

replaceOnce(root, 'pack.mcmeta',
  'Realm Toybox v0.8.0-rc1 — Java 26.2',
  'Realm Toybox v0.9.0-rc1 — Java 26.2');
replaceOnce(resourceRoot, 'pack.mcmeta',
  'Realm Toybox v0.8.0-rc1 language resources',
  'Realm Toybox v0.9.0-rc1 language resources');

replaceOnce(root, 'tools/package.ps1',
  "param([string]$Version = 'v0.8.0-rc1-java-26.2')",
  "param([string]$Version = 'v0.9.0-rc1-java-26.2')");
replaceOnce(resourceRoot, 'package.ps1',
  "param([string]$Version = 'v0.8.0-rc1-java-26.2')",
  "param([string]$Version = 'v0.9.0-rc1-java-26.2')");
replaceOnce(root, 'tools/package.ps1', "$ErrorActionPreference = 'Stop'",
  "$ErrorActionPreference = 'Stop'\ntry { $Host.UI.RawUI.WindowTitle = 'Realm_Toybox.package' } catch { }");
replaceOnce(root, 'tools/test_server.ps1', "$ErrorActionPreference = 'Stop'",
  "$ErrorActionPreference = 'Stop'\ntry { $Host.UI.RawUI.WindowTitle = 'Realm_Toybox.server_test' } catch { }");
replaceOnce(root, 'tools/test_server.ps1', '$stream.ReadTimeout = 10000', '$stream.ReadTimeout = 60000');
replaceOnce(root, 'tools/test_server.ps1',
  "'level-name=world','gamemode=creative'",
  "'level-name=world','level-type=minecraft:flat','generator-settings={\"biome\":\"minecraft:plains\",\"layers\":[{\"block\":\"minecraft:bedrock\",\"height\":1},{\"block\":\"minecraft:dirt\",\"height\":2},{\"block\":\"minecraft:grass_block\",\"height\":1}]}','generate-structures=false','level-seed=RealmToyboxDeterministicTest','gamemode=creative'");
replaceOnce(root, 'tools/test_validate.ps1', "$ErrorActionPreference = 'Stop'",
  "$ErrorActionPreference = 'Stop'\ntry { $Host.UI.RawUI.WindowTitle = 'Realm_Toybox.validator_self_test' } catch { }");
replaceOnce(resourceRoot, 'package.ps1', "$ErrorActionPreference = 'Stop'",
  "$ErrorActionPreference = 'Stop'\ntry { $Host.UI.RawUI.WindowTitle = 'Realm_Toybox.resource_package' } catch { }");

insertBefore(root, 'tools/test_server.ps1',
  "            'scoreboard players get $smoke_fail tb_gid',",
  "            'scoreboard players get $smoke_sickle_fail tb_gid',\n" +
  "            'scoreboard players get $smoke_sickle_raycast tb_gid',\n" +
  "            'scoreboard players get $smoke_sickle_grid tb_gid',\n" +
  "            'scoreboard players get $smoke_sickle_damage tb_gid',\n" +
  "            'scoreboard players get $smoke_sickle_break tb_gid',\n" +
  "            'scoreboard players get $smoke_sickle_setup tb_gid',\n" +
  "            'scoreboard players get $smoke_sickle_ray_step tb_gid',\n" +
  "            'scoreboard players get $smoke_sickle_ray_count tb_gid',\n" +
  "            'scoreboard players get $smoke_sickle_plants tb_gid',\n" +
  "            'scoreboard players get $smoke_sickle_grid_count tb_gid',\n" +
  "            'scoreboard players get $sickle_damage_value tb_gid',\n");
replaceOnce(root, 'tools/test_server.ps1',
  "UUID of added entity already exists|\\[.*ERROR\\]",
  "UUID of added entity already exists|\\[(?!Yggdrasil Key Fetcher/ERROR\\])[^\\]\\r\\n]*ERROR\\]");

replaceOnce(root, 'tools/validate.mjs', "if (packVersion !== '800' ||", "if (Number(packVersion) < 800 ||");

const validatorInsertion = String.raw`
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

`;
insertBefore(root, 'tools/validate.mjs',
  "const enPath = path.join(resourceRoot, 'assets', 'toybox', 'lang', 'en_us.json');",
  validatorInsertion);

const fixtureInsertion = String.raw`
  $sickleRecipePath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\recipe\harvest_sickle.json'
  $validSickleRecipe = [IO.File]::ReadAllText($sickleRecipePath)
  $invalidSickleRecipe = $validSickleRecipe.Replace('"minecraft:blocks_attacks": {', '"minecraft:blocks_attacks_removed": {')
  if ($invalidSickleRecipe -eq $validSickleRecipe) { throw 'Sickle fixture could not remove the non-consuming use action.' }
  [IO.File]::WriteAllText($sickleRecipePath, $invalidSickleRecipe, $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) '\[SICKLE_ITEM\]' 'Sickle without a non-consuming use action was accepted.'
  [IO.File]::WriteAllText($sickleRecipePath, $validSickleRecipe, $utf8NoBom)

`;
insertBefore(root, 'tools/test_validate.ps1',
  "  Write-Host 'Validator self-test passed: clean source and 12 negative fixtures.'",
  fixtureInsertion);
replaceOnce(root, 'tools/test_validate.ps1',
  'clean source and 12 negative fixtures.', 'clean source and 13 negative fixtures.');

updateLanguage('en_us.json', {
  'pack.toybox.description': 'Realm Toybox v0.9.0-rc1 — Java 26.2',
  'item.toybox.harvest_sickle': 'Harvest Sickle',
  'item.toybox.harvest_sickle.lore.use': 'Hold use while aiming at a mature crop to harvest a 3x3 area.',
  'item.toybox.harvest_sickle.lore.crops': 'Wheat, carrots, potatoes, beetroot, and nether wart.',
  'item.toybox.harvest_sickle.lore.cost': 'Costs 1 durability per successful sweep; crops are not replanted.',
  'message.toybox.enabled': '[Toybox] v0.9.0-rc1 enabled. Help: /trigger tb_help',
  'message.toybox.help.title': 'Realm Toybox v0.9.0-rc1 | Java 26.2',
  'message.toybox.help.sickle': '• Harvest Sickle: hold use while aiming at a mature crop to harvest a 3x3 area; no automatic replanting',
});

updateLanguage('ko_kr.json', {
  'pack.toybox.description': 'Realm Toybox v0.9.0-rc1 — Java 26.2',
  'item.toybox.harvest_sickle': '수확 낫',
  'item.toybox.harvest_sickle.lore.use': '완전히 자란 작물을 조준하고 사용 키를 누르면 3×3 범위를 수확합니다.',
  'item.toybox.harvest_sickle.lore.crops': '밀, 당근, 감자, 비트, 네더 사마귀를 지원합니다.',
  'item.toybox.harvest_sickle.lore.cost': '성공한 휘두르기당 내구도 1을 쓰며 자동으로 다시 심지 않습니다.',
  'message.toybox.enabled': '[Toybox] v0.9.0-rc1이 활성화되었습니다. 도움말: /trigger tb_help',
  'message.toybox.help.title': 'Realm Toybox v0.9.0-rc1 | Java 26.2',
  'message.toybox.help.sickle': '• 수확 낫: 완숙 작물을 조준하고 사용 키를 누르면 3×3 수확; 자동 재식재 없음',
});

console.log('Generated Realm Toybox v0.9 Harvest Sickle Update.');
