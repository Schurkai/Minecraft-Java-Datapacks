import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Realm_Toybox.generate_v080';

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

function resetDir(relative) {
  const target = safePath(root, relative);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
}

function write(relative, source) {
  const target = safePath(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source.endsWith('\n') ? source : source + '\n', 'utf8');
}

function lines(values) {
  return values.join('\n') + '\n';
}

function updateLanguage(fileName, entries) {
  const file = safePath(resourceRoot, path.join('assets', 'toybox', 'lang', fileName));
  const current = JSON.parse(fs.readFileSync(file, 'utf8'));
  const next = { ...current, ...entries };
  fs.writeFileSync(file, JSON.stringify(next, null, 2) + '\n', 'utf8');
}

function compassItem(dimensionId, dimensionName, dimensionFallback) {
  return 'minecraft:compass[' +
    'minecraft:lodestone_tracker={target:{dimension:"minecraft:' + dimensionName +
    '",pos:[I;$(x),$(y),$(z)]},tracked:false},' +
    'minecraft:max_stack_size=1,' +
    'minecraft:custom_name={translate:"item.toybox.chalk_compass",fallback:"Chalk Compass %s",with:["$(slot)"],color:"aqua",italic:false},' +
    'minecraft:lore=[' +
      '{translate:"item.toybox.chalk_compass.target",fallback:"Slot %s: %s, %s, %s",with:["$(slot)","$(x)","$(y)","$(z)"],color:"gray",italic:false},' +
      '{translate:"item.toybox.chalk_compass.dimension.' + dimensionId +
        '",fallback:"' + dimensionFallback + ' target",color:"dark_gray",italic:false}' +
    '],' +
    'minecraft:custom_data={toybox:{chalk_compass:{version:1,slot:$(slot),dimension:$(dimension),x:$(x),y:$(y),z:$(z)}}}' +
  ']';
}

resetDir('data/toybox/function/building/compass');

write('data/toybox/function/system/init_v080_objectives.mcfunction', lines([
  'scoreboard objectives add tb_compass trigger',
  'data modify storage toybox:runtime v080_objectives_initialized set value 1b',
]));

write('data/toybox/function/system/init_v080_player.mcfunction', lines([
  'scoreboard players set @s tb_compass 0',
]));

write('data/toybox/function/building/measure/geometry.mcfunction', lines([
  '# Inclusive cuboid dimensions: selecting one block produces 1 x 1 x 1.',
  'scoreboard players operation $span_x tb_data = $abs_x tb_data',
  'scoreboard players operation $span_y tb_data = $abs_y tb_data',
  'scoreboard players operation $span_z tb_data = $abs_z tb_data',
  'scoreboard players add $span_x tb_data 1',
  'scoreboard players add $span_y tb_data 1',
  'scoreboard players add $span_z tb_data 1',
  '# Pairwise products are safe because every span is at most 26,001.',
  'scoreboard players operation $floor_area tb_data = $span_x tb_data',
  'scoreboard players operation $floor_area tb_data *= $span_z tb_data',
  'scoreboard players operation $area_xy tb_data = $span_x tb_data',
  'scoreboard players operation $area_xy tb_data *= $span_y tb_data',
  'scoreboard players operation $area_yz tb_data = $span_y tb_data',
  'scoreboard players operation $area_yz tb_data *= $span_z tb_data',
  '# Four vertical face areas: 2 * (X*Y + Y*Z). Guard the final doubling.',
  'scoreboard players operation $wall_half tb_data = $area_xy tb_data',
  'scoreboard players operation $wall_half tb_data += $area_yz tb_data',
  'scoreboard players set $wall_ok tb_data 1',
  'execute if score $wall_half tb_data matches 1073741824.. run scoreboard players set $wall_ok tb_data 0',
  'scoreboard players set $wall_area tb_data 0',
  'scoreboard players set $two tb_data 2',
  'execute if score $wall_ok tb_data matches 1 run scoreboard players operation $wall_area tb_data = $wall_half tb_data',
  'execute if score $wall_ok tb_data matches 1 run scoreboard players operation $wall_area tb_data *= $two tb_data',
  '# Inclusive volume: compare X*Y with floor(INT_MAX / Z) before multiplying.',
  'scoreboard players set $int_max tb_data 2147483647',
  'scoreboard players operation $volume_limit tb_data = $int_max tb_data',
  'scoreboard players operation $volume_limit tb_data /= $span_z tb_data',
  'scoreboard players set $volume_ok tb_data 0',
  'execute if score $area_xy tb_data <= $volume_limit tb_data run scoreboard players set $volume_ok tb_data 1',
  'scoreboard players set $volume tb_data 0',
  'execute if score $volume_ok tb_data matches 1 run scoreboard players operation $volume tb_data = $area_xy tb_data',
  'execute if score $volume_ok tb_data matches 1 run scoreboard players operation $volume tb_data *= $span_z tb_data',
]));

write('data/toybox/function/building/measure/geometry_report.mcfunction', lines([
  'tellraw @s {"translate":"message.toybox.measure.geometry","fallback":"[Toybox] Inclusive size %s × %s × %s | XZ footprint %s blocks","color":"aqua","with":[{"score":{"name":"$span_x","objective":"tb_data"}},{"score":{"name":"$span_y","objective":"tb_data"}},{"score":{"name":"$span_z","objective":"tb_data"}},{"score":{"name":"$floor_area","objective":"tb_data"}}]}',
  'execute if score $wall_ok tb_data matches 1 if score $volume_ok tb_data matches 1 run tellraw @s {"translate":"message.toybox.measure.geometry_full","fallback":"[Toybox] Four-wall face area %s | inclusive volume %s blocks","color":"green","with":[{"score":{"name":"$wall_area","objective":"tb_data"}},{"score":{"name":"$volume","objective":"tb_data"}}]}',
  'execute if score $wall_ok tb_data matches 1 if score $volume_ok tb_data matches 0 run tellraw @s {"translate":"message.toybox.measure.geometry_wall_only","fallback":"[Toybox] Four-wall face area %s | volume omitted because it exceeds the safe score range","color":"yellow","with":[{"score":{"name":"$wall_area","objective":"tb_data"}}]}',
  'execute if score $wall_ok tb_data matches 0 if score $volume_ok tb_data matches 1 run tellraw @s {"translate":"message.toybox.measure.geometry_volume_only","fallback":"[Toybox] Four-wall face area omitted | inclusive volume %s blocks","color":"yellow","with":[{"score":{"name":"$volume","objective":"tb_data"}}]}',
  'execute if score $wall_ok tb_data matches 0 if score $volume_ok tb_data matches 0 run tellraw @s {"translate":"message.toybox.measure.geometry_too_large","fallback":"[Toybox] Four-wall face area and volume were omitted because they exceed the safe score range.","color":"yellow"}',
]));

write('data/toybox/function/building/compass/dispatch.mcfunction', lines([
  'execute if score @s tb_compass matches 1 run function toybox:building/compass/slot/1',
  'execute if score @s tb_compass matches 2 run function toybox:building/compass/slot/2',
  'execute if score @s tb_compass matches 3 run function toybox:building/compass/slot/3',
  'execute if score @s tb_compass matches 4 run function toybox:building/compass/slot/4',
  'execute if score @s tb_compass matches 5 run function toybox:building/compass/slot/5',
  'execute if score @s tb_compass matches 6 run function toybox:building/compass/slot/6',
  'execute if score @s tb_compass matches 7 run function toybox:building/compass/slot/7',
  'execute if score @s tb_compass matches 8 run function toybox:building/compass/slot/8',
  'execute unless score @s tb_compass matches 1..8 run tellraw @s {"translate":"message.toybox.compass.invalid_slot","fallback":"[Toybox] Compass target slot must be from 1 to 8.","color":"red"}',
  'scoreboard players set @s tb_compass 0',
]));

for (let slot = 1; slot <= 8; slot++) {
  write('data/toybox/function/building/compass/slot/' + slot + '.mcfunction', lines([
    'scoreboard players set $compass_reason tb_data 0',
    'execute if score @s tb_c' + slot + 'd matches -99 run scoreboard players set $compass_reason tb_data 1',
    'execute if score $compass_reason tb_data matches 0 unless score @s tb_c' + slot + 'd matches 0..2 run scoreboard players set $compass_reason tb_data 5',
    'execute if score $compass_reason tb_data matches 0 unless items entity @s weapon.mainhand minecraft:compass run scoreboard players set $compass_reason tb_data 2',
    'scoreboard players set $compass_count tb_data 0',
    'execute if score $compass_reason tb_data matches 0 store result score $compass_count tb_data run data get entity @s SelectedItem.count 1',
    'execute if score $compass_reason tb_data matches 0 unless score $compass_count tb_data matches 1 run scoreboard players set $compass_reason tb_data 3',
    'execute if score $compass_reason tb_data matches 0 if data entity @s SelectedItem.components run scoreboard players set $compass_reason tb_data 6',
    'execute if score $compass_reason tb_data matches 0 unless items entity @s inventory.* minecraft:amethyst_shard run scoreboard players set $compass_reason tb_data 4',
    'execute if score $compass_reason tb_data matches 0 run function toybox:building/compass/prepare/' + slot,
    'execute if score $compass_reason tb_data matches 1 run tellraw @s {"translate":"message.toybox.compass.empty","fallback":"[Toybox] That chalk slot is empty.","color":"red"}',
    'execute if score $compass_reason tb_data matches 2 run tellraw @s {"translate":"message.toybox.compass.need_compass","fallback":"[Toybox] Hold a regular compass in your main hand.","color":"red"}',
    'execute if score $compass_reason tb_data matches 3 run tellraw @s {"translate":"message.toybox.compass.single","fallback":"[Toybox] Hold exactly one compass so no stacked compasses are lost.","color":"red"}',
    'execute if score $compass_reason tb_data matches 4 run tellraw @s {"translate":"message.toybox.compass.need_shard","fallback":"[Toybox] You need 1 amethyst shard to attune the compass.","color":"red"}',
    'execute if score $compass_reason tb_data matches 5 run tellraw @s {"translate":"message.toybox.compass.invalid_dimension","fallback":"[Toybox] That chalk slot has invalid dimension data; save it again.","color":"red"}',
    'execute if score $compass_reason tb_data matches 6 run tellraw @s {"translate":"message.toybox.compass.modified","fallback":"[Toybox] Use an unmodified compass; attuned or custom compasses are not overwritten.","color":"red"}',
  ]));

  write('data/toybox/function/building/compass/prepare/' + slot + '.mcfunction', lines([
    '# Scratch storage is shared only for this synchronous trigger call.',
    'data remove storage toybox:scratch compass',
    'data modify storage toybox:scratch compass set value {slot:' + slot + '}',
    'execute store result storage toybox:scratch compass.x int 1 run scoreboard players get @s tb_c' + slot + 'x',
    'execute store result storage toybox:scratch compass.y int 1 run scoreboard players get @s tb_c' + slot + 'y',
    'execute store result storage toybox:scratch compass.z int 1 run scoreboard players get @s tb_c' + slot + 'z',
    'execute store result storage toybox:scratch compass.dimension int 1 run scoreboard players get @s tb_c' + slot + 'd',
    'scoreboard players set $compass_applied tb_data 0',
    'execute if score @s tb_c' + slot + 'd matches 0 run function toybox:building/compass/apply/overworld with storage toybox:scratch compass',
    'execute if score @s tb_c' + slot + 'd matches 1 run function toybox:building/compass/apply/nether with storage toybox:scratch compass',
    'execute if score @s tb_c' + slot + 'd matches 2 run function toybox:building/compass/apply/end with storage toybox:scratch compass',
    'execute if score $compass_applied tb_data matches 1 run clear @s minecraft:amethyst_shard 1',
    'execute if score $compass_applied tb_data matches 1 run playsound minecraft:item.lodestone_compass.lock player @s ~ ~ ~ 0.8 1.2',
    'execute if score $compass_applied tb_data matches 1 run particle minecraft:end_rod ~ ~1 ~ 0.15 0.25 0.15 0.01 8 force @s',
    'execute if score $compass_applied tb_data matches 1 run tellraw @s {"translate":"message.toybox.compass.success","fallback":"[Toybox] Compass attuned to chalk slot %s at %s, %s, %s.","color":"aqua","with":["' + slot + '",{"score":{"name":"@s","objective":"tb_c' + slot + 'x"}},{"score":{"name":"@s","objective":"tb_c' + slot + 'y"}},{"score":{"name":"@s","objective":"tb_c' + slot + 'z"}}]}',
    'execute if score $compass_applied tb_data matches 0 run tellraw @s {"translate":"message.toybox.compass.apply_failed","fallback":"[Toybox] The compass could not be attuned; no amethyst was consumed.","color":"red"}',
    'data remove storage toybox:scratch compass',
  ]));
}

for (const [dimensionId, dimensionName, dimensionFallback] of [
  ['overworld', 'overworld', 'Overworld'],
  ['nether', 'the_nether', 'Nether'],
  ['end', 'the_end', 'End'],
]) {
  write('data/toybox/function/building/compass/apply/' + dimensionId + '.mcfunction', lines([
    '$execute store success score $compass_applied tb_data run item replace entity @s weapon.mainhand with ' +
      compassItem(dimensionId, dimensionName, dimensionFallback),
  ]));
}

write('data/toybox/function/dev/survey_smoke.mcfunction', lines([
  '# Headless arithmetic and exact item-component assertions for v0.8.',
  'scoreboard players set $smoke_survey_fail tb_gid 0',
  'scoreboard players set $smoke_survey_geometry tb_gid 0',
  'scoreboard players set $smoke_survey_compass_forms tb_gid 0',
  'scoreboard players set $smoke_survey_compass_meta tb_gid 0',
  'scoreboard players set $smoke_survey_stack tb_gid 0',
  'scoreboard players set $smoke_survey_apply tb_gid 0',
  'scoreboard players set $smoke_survey_copy tb_gid 0',
  'execute unless data storage toybox:runtime {v080_objectives_initialized:1b} run scoreboard players add $smoke_survey_fail tb_gid 1',
  'execute unless score $pack tb_data matches 800 run scoreboard players add $smoke_survey_fail tb_gid 1',
  'scoreboard players set $abs_x tb_data 2',
  'scoreboard players set $abs_y tb_data 3',
  'scoreboard players set $abs_z tb_data 4',
  'function toybox:building/measure/geometry',
  'execute if score $span_x tb_data matches 3 if score $span_y tb_data matches 4 if score $span_z tb_data matches 5 if score $floor_area tb_data matches 15 if score $wall_area tb_data matches 64 if score $volume tb_data matches 60 if score $wall_ok tb_data matches 1 if score $volume_ok tb_data matches 1 run scoreboard players add $smoke_survey_geometry tb_gid 1',
  'scoreboard players set $abs_x tb_data 26000',
  'scoreboard players set $abs_y tb_data 26000',
  'scoreboard players set $abs_z tb_data 26000',
  'function toybox:building/measure/geometry',
  'execute if score $floor_area tb_data matches 676052001 if score $wall_ok tb_data matches 0 if score $volume_ok tb_data matches 0 run scoreboard players add $smoke_survey_geometry tb_gid 1',
  'execute unless score $smoke_survey_geometry tb_gid matches 2 run scoreboard players add $smoke_survey_fail tb_gid 1',
  'execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox.debug_survey]',
  'execute in minecraft:overworld run summon minecraft:armor_stand 0 100 0 {Tags:["toybox.debug_survey"],Invisible:1b,NoGravity:1b,Small:1b}',
  'execute in minecraft:overworld run setblock 1 100 0 minecraft:barrel',
  'data modify storage toybox:scratch compass set value {slot:3,x:12,y:64,z:-7,dimension:0}',
  'execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] run function toybox:building/compass/apply/overworld with storage toybox:scratch compass',
  'scoreboard players operation $smoke_survey_apply tb_gid += $compass_applied tb_data',
  'execute in minecraft:overworld store success score $compass_copied tb_data run item replace block 1 100 0 container.0 from entity @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] weapon.mainhand',
  'scoreboard players operation $smoke_survey_copy tb_gid += $compass_copied tb_data',
  'execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:lodestone_tracker"{target:{dimension:"minecraft:overworld",pos:[I;12,64,-7]},tracked:0b} run scoreboard players add $smoke_survey_compass_forms tb_gid 1',
  'data modify storage toybox:scratch compass.dimension set value 1',
  'execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] run function toybox:building/compass/apply/nether with storage toybox:scratch compass',
  'scoreboard players operation $smoke_survey_apply tb_gid += $compass_applied tb_data',
  'execute in minecraft:overworld store success score $compass_copied tb_data run item replace block 1 100 0 container.0 from entity @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] weapon.mainhand',
  'scoreboard players operation $smoke_survey_copy tb_gid += $compass_copied tb_data',
  'execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:lodestone_tracker"{target:{dimension:"minecraft:the_nether",pos:[I;12,64,-7]},tracked:0b} run scoreboard players add $smoke_survey_compass_forms tb_gid 1',
  'data modify storage toybox:scratch compass.dimension set value 2',
  'execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] run function toybox:building/compass/apply/end with storage toybox:scratch compass',
  'scoreboard players operation $smoke_survey_apply tb_gid += $compass_applied tb_data',
  'execute in minecraft:overworld store success score $compass_copied tb_data run item replace block 1 100 0 container.0 from entity @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] weapon.mainhand',
  'scoreboard players operation $smoke_survey_copy tb_gid += $compass_copied tb_data',
  'execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:lodestone_tracker"{target:{dimension:"minecraft:the_end",pos:[I;12,64,-7]},tracked:0b} run scoreboard players add $smoke_survey_compass_forms tb_gid 1',
  'execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:custom_name" run scoreboard players add $smoke_survey_compass_meta tb_gid 1',
  'execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:lore" run scoreboard players add $smoke_survey_compass_meta tb_gid 1',
  'execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:custom_data"{toybox:{chalk_compass:{version:1,slot:3,dimension:2,x:12,y:64,z:-7}}} run scoreboard players add $smoke_survey_compass_meta tb_gid 1',
  'execute in minecraft:overworld store result score $smoke_survey_stack tb_gid run data get block 1 100 0 Items[{Slot:0b}].components."minecraft:max_stack_size"',
  'execute if score $smoke_survey_stack tb_gid matches 1 run scoreboard players add $smoke_survey_compass_meta tb_gid 1',
  'execute unless score $smoke_survey_apply tb_gid matches 3 run scoreboard players add $smoke_survey_fail tb_gid 1',
  'execute unless score $smoke_survey_copy tb_gid matches 3 run scoreboard players add $smoke_survey_fail tb_gid 1',
  'execute unless score $smoke_survey_compass_forms tb_gid matches 3 run scoreboard players add $smoke_survey_fail tb_gid 1',
  'execute unless score $smoke_survey_compass_meta tb_gid matches 4 run scoreboard players add $smoke_survey_fail tb_gid 1',
  'data remove storage toybox:scratch compass',
  'execute in minecraft:overworld run setblock 1 100 0 minecraft:air',
  'execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox.debug_survey]',
  'execute in minecraft:overworld if entity @e[type=minecraft:armor_stand,tag=toybox.debug_survey] run scoreboard players add $smoke_survey_fail tb_gid 1',
]));

updateLanguage('en_us.json', {
  'pack.toybox.description': 'Realm Toybox v0.8.0-rc1 — Java 26.2',
  'item.toybox.chalk_compass': 'Chalk Compass %s',
  'item.toybox.chalk_compass.target': 'Slot %s: %s, %s, %s',
  'item.toybox.chalk_compass.dimension.overworld': 'Overworld target',
  'item.toybox.chalk_compass.dimension.nether': 'Nether target',
  'item.toybox.chalk_compass.dimension.end': 'End target',
  'message.toybox.enabled': '[Toybox] v0.8.0-rc1 enabled. Help: /trigger tb_help',
  'message.toybox.help.title': 'Realm Toybox v0.8.0-rc1 | Java 26.2',
  'message.toybox.help.measure': '• Measuring tape: start/end with /trigger tb_measure; also reports inclusive size, area, and safe volume',
  'message.toybox.help.compass': '• Chalk Compass: hold exactly one compass plus 1 amethyst, then /trigger tb_compass set 1..8',
  'message.toybox.measure.geometry': '[Toybox] Inclusive size %s × %s × %s | XZ footprint %s blocks',
  'message.toybox.measure.geometry_full': '[Toybox] Four-wall face area %s | inclusive volume %s blocks',
  'message.toybox.measure.geometry_wall_only': '[Toybox] Four-wall face area %s | volume omitted because it exceeds the safe score range',
  'message.toybox.measure.geometry_volume_only': '[Toybox] Four-wall face area omitted | inclusive volume %s blocks',
  'message.toybox.measure.geometry_too_large': '[Toybox] Four-wall face area and volume were omitted because they exceed the safe score range.',
  'message.toybox.compass.invalid_slot': '[Toybox] Compass target slot must be from 1 to 8.',
  'message.toybox.compass.empty': '[Toybox] That chalk slot is empty.',
  'message.toybox.compass.need_compass': '[Toybox] Hold a regular compass in your main hand.',
  'message.toybox.compass.single': '[Toybox] Hold exactly one compass so no stacked compasses are lost.',
  'message.toybox.compass.need_shard': '[Toybox] You need 1 amethyst shard to attune the compass.',
  'message.toybox.compass.invalid_dimension': '[Toybox] That chalk slot has invalid dimension data; save it again.',
  'message.toybox.compass.modified': '[Toybox] Use an unmodified compass; attuned or custom compasses are not overwritten.',
  'message.toybox.compass.apply_failed': '[Toybox] The compass could not be attuned; no amethyst was consumed.',
  'message.toybox.compass.success': '[Toybox] Compass attuned to chalk slot %s at %s, %s, %s.',
});

updateLanguage('ko_kr.json', {
  'pack.toybox.description': 'Realm Toybox v0.8.0-rc1 — Java 26.2',
  'item.toybox.chalk_compass': '분필 나침반 %s',
  'item.toybox.chalk_compass.target': '슬롯 %s: %s, %s, %s',
  'item.toybox.chalk_compass.dimension.overworld': '오버월드 목표',
  'item.toybox.chalk_compass.dimension.nether': '네더 목표',
  'item.toybox.chalk_compass.dimension.end': '엔드 목표',
  'message.toybox.enabled': '[Toybox] v0.8.0-rc1이 활성화되었습니다. 도움말: /trigger tb_help',
  'message.toybox.help.title': 'Realm Toybox v0.8.0-rc1 | Java 26.2',
  'message.toybox.help.measure': '• 줄자: /trigger tb_measure로 시작·끝 지정; 양 끝 포함 크기·면적·안전 범위 부피도 표시',
  'message.toybox.help.compass': '• 분필 나침반: 나침반 1개와 자수정 1개를 준비하고 /trigger tb_compass set 1..8',
  'message.toybox.measure.geometry': '[Toybox] 양 끝 포함 크기 %s × %s × %s | XZ 바닥 면적 %s블록',
  'message.toybox.measure.geometry_full': '[Toybox] 수직 4면 면적 %s | 양 끝 포함 부피 %s블록',
  'message.toybox.measure.geometry_wall_only': '[Toybox] 수직 4면 면적 %s | 부피는 안전한 점수 범위를 넘어 생략',
  'message.toybox.measure.geometry_volume_only': '[Toybox] 수직 4면 면적 생략 | 양 끝 포함 부피 %s블록',
  'message.toybox.measure.geometry_too_large': '[Toybox] 수직 4면 면적과 부피가 안전한 점수 범위를 넘어 생략되었습니다.',
  'message.toybox.compass.invalid_slot': '[Toybox] 나침반 목표 슬롯은 1부터 8까지입니다.',
  'message.toybox.compass.empty': '[Toybox] 해당 분필 슬롯은 비어 있습니다.',
  'message.toybox.compass.need_compass': '[Toybox] 주 손에 일반 나침반을 드세요.',
  'message.toybox.compass.single': '[Toybox] 겹친 나침반이 사라지지 않도록 정확히 1개만 드세요.',
  'message.toybox.compass.need_shard': '[Toybox] 나침반 각인에 자수정 조각 1개가 필요합니다.',
  'message.toybox.compass.invalid_dimension': '[Toybox] 분필 슬롯의 차원 정보가 잘못되었습니다. 다시 저장하세요.',
  'message.toybox.compass.modified': '[Toybox] 개조하지 않은 일반 나침반을 사용하세요. 각인·사용자 지정 나침반은 덮어쓰지 않습니다.',
  'message.toybox.compass.apply_failed': '[Toybox] 나침반을 각인하지 못했습니다. 자수정은 소모하지 않았습니다.',
  'message.toybox.compass.success': '[Toybox] 분필 슬롯 %s의 %s, %s, %s 위치를 나침반에 각인했습니다.',
});

console.log('Generated Realm Toybox v0.8 Surveyor Update.');
