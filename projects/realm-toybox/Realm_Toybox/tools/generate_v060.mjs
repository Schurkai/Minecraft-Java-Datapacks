import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Realm_Toybox.generate_v060';

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
  write(relative, `${JSON.stringify(value, null, 2)}\n`);
}

function lines(...values) {
  return `${values.flat().join('\n')}\n`;
}

resetDir('data/toybox/function/building/jump_pad');

writeJson('data/toybox/tags/block/jump_pad_clearance.json', {
  values: [
    'minecraft:air',
    'minecraft:cave_air',
    'minecraft:void_air',
  ],
});

writeJson('data/toybox/predicate/player/jump_pad_eligible.json', {
  condition: 'minecraft:all_of',
  terms: [
    {
      condition: 'minecraft:entity_properties',
      entity: 'this',
      predicate: {
        'minecraft:flags': {
          is_on_ground: true,
          is_flying: false,
          is_fall_flying: false,
          is_in_water: false,
        },
      },
    },
    {
      condition: 'minecraft:inverted',
      term: {
        condition: 'minecraft:entity_properties',
        entity: 'this',
        predicate: {
          'minecraft:vehicle': {},
        },
      },
    },
  ],
});

write(
  'data/toybox/function/building/jump_pad/check.mcfunction',
  lines(
    '# Require five clear air-like blocks above the pressure plate.',
    'execute if block ~ ~1 ~ #toybox:jump_pad_clearance if block ~ ~2 ~ #toybox:jump_pad_clearance if block ~ ~3 ~ #toybox:jump_pad_clearance if block ~ ~4 ~ #toybox:jump_pad_clearance if block ~ ~5 ~ #toybox:jump_pad_clearance run function toybox:building/jump_pad/activate',
    'execute if score @s tb_padlock matches 0 run function toybox:building/jump_pad/blocked',
  ),
);

write(
  'data/toybox/function/building/jump_pad/activate.mcfunction',
  lines(
    'scoreboard players set @s tb_padlock 1',
    'effect give @s minecraft:levitation 1 3 true',
    'effect give @s minecraft:slow_falling 3 0 true',
    'particle minecraft:cloud ~ ~0.1 ~ 0.35 0.05 0.35 0.05 12 force @s',
    'playsound minecraft:entity.breeze.jump player @s ~ ~ ~ 0.8 1.0',
  ),
);

write(
  'data/toybox/function/building/jump_pad/blocked.mcfunction',
  lines(
    'scoreboard players set @s tb_padlock 1',
    'playsound minecraft:block.iron_trapdoor.close player @s ~ ~ ~ 0.45 0.7',
    'tellraw @s {"translate":"message.toybox.jump_pad.blocked","fallback":"[Toybox] Jump Pad needs five clear blocks above it. Step off to re-arm it.","color":"red"}',
  ),
);

write(
  'data/toybox/function/dev/jump_pad_smoke.mcfunction',
  lines(
    'scoreboard players set $smoke_pad_fail tb_gid 0',
    'execute unless data storage toybox:runtime {v060_objectives_initialized:1b} run scoreboard players add $smoke_pad_fail tb_gid 1',
    'execute in minecraft:overworld run forceload add 40 40',
    'execute in minecraft:overworld run fill 40 100 40 40 106 40 minecraft:air',
    'execute in minecraft:overworld run setblock 40 100 40 minecraft:yellow_glazed_terracotta',
    'execute in minecraft:overworld run setblock 40 101 40 minecraft:heavy_weighted_pressure_plate',
    'execute in minecraft:overworld unless block 40 100 40 minecraft:yellow_glazed_terracotta run scoreboard players add $smoke_pad_fail tb_gid 1',
    'execute in minecraft:overworld unless block 40 101 40 minecraft:heavy_weighted_pressure_plate run scoreboard players add $smoke_pad_fail tb_gid 1',
    'execute in minecraft:overworld positioned 40 101 40 unless block ~ ~1 ~ #toybox:jump_pad_clearance run scoreboard players add $smoke_pad_fail tb_gid 1',
    'execute in minecraft:overworld positioned 40 101 40 unless block ~ ~5 ~ #toybox:jump_pad_clearance run scoreboard players add $smoke_pad_fail tb_gid 1',
    'execute in minecraft:overworld run setblock 40 103 40 minecraft:stone',
    'execute in minecraft:overworld positioned 40 101 40 if block ~ ~2 ~ #toybox:jump_pad_clearance run scoreboard players add $smoke_pad_fail tb_gid 1',
    'execute in minecraft:overworld run fill 40 100 40 40 106 40 minecraft:air',
    'execute in minecraft:overworld run forceload remove 40 40',
  ),
);

console.log('Generated Realm Toybox v0.6 jump pad.');
