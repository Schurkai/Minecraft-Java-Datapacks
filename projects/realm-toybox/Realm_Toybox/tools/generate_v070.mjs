import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Realm_Toybox.generate_v070';

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDir, '..');

function safePath(relative) {
  const target = path.resolve(root, relative);
  const boundary = root.endsWith(path.sep) ? root : root + path.sep;
  if (!target.startsWith(boundary)) throw new Error('Unsafe generated path: ' + target);
  return target;
}

function resetDir(relative) {
  const target = safePath(relative);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
}

function write(relative, source) {
  const target = safePath(relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source.endsWith('\n') ? source : source + '\n', 'utf8');
}

function lines(values) {
  return values.join('\n') + '\n';
}

resetDir('data/toybox/function/soup');

write('data/toybox/function/system/init_v070_objectives.mcfunction', lines([
  'scoreboard objectives add tb_soup trigger',
  'scoreboard objectives add tb_stype dummy',
  'scoreboard objectives add tb_sleft dummy',
  'scoreboard players add $soup_total tb_data 0',
  'data modify storage toybox:runtime v070_objectives_initialized set value 1b',
]));

write('data/toybox/function/system/init_v070_player.mcfunction', lines([
  'scoreboard players set @s tb_soup 0',
]));

write('data/toybox/function/soup/start.mcfunction', lines([
  '# A shared user tag is safe because each function call completes synchronously.',
  'tag @a[tag=toybox.soup_user] remove toybox.soup_user',
  'tag @s add toybox.soup_user',
  'scoreboard players set $soup_found tb_data 0',
  'execute if score @s tb_soup matches 1..3 run function toybox:soup/find_cauldron',
  'execute unless score @s tb_soup matches 1..3 run tellraw @s {"translate":"message.toybox.soup.invalid_action","fallback":"[Toybox] Soup Pot action must be 1, 2, or 3.","color":"red"}',
  'execute if score @s tb_soup matches 1..3 if score $soup_found tb_data matches 0 run tellraw @s {"translate":"message.toybox.soup.no_cauldron","fallback":"[Toybox] Face an empty cauldron within 5 blocks.","color":"red"}',
  'scoreboard players set @s tb_soup 0',
  'tag @s remove toybox.soup_user',
]));

const raySteps = Array.from({ length: 21 }, (_, index) => ((index + 1) * 0.25).toFixed(2));
write('data/toybox/function/soup/find_cauldron.mcfunction', lines([
  '# Bounded 0.25-block ray, from 0.25 through 5.25 blocks.',
  ...raySteps.map((step) =>
    'execute if score $soup_found tb_data matches 0 anchored eyes positioned ^ ^ ^' + step +
    ' align xyz if block ~ ~ ~ minecraft:cauldron run function toybox:soup/cauldron'
  ),
]));

write('data/toybox/function/soup/cauldron.mcfunction', lines([
  'scoreboard players set $soup_found tb_data 1',
  'execute if score @s tb_soup matches 1 run function toybox:soup/load/check',
  'execute if score @s tb_soup matches 2 run function toybox:soup/serve/check',
  'execute if score @s tb_soup matches 3 run function toybox:soup/remove/check',
]));

write('data/toybox/function/soup/load/check.mcfunction', lines([
  'scoreboard players set $soup_reason tb_data 0',
  'scoreboard players set $soup_type tb_data 0',
  'scoreboard players set $soup_count tb_data 0',
  'execute unless block ~ ~-1 ~ minecraft:campfire[lit=true] run scoreboard players set $soup_reason tb_data 1',
  'execute if score $soup_reason tb_data matches 0 if entity @e[type=minecraft:marker,tag=toybox.soup_pot,distance=..0.9,limit=1] run scoreboard players set $soup_reason tb_data 2',
  'execute if items entity @s weapon.mainhand minecraft:mushroom_stew run scoreboard players set $soup_type tb_data 1',
  'execute if items entity @s weapon.mainhand minecraft:rabbit_stew run scoreboard players set $soup_type tb_data 2',
  'execute if items entity @s weapon.mainhand minecraft:beetroot_soup run scoreboard players set $soup_type tb_data 3',
  'execute if score $soup_reason tb_data matches 0 if score $soup_type tb_data matches 0 run scoreboard players set $soup_reason tb_data 3',
  'execute if score $soup_reason tb_data matches 0 if score $soup_type tb_data matches 1 store result score $soup_count tb_data run clear @s minecraft:mushroom_stew 0',
  'execute if score $soup_reason tb_data matches 0 if score $soup_type tb_data matches 2 store result score $soup_count tb_data run clear @s minecraft:rabbit_stew 0',
  'execute if score $soup_reason tb_data matches 0 if score $soup_type tb_data matches 3 store result score $soup_count tb_data run clear @s minecraft:beetroot_soup 0',
  'execute if score $soup_reason tb_data matches 0 unless score $soup_count tb_data matches 4.. run scoreboard players set $soup_reason tb_data 4',
  'execute if score $soup_reason tb_data matches 0 if score $soup_total tb_data matches 64.. run scoreboard players set $soup_reason tb_data 5',
  'execute if score $soup_reason tb_data matches 0 run function toybox:soup/load/register',
  'execute if score $soup_reason tb_data matches 1 run tellraw @s {"translate":"message.toybox.soup.need_structure","fallback":"[Toybox] The empty cauldron needs a lit regular campfire directly below it.","color":"red"}',
  'execute if score $soup_reason tb_data matches 2 run tellraw @s {"translate":"message.toybox.soup.occupied","fallback":"[Toybox] This cauldron already contains soup.","color":"red"}',
  'execute if score $soup_reason tb_data matches 3 run tellraw @s {"translate":"message.toybox.soup.unsupported","fallback":"[Toybox] Hold mushroom stew, rabbit stew, or beetroot soup in your main hand.","color":"red"}',
  'execute if score $soup_reason tb_data matches 4 run tellraw @s {"translate":"message.toybox.soup.need_four","fallback":"[Toybox] You need four soups of the held vanilla type.","color":"red"}',
  'execute if score $soup_reason tb_data matches 5 run tellraw @s {"translate":"message.toybox.soup.cap","fallback":"[Toybox] The server-wide limit of 64 Soup Pots has been reached.","color":"red"}',
]));

write('data/toybox/function/soup/load/register.mcfunction', lines([
  '# The marker is created before consumption; failed creation consumes nothing.',
  'execute positioned ~0.5 ~0.5 ~0.5 run summon minecraft:marker ~ ~ ~ {Tags:["toybox.soup_pot","toybox.soup_new"]}',
  'scoreboard players set $soup_registered tb_data 0',
  'execute if entity @e[type=minecraft:marker,tag=toybox.soup_new,distance=..0.9,limit=1] run scoreboard players set $soup_registered tb_data 1',
  'execute if score $soup_registered tb_data matches 1 run function toybox:soup/load/finalize',
  'execute if score $soup_registered tb_data matches 0 run tellraw @s {"translate":"message.toybox.soup.load_failed","fallback":"[Toybox] Soup Pot registration failed; nothing was consumed.","color":"red"}',
]));

write('data/toybox/function/soup/load/finalize.mcfunction', lines([
  'scoreboard players set $soup_removed tb_data 0',
  'execute if score $soup_type tb_data matches 1 store result score $soup_removed tb_data run clear @s minecraft:mushroom_stew 4',
  'execute if score $soup_type tb_data matches 2 store result score $soup_removed tb_data run clear @s minecraft:rabbit_stew 4',
  'execute if score $soup_type tb_data matches 3 store result score $soup_removed tb_data run clear @s minecraft:beetroot_soup 4',
  'execute if score $soup_removed tb_data matches 4 run scoreboard players operation @e[type=minecraft:marker,tag=toybox.soup_new,distance=..0.9,limit=1] tb_stype = $soup_type tb_data',
  'execute if score $soup_removed tb_data matches 4 run scoreboard players set @e[type=minecraft:marker,tag=toybox.soup_new,distance=..0.9,limit=1] tb_sleft 4',
  'execute if score $soup_removed tb_data matches 4 run tag @e[type=minecraft:marker,tag=toybox.soup_new,distance=..0.9,limit=1] remove toybox.soup_new',
  'execute if score $soup_removed tb_data matches 4 run scoreboard players add $soup_total tb_data 1',
  'execute if score $soup_removed tb_data matches 4 run particle minecraft:happy_villager ~0.5 ~0.8 ~0.5 0.25 0.2 0.25 0.02 8 force @s',
  'execute if score $soup_removed tb_data matches 4 run playsound minecraft:block.campfire.crackle player @s ~ ~ ~ 0.8 1.1',
  'execute if score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 1 run tellraw @s {"translate":"message.toybox.soup.loaded_mushroom","fallback":"[Toybox] Mushroom Stew Pot loaded with 4 servings.","color":"gold"}',
  'execute if score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 2 run tellraw @s {"translate":"message.toybox.soup.loaded_rabbit","fallback":"[Toybox] Rabbit Stew Pot loaded with 4 servings.","color":"gold"}',
  'execute if score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 3 run tellraw @s {"translate":"message.toybox.soup.loaded_beetroot","fallback":"[Toybox] Beetroot Soup Pot loaded with 4 servings.","color":"gold"}',
  '# Defensive rollback: the precheck and clear are synchronous, but return any partial removal if a command fails unexpectedly.',
  'execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 1 if score $soup_removed tb_data matches 1 run give @s minecraft:mushroom_stew 1',
  'execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 1 if score $soup_removed tb_data matches 2 run give @s minecraft:mushroom_stew 2',
  'execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 1 if score $soup_removed tb_data matches 3 run give @s minecraft:mushroom_stew 3',
  'execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 2 if score $soup_removed tb_data matches 1 run give @s minecraft:rabbit_stew 1',
  'execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 2 if score $soup_removed tb_data matches 2 run give @s minecraft:rabbit_stew 2',
  'execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 2 if score $soup_removed tb_data matches 3 run give @s minecraft:rabbit_stew 3',
  'execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 3 if score $soup_removed tb_data matches 1 run give @s minecraft:beetroot_soup 1',
  'execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 3 if score $soup_removed tb_data matches 2 run give @s minecraft:beetroot_soup 2',
  'execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 3 if score $soup_removed tb_data matches 3 run give @s minecraft:beetroot_soup 3',
  'execute unless score $soup_removed tb_data matches 4 run kill @e[type=minecraft:marker,tag=toybox.soup_new,distance=..0.9,limit=1]',
  'execute unless score $soup_removed tb_data matches 4 run tellraw @s {"translate":"message.toybox.soup.load_failed","fallback":"[Toybox] Soup Pot registration failed; nothing was consumed.","color":"red"}',
]));

write('data/toybox/function/soup/serve/check.mcfunction', lines([
  'execute unless entity @e[type=minecraft:marker,tag=toybox.soup_pot,distance=..0.9,limit=1] run tellraw @s {"translate":"message.toybox.soup.no_pot","fallback":"[Toybox] This cauldron is not a loaded Soup Pot.","color":"red"}',
  'execute if entity @e[type=minecraft:marker,tag=toybox.soup_pot,distance=..0.9,limit=1] if items entity @s weapon.mainhand * run tellraw @s {"translate":"message.toybox.soup.empty_hand","fallback":"[Toybox] Empty your main hand before taking a serving.","color":"red"}',
  'execute if entity @e[type=minecraft:marker,tag=toybox.soup_pot,distance=..0.9,limit=1] unless items entity @s weapon.mainhand * as @e[type=minecraft:marker,tag=toybox.soup_pot,distance=..0.9,limit=1,sort=nearest] at @s run function toybox:soup/serve/marker',
]));

write('data/toybox/function/soup/serve/marker.mcfunction', lines([
  'execute unless block ~ ~ ~ minecraft:cauldron run function toybox:soup/remove/broken',
  'execute if block ~ ~ ~ minecraft:cauldron unless block ~ ~-1 ~ minecraft:campfire run function toybox:soup/remove/broken',
  'execute if block ~ ~ ~ minecraft:cauldron if block ~ ~-1 ~ minecraft:campfire unless block ~ ~-1 ~ minecraft:campfire[lit=true] run tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.need_lit","fallback":"[Toybox] Relight the campfire before serving soup.","color":"red"}',
  'scoreboard players set $soup_marker_valid tb_data 1',
  'execute unless score @s tb_stype matches 1..3 run scoreboard players set $soup_marker_valid tb_data 0',
  'execute unless score @s tb_sleft matches 1..4 run scoreboard players set $soup_marker_valid tb_data 0',
  'execute if block ~ ~ ~ minecraft:cauldron if block ~ ~-1 ~ minecraft:campfire[lit=true] if score $soup_marker_valid tb_data matches 0 run function toybox:soup/remove/corrupt',
  'execute if block ~ ~ ~ minecraft:cauldron if block ~ ~-1 ~ minecraft:campfire[lit=true] if score $soup_marker_valid tb_data matches 1 run function toybox:soup/serve/dispense',
]));

write('data/toybox/function/soup/serve/dispense.mcfunction', lines([
  'scoreboard players set $soup_given tb_data 0',
  'execute if score @s tb_stype matches 1 store success score $soup_given tb_data run item replace entity @a[tag=toybox.soup_user,limit=1] weapon.mainhand with minecraft:mushroom_stew',
  'execute if score @s tb_stype matches 2 store success score $soup_given tb_data run item replace entity @a[tag=toybox.soup_user,limit=1] weapon.mainhand with minecraft:rabbit_stew',
  'execute if score @s tb_stype matches 3 store success score $soup_given tb_data run item replace entity @a[tag=toybox.soup_user,limit=1] weapon.mainhand with minecraft:beetroot_soup',
  'execute if score $soup_given tb_data matches 1 run scoreboard players remove @s tb_sleft 1',
  'execute if score $soup_given tb_data matches 1 run scoreboard players operation $soup_left tb_data = @s tb_sleft',
  'execute if score $soup_given tb_data matches 1 run tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.served","fallback":"[Toybox] Serving taken. %s remain.","color":"green","with":[{"score":{"name":"$soup_left","objective":"tb_data"}}]}',
  'execute if score $soup_given tb_data matches 1 run particle minecraft:smoke ~ ~0.7 ~ 0.18 0.2 0.18 0.01 5 force @a[tag=toybox.soup_user,limit=1]',
  'execute if score $soup_given tb_data matches 1 run playsound minecraft:item.bowl.empty player @a[tag=toybox.soup_user,limit=1] ~ ~ ~ 0.8 1.0',
  'execute if score $soup_given tb_data matches 1 if score @s tb_sleft matches 0 run function toybox:soup/remove/empty',
  'execute if score $soup_given tb_data matches 0 run tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.serve_failed","fallback":"[Toybox] The serving could not be placed; no serving was consumed.","color":"red"}',
]));

write('data/toybox/function/soup/remove/check.mcfunction', lines([
  'execute unless entity @e[type=minecraft:marker,tag=toybox.soup_pot,distance=..0.9,limit=1] run tellraw @s {"translate":"message.toybox.soup.no_pot","fallback":"[Toybox] This cauldron is not a loaded Soup Pot.","color":"red"}',
  'execute as @e[type=minecraft:marker,tag=toybox.soup_pot,distance=..0.9,limit=1,sort=nearest] at @s run function toybox:soup/remove/manual',
]));

write('data/toybox/function/soup/remove/manual.mcfunction', lines([
  'execute if score $soup_total tb_data matches 1.. run scoreboard players remove $soup_total tb_data 1',
  'tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.removed","fallback":"[Toybox] Soup Pot removed. Remaining servings were discarded.","color":"gray"}',
  'particle minecraft:smoke ~ ~0.6 ~ 0.2 0.2 0.2 0.01 6 force @a[tag=toybox.soup_user,limit=1]',
  'kill @s',
]));

write('data/toybox/function/soup/remove/broken.mcfunction', lines([
  'execute if score $soup_total tb_data matches 1.. run scoreboard players remove $soup_total tb_data 1',
  'tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.broken","fallback":"[Toybox] The Soup Pot structure was broken, so its remaining servings were discarded.","color":"red"}',
  'kill @s',
]));

write('data/toybox/function/soup/remove/corrupt.mcfunction', lines([
  'execute if score $soup_total tb_data matches 1.. run scoreboard players remove $soup_total tb_data 1',
  'tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.corrupt","fallback":"[Toybox] Invalid Soup Pot data was removed without giving an item.","color":"red"}',
  'kill @s',
]));

write('data/toybox/function/soup/remove/empty.mcfunction', lines([
  'execute if score $soup_total tb_data matches 1.. run scoreboard players remove $soup_total tb_data 1',
  'kill @s',
]));

write('data/toybox/function/soup/remove/orphan.mcfunction', lines([
  'execute if score $soup_total tb_data matches 1.. run scoreboard players remove $soup_total tb_data 1',
  'kill @s',
]));

write('data/toybox/function/soup/maintenance.mcfunction', lines([
  '# At most 64 registered markers, checked once per five minutes and only while loaded.',
  'execute as @e[type=minecraft:marker,tag=toybox.soup_pot] at @s unless block ~ ~ ~ minecraft:cauldron run function toybox:soup/remove/orphan',
  'execute as @e[type=minecraft:marker,tag=toybox.soup_pot] at @s unless block ~ ~-1 ~ minecraft:campfire run function toybox:soup/remove/orphan',
  'schedule function toybox:soup/maintenance 6000t replace',
]));

write('data/toybox/function/dev/soup_smoke.mcfunction', lines([
  '# Destructive only inside the disposable automated server world.',
  'scoreboard players set $smoke_soup_fail tb_gid 0',
  'scoreboard players set $smoke_soup_structure tb_gid 0',
  'scoreboard players set $smoke_soup_marker tb_gid 0',
  'scoreboard players set $smoke_soup_type tb_gid -1',
  'scoreboard players set $smoke_soup_left tb_gid -1',
  'scoreboard players set $smoke_soup_total tb_gid -1',
  'scoreboard players set $smoke_soup_after tb_gid 0',
  'scoreboard players set $smoke_soup_summon tb_gid 0',
  'scoreboard players set $smoke_soup_maintenance tb_gid 0',
  'execute unless data storage toybox:runtime {v070_objectives_initialized:1b} run scoreboard players add $smoke_soup_fail tb_gid 1',
  'execute unless score $pack tb_data matches 700.. run scoreboard players add $smoke_soup_fail tb_gid 1',
  'execute in minecraft:overworld run forceload add 8 8',
  'execute in minecraft:overworld run kill @e[type=minecraft:marker,tag=toybox.debug_soup]',
  'execute in minecraft:overworld run fill 8 98 8 8 101 8 minecraft:air',
  'execute in minecraft:overworld run setblock 8 98 8 minecraft:stone',
  'execute in minecraft:overworld run setblock 8 99 8 minecraft:campfire[lit=true]',
  'execute in minecraft:overworld run setblock 8 100 8 minecraft:cauldron',
  'execute in minecraft:overworld store success score $smoke_soup_summon tb_gid run summon minecraft:marker 8.5 100.5 8.5 {Tags:["toybox.soup_pot","toybox.debug_soup"]}',
  'execute in minecraft:overworld run scoreboard players set @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_stype 2',
  'execute in minecraft:overworld run scoreboard players set @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_sleft 4',
  'scoreboard players set $soup_total tb_data 1',
  'execute in minecraft:overworld if block 8 99 8 minecraft:campfire[lit=true] run scoreboard players add $smoke_soup_structure tb_gid 1',
  'execute in minecraft:overworld if block 8 100 8 minecraft:cauldron run scoreboard players add $smoke_soup_structure tb_gid 1',
  'execute in minecraft:overworld if entity @e[type=minecraft:marker,tag=toybox.debug_soup,distance=0..,limit=1] run scoreboard players set $smoke_soup_marker tb_gid 1',
  'execute in minecraft:overworld run scoreboard players operation $smoke_soup_type tb_gid = @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_stype',
  'execute in minecraft:overworld run scoreboard players operation $smoke_soup_left tb_gid = @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_sleft',
  'execute in minecraft:overworld unless block 8 99 8 minecraft:campfire[lit=true] run scoreboard players add $smoke_soup_fail tb_gid 1',
  'execute in minecraft:overworld unless block 8 100 8 minecraft:cauldron run scoreboard players add $smoke_soup_fail tb_gid 1',
  'execute in minecraft:overworld unless entity @e[type=minecraft:marker,tag=toybox.debug_soup,distance=0..,limit=1] run scoreboard players add $smoke_soup_fail tb_gid 1',
  'execute in minecraft:overworld unless score @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_stype matches 2 run scoreboard players add $smoke_soup_fail tb_gid 1',
  'execute in minecraft:overworld unless score @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_sleft matches 4 run scoreboard players add $smoke_soup_fail tb_gid 1',
  'execute in minecraft:overworld as @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] at @s run function toybox:soup/remove/empty',
  'scoreboard players operation $smoke_soup_total tb_gid = $soup_total tb_data',
  'execute in minecraft:overworld if entity @e[type=minecraft:marker,tag=toybox.debug_soup,distance=0..,limit=1] run scoreboard players set $smoke_soup_after tb_gid 1',
  'execute unless score $soup_total tb_data matches 0 run scoreboard players add $smoke_soup_fail tb_gid 1',
  'execute in minecraft:overworld if entity @e[type=minecraft:marker,tag=toybox.debug_soup,distance=0..,limit=1] run scoreboard players add $smoke_soup_fail tb_gid 1',
  'execute in minecraft:overworld run summon minecraft:marker 8.5 100.5 8.5 {Tags:["toybox.soup_pot","toybox.debug_soup"]}',
  'scoreboard players set $soup_total tb_data 1',
  'execute in minecraft:overworld run setblock 8 100 8 minecraft:air',
  'function toybox:soup/maintenance',
  'execute if score $soup_total tb_data matches 0 in minecraft:overworld unless entity @e[type=minecraft:marker,tag=toybox.debug_soup,distance=0..,limit=1] run scoreboard players set $smoke_soup_maintenance tb_gid 1',
  'execute unless score $smoke_soup_maintenance tb_gid matches 1 run scoreboard players add $smoke_soup_fail tb_gid 1',
  'execute in minecraft:overworld run fill 8 98 8 8 101 8 minecraft:air',
  'execute in minecraft:overworld run forceload remove 8 8',
]));

console.log('Generated Realm Toybox v0.7 Soup Pot.');
