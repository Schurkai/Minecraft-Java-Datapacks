import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Realm_Toybox.generate_v050';

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

function lines(...values) {
  return `${values.flat().join('\n')}\n`;
}

resetDir('data/toybox/function/building');

write(
  'data/toybox/function/building/current_dimension.mcfunction',
  lines(
    'scoreboard players set $current_dim tb_data -99',
    'execute if dimension minecraft:overworld run scoreboard players set $current_dim tb_data 0',
    'execute if dimension minecraft:the_nether run scoreboard players set $current_dim tb_data 1',
    'execute if dimension minecraft:the_end run scoreboard players set $current_dim tb_data 2',
  ),
);

write(
  'data/toybox/function/building/measure/start.mcfunction',
  lines(
    'function toybox:building/current_dimension',
    'execute if score $current_dim tb_data matches -99 run tellraw @s {"translate":"message.toybox.measure.unsupported_dimension","fallback":"[Toybox] Measuring is supported only in the Overworld, Nether, and End.","color":"red"}',
    'execute unless score $current_dim tb_data matches -99 store result score @s tb_mx run data get entity @s Pos[0] 1',
    'execute unless score $current_dim tb_data matches -99 store result score @s tb_my run data get entity @s Pos[1] 1',
    'execute unless score $current_dim tb_data matches -99 store result score @s tb_mz run data get entity @s Pos[2] 1',
    'execute unless score $current_dim tb_data matches -99 run scoreboard players operation @s tb_mdim = $current_dim tb_data',
    'execute unless score $current_dim tb_data matches -99 run scoreboard players set @s tb_mstate 1',
    'execute unless score $current_dim tb_data matches -99 run tellraw @s {"translate":"message.toybox.measure.start","fallback":"[Toybox] Measurement start saved at %s, %s, %s. Run the trigger again at the endpoint.","color":"aqua","with":[{"score":{"name":"@s","objective":"tb_mx"}},{"score":{"name":"@s","objective":"tb_my"}},{"score":{"name":"@s","objective":"tb_mz"}}]}',
    'scoreboard players set @s tb_measure 0',
  ),
);

write(
  'data/toybox/function/building/measure/cancel.mcfunction',
  lines(
    'scoreboard players set @s tb_mstate 0',
    'scoreboard players set @s tb_measure 0',
    'tellraw @s {"translate":"message.toybox.measure.cancel","fallback":"[Toybox] Measurement start cleared.","color":"gray"}',
  ),
);

write(
  'data/toybox/function/building/measure/sqrt.mcfunction',
  lines(
    '# Exact floor square root for a non-negative signed 32-bit score.',
    'scoreboard players set $lo tb_data 0',
    'scoreboard players set $hi tb_data 46340',
    'scoreboard players set $two tb_data 2',
    'scoreboard players set $iter tb_data 0',
    'function toybox:building/measure/sqrt_step',
    'scoreboard players operation $distance tb_data = $lo tb_data',
  ),
);

write(
  'data/toybox/function/building/measure/sqrt_step.mcfunction',
  lines(
    '# Upper-mid binary search; 16 iterations cover the inclusive range 0..46340.',
    'scoreboard players operation $mid tb_data = $lo tb_data',
    'scoreboard players operation $mid tb_data += $hi tb_data',
    'scoreboard players add $mid tb_data 1',
    'scoreboard players operation $mid tb_data /= $two tb_data',
    'scoreboard players operation $square tb_data = $mid tb_data',
    'scoreboard players operation $square tb_data *= $mid tb_data',
    'execute if score $square tb_data <= $distance2 tb_data run scoreboard players operation $lo tb_data = $mid tb_data',
    'execute if score $square tb_data > $distance2 tb_data run scoreboard players operation $hi tb_data = $mid tb_data',
    'execute if score $square tb_data > $distance2 tb_data run scoreboard players remove $hi tb_data 1',
    'scoreboard players add $iter tb_data 1',
    'execute if score $iter tb_data matches ..15 run function toybox:building/measure/sqrt_step',
  ),
);

write(
  'data/toybox/function/building/measure/finish.mcfunction',
  lines(
    '# All calculations use shared fake players, but one function call is synchronous.',
    'function toybox:building/current_dimension',
    'scoreboard players set $measure_reason tb_data 0',
    'execute if score $current_dim tb_data matches -99 run scoreboard players set $measure_reason tb_data 1',
    'execute if score $measure_reason tb_data matches 0 unless score $current_dim tb_data = @s tb_mdim run scoreboard players set $measure_reason tb_data 2',
    'execute if score $measure_reason tb_data matches 0 store result score $tx tb_data run data get entity @s Pos[0] 1',
    'execute if score $measure_reason tb_data matches 0 store result score $ty tb_data run data get entity @s Pos[1] 1',
    'execute if score $measure_reason tb_data matches 0 store result score $tz tb_data run data get entity @s Pos[2] 1',
    'scoreboard players operation $dx tb_data = $tx tb_data',
    'scoreboard players operation $dx tb_data -= @s tb_mx',
    'scoreboard players operation $dy tb_data = $ty tb_data',
    'scoreboard players operation $dy tb_data -= @s tb_my',
    'scoreboard players operation $dz tb_data = $tz tb_data',
    'scoreboard players operation $dz tb_data -= @s tb_mz',
    'scoreboard players set $negative_one tb_data -1',
    'scoreboard players operation $abs_x tb_data = $dx tb_data',
    'scoreboard players operation $abs_y tb_data = $dy tb_data',
    'scoreboard players operation $abs_z tb_data = $dz tb_data',
    'execute if score $abs_x tb_data matches ..-1 run scoreboard players operation $abs_x tb_data *= $negative_one tb_data',
    'execute if score $abs_y tb_data matches ..-1 run scoreboard players operation $abs_y tb_data *= $negative_one tb_data',
    'execute if score $abs_z tb_data matches ..-1 run scoreboard players operation $abs_z tb_data *= $negative_one tb_data',
    'execute if score $measure_reason tb_data matches 0 if score $abs_x tb_data matches 26001.. run scoreboard players set $measure_reason tb_data 3',
    'execute if score $measure_reason tb_data matches 0 if score $abs_y tb_data matches 26001.. run scoreboard players set $measure_reason tb_data 3',
    'execute if score $measure_reason tb_data matches 0 if score $abs_z tb_data matches 26001.. run scoreboard players set $measure_reason tb_data 3',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $manhattan tb_data = $abs_x tb_data',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $manhattan tb_data += $abs_y tb_data',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $manhattan tb_data += $abs_z tb_data',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $distance2 tb_data = $abs_x tb_data',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $distance2 tb_data *= $abs_x tb_data',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $square tb_data = $abs_y tb_data',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $square tb_data *= $abs_y tb_data',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $distance2 tb_data += $square tb_data',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $square tb_data = $abs_z tb_data',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $square tb_data *= $abs_z tb_data',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players operation $distance2 tb_data += $square tb_data',
    'execute if score $measure_reason tb_data matches 0 run function toybox:building/measure/sqrt',
    'execute if score $measure_reason tb_data matches 0 run tellraw @s {"translate":"message.toybox.measure.result","fallback":"[Toybox] ΔX %s, ΔY %s, ΔZ %s | straight %s blocks | Manhattan %s blocks","color":"green","with":[{"score":{"name":"$dx","objective":"tb_data"}},{"score":{"name":"$dy","objective":"tb_data"}},{"score":{"name":"$dz","objective":"tb_data"}},{"score":{"name":"$distance","objective":"tb_data"}},{"score":{"name":"$manhattan","objective":"tb_data"}}]}',
    'execute if score $measure_reason tb_data matches 0 run scoreboard players set @s tb_mstate 0',
    'execute if score $measure_reason tb_data matches 1 run tellraw @s {"translate":"message.toybox.measure.unsupported_dimension","fallback":"[Toybox] Measuring is supported only in the Overworld, Nether, and End.","color":"red"}',
    'execute if score $measure_reason tb_data matches 2 run tellraw @s {"translate":"message.toybox.measure.dimension_mismatch","fallback":"[Toybox] Return to the dimension containing the saved start point, or cancel with /trigger tb_measure set 2.","color":"red"}',
    'execute if score $measure_reason tb_data matches 3 run tellraw @s {"translate":"message.toybox.measure.too_far","fallback":"[Toybox] Each coordinate difference must be at most 26,000 blocks.","color":"red"}',
    'scoreboard players set @s tb_measure 0',
  ),
);

const dimensions = [
  ['overworld', 'minecraft:overworld'],
  ['nether', 'minecraft:the_nether'],
  ['end', 'minecraft:the_end'],
];

for (const [slug, dimension] of dimensions) {
  write(
    `data/toybox/function/building/chalk/particle_${slug}.mcfunction`,
    lines(
      `$execute in ${dimension} positioned $(x) $(y) $(z) run particle minecraft:end_rod ~0.5 ~0.25 ~0.5 0.08 0.25 0.08 0.01 2 force @s`,
      `$execute in ${dimension} positioned $(x) $(y) $(z) run particle minecraft:end_rod ~0.5 ~1.25 ~0.5 0.08 0.25 0.08 0.01 2 force @s`,
      `$execute in ${dimension} positioned $(x) $(y) $(z) run particle minecraft:end_rod ~0.5 ~2.25 ~0.5 0.08 0.25 0.08 0.01 2 force @s`,
    ),
  );
}

for (let slot = 1; slot <= 8; slot++) {
  write(
    `data/toybox/function/building/chalk/save/${slot}.mcfunction`,
    lines(
      `execute store result score @s tb_c${slot}x run data get entity @s Pos[0] 1`,
      `execute store result score @s tb_c${slot}y run data get entity @s Pos[1] 1`,
      `execute store result score @s tb_c${slot}z run data get entity @s Pos[2] 1`,
      `scoreboard players operation @s tb_c${slot}d = $current_dim tb_data`,
      `tellraw @s {"translate":"message.toybox.chalk.saved","fallback":"[Toybox] Chalk slot %s saved at %s, %s, %s.","color":"yellow","with":["${slot}",{"score":{"name":"@s","objective":"tb_c${slot}x"}},{"score":{"name":"@s","objective":"tb_c${slot}y"}},{"score":{"name":"@s","objective":"tb_c${slot}z"}}]}`,
    ),
  );

  write(
    `data/toybox/function/building/chalk/show/${slot}.mcfunction`,
    lines(
      `execute if score @s tb_c${slot}d matches -99 run tellraw @s {"translate":"message.toybox.chalk.empty","fallback":"[Toybox] That chalk slot is empty.","color":"red"}`,
      `execute unless score @s tb_c${slot}d matches -99 unless score @s tb_c${slot}d = $current_dim tb_data run tellraw @s {"translate":"message.toybox.chalk.dimension_mismatch","fallback":"[Toybox] Chalk marks can be shown only from their saved dimension.","color":"red"}`,
      `execute unless score @s tb_c${slot}d matches -99 if score @s tb_c${slot}d = $current_dim tb_data run scoreboard players set @s tb_cslot ${slot}`,
      `execute unless score @s tb_c${slot}d matches -99 if score @s tb_c${slot}d = $current_dim tb_data run scoreboard players set @s tb_cshow 100`,
      `execute unless score @s tb_c${slot}d matches -99 if score @s tb_c${slot}d = $current_dim tb_data run tellraw @s {"translate":"message.toybox.chalk.shown","fallback":"[Toybox] Showing chalk slot %s for 5 seconds at %s, %s, %s.","color":"aqua","with":["${slot}",{"score":{"name":"@s","objective":"tb_c${slot}x"}},{"score":{"name":"@s","objective":"tb_c${slot}y"}},{"score":{"name":"@s","objective":"tb_c${slot}z"}}]}`,
    ),
  );

  write(
    `data/toybox/function/building/chalk/particle/${slot}.mcfunction`,
    lines(
      `execute store result storage toybox:runtime chalk_marker.x int 1 run scoreboard players get @s tb_c${slot}x`,
      `execute store result storage toybox:runtime chalk_marker.y int 1 run scoreboard players get @s tb_c${slot}y`,
      `execute store result storage toybox:runtime chalk_marker.z int 1 run scoreboard players get @s tb_c${slot}z`,
      `execute if score @s tb_c${slot}d matches 0 run function toybox:building/chalk/particle_overworld with storage toybox:runtime chalk_marker`,
      `execute if score @s tb_c${slot}d matches 1 run function toybox:building/chalk/particle_nether with storage toybox:runtime chalk_marker`,
      `execute if score @s tb_c${slot}d matches 2 run function toybox:building/chalk/particle_end with storage toybox:runtime chalk_marker`,
      'data remove storage toybox:runtime chalk_marker',
    ),
  );
}

write(
  'data/toybox/function/building/chalk/save_dispatch.mcfunction',
  lines(
    'function toybox:building/current_dimension',
    'execute if score $current_dim tb_data matches -99 run tellraw @s {"translate":"message.toybox.chalk.unsupported_dimension","fallback":"[Toybox] Chalk is supported only in the Overworld, Nether, and End.","color":"red"}',
    Array.from({ length: 8 }, (_, index) => `execute unless score $current_dim tb_data matches -99 if score @s tb_chalk matches ${index + 1} run function toybox:building/chalk/save/${index + 1}`),
    'execute unless score @s tb_chalk matches 1..8 run tellraw @s {"translate":"message.toybox.chalk.invalid_slot","fallback":"[Toybox] Chalk slot must be from 1 to 8.","color":"red"}',
    'scoreboard players set @s tb_chalk 0',
  ),
);

write(
  'data/toybox/function/building/chalk/show_dispatch.mcfunction',
  lines(
    'function toybox:building/current_dimension',
    Array.from({ length: 8 }, (_, index) => `execute if score @s tb_chshow matches ${index + 1} run function toybox:building/chalk/show/${index + 1}`),
    'execute unless score @s tb_chshow matches 1..8 run tellraw @s {"translate":"message.toybox.chalk.invalid_slot","fallback":"[Toybox] Chalk slot must be from 1 to 8.","color":"red"}',
    'scoreboard players set @s tb_chshow 0',
  ),
);

write(
  'data/toybox/function/building/chalk/stop_dimension.mcfunction',
  lines(
    'scoreboard players set @s tb_cshow 0',
    'scoreboard players set @s tb_cslot 0',
    'data remove storage toybox:runtime chalk_marker',
    'tellraw @s {"translate":"message.toybox.chalk.stopped_dimension","fallback":"[Toybox] Chalk display stopped after a dimension change.","color":"gray"}',
  ),
);

const chalkTick = [
  'function toybox:building/current_dimension',
  'scoreboard players set $chalk_alive tb_data 0',
];
for (let slot = 1; slot <= 8; slot++) {
  chalkTick.push(`execute if score @s tb_cslot matches ${slot} if score @s tb_c${slot}d = $current_dim tb_data run scoreboard players set $chalk_alive tb_data 1`);
}
chalkTick.push('execute if score $chalk_alive tb_data matches 0 run function toybox:building/chalk/stop_dimension');
for (let slot = 1; slot <= 8; slot++) {
  chalkTick.push(`execute if score $chalk_alive tb_data matches 1 if score @s tb_cslot matches ${slot} run function toybox:building/chalk/particle/${slot}`);
}
chalkTick.push(
  'execute if score $chalk_alive tb_data matches 1 run scoreboard players remove @s tb_cshow 1',
  'execute if score @s tb_cshow matches 0 run scoreboard players set @s tb_cslot 0',
);
write('data/toybox/function/building/chalk/tick.mcfunction', lines(chalkTick));

write(
  'data/toybox/function/dev/building_smoke.mcfunction',
  lines(
    'scoreboard players set $smoke_building_fail tb_gid 0',
    'execute in minecraft:overworld run function toybox:building/current_dimension',
    'execute unless score $current_dim tb_data matches 0 run scoreboard players add $smoke_building_fail tb_gid 1',
    'execute in minecraft:the_nether run function toybox:building/current_dimension',
    'execute unless score $current_dim tb_data matches 1 run scoreboard players add $smoke_building_fail tb_gid 1',
    'execute in minecraft:the_end run function toybox:building/current_dimension',
    'execute unless score $current_dim tb_data matches 2 run scoreboard players add $smoke_building_fail tb_gid 1',
    'scoreboard players set $distance2 tb_data 0',
    'function toybox:building/measure/sqrt',
    'execute unless score $distance tb_data matches 0 run scoreboard players add $smoke_building_fail tb_gid 1',
    'scoreboard players set $distance2 tb_data 169',
    'function toybox:building/measure/sqrt',
    'execute unless score $distance tb_data matches 13 run scoreboard players add $smoke_building_fail tb_gid 1',
    'scoreboard players set $distance2 tb_data 2028000000',
    'function toybox:building/measure/sqrt',
    'execute unless score $distance tb_data matches 45033 run scoreboard players add $smoke_building_fail tb_gid 1',
    'execute unless data storage toybox:runtime {v050_objectives_initialized:1b} run scoreboard players add $smoke_building_fail tb_gid 1',
  ),
);

console.log('Generated Realm Toybox v0.5 building tools.');
