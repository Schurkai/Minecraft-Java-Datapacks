# Built-in potion normalization and potency merge.
data remove storage toybox:scratch alchemy
scoreboard players set $invalid tb_data 0
scoreboard players set $reason tb_data 0
data modify storage toybox:scratch alchemy.main set value {components:{"minecraft:potion_contents":{potion:"minecraft:swiftness"}}}
data modify storage toybox:scratch alchemy.off set value {components:{"minecraft:potion_contents":{potion:"minecraft:swiftness"}}}
function toybox:alchemy/canonicalize/main
function toybox:alchemy/canonicalize/off
scoreboard players set $mode tb_data 1
scoreboard players set $merge_ok tb_data 0
function toybox:alchemy/merge/speed
execute unless score $merge_ok tb_data matches 1 run scoreboard players add $smoke_alchemy_fail tb_gid 1
scoreboard players set $smoke_amp tb_gid -1
scoreboard players set $smoke_duration tb_gid -1
execute store result score $smoke_amp tb_gid run data get storage toybox:scratch alchemy.merged.amplifier
execute store result score $smoke_duration tb_gid run data get storage toybox:scratch alchemy.merged.duration
scoreboard players operation $smoke_alchemy_builtin_amp tb_gid = $smoke_amp tb_gid
scoreboard players operation $smoke_alchemy_builtin_duration tb_gid = $smoke_duration tb_gid
execute unless score $smoke_amp tb_gid matches 1 run scoreboard players add $smoke_alchemy_fail tb_gid 1
execute unless score $smoke_duration tb_gid matches 2700 run scoreboard players add $smoke_alchemy_fail tb_gid 1
# Custom level IV inputs can reach V, and duration mode clamps at 72,000 ticks.
scoreboard players set $invalid tb_data 0
scoreboard players set $reason tb_data 0
data modify storage toybox:scratch alchemy.main set value {components:{"minecraft:potion_contents":{custom_effects:[{id:"minecraft:speed",amplifier:3,duration:40000}]}}}
data modify storage toybox:scratch alchemy.off set value {components:{"minecraft:potion_contents":{custom_effects:[{id:"minecraft:speed",amplifier:3,duration:40000}]}}}
function toybox:alchemy/canonicalize/main
function toybox:alchemy/canonicalize/off
scoreboard players set $mode tb_data 1
scoreboard players set $merge_ok tb_data 0
function toybox:alchemy/merge/speed
scoreboard players set $smoke_amp tb_gid -1
execute store result score $smoke_amp tb_gid run data get storage toybox:scratch alchemy.merged.amplifier
scoreboard players operation $smoke_alchemy_level tb_gid = $smoke_amp tb_gid
execute unless score $smoke_amp tb_gid matches 4 run scoreboard players add $smoke_alchemy_fail tb_gid 1
scoreboard players set $mode tb_data 2
scoreboard players set $merge_ok tb_data 0
function toybox:alchemy/merge/speed
scoreboard players set $smoke_duration tb_gid -1
execute store result score $smoke_duration tb_gid run data get storage toybox:scratch alchemy.merged.duration
scoreboard players operation $smoke_alchemy_cap tb_gid = $smoke_duration tb_gid
execute unless score $smoke_duration tb_gid matches 72000 run scoreboard players add $smoke_alchemy_fail tb_gid 1
# The one official built-in VI effect must be rejected by the V input/output cap.
scoreboard players set $invalid tb_data 0
scoreboard players set $reason tb_data 0
data modify storage toybox:scratch alchemy.main set value {components:{"minecraft:potion_contents":{potion:"minecraft:strong_turtle_master"}}}
function toybox:alchemy/canonicalize/main
scoreboard players operation $smoke_alchemy_reject tb_gid = $invalid tb_data
execute unless score $invalid tb_data matches 1 run scoreboard players add $smoke_alchemy_fail tb_gid 1
# Disjoint built-in effects must normalize and survive union construction.
data remove storage toybox:scratch alchemy
scoreboard players set $invalid tb_data 0
scoreboard players set $reason tb_data 0
data modify storage toybox:scratch alchemy.main set value {components:{"minecraft:potion_contents":{potion:"minecraft:night_vision"}}}
data modify storage toybox:scratch alchemy.off set value {components:{"minecraft:potion_contents":{potion:"minecraft:strength"}}}
function toybox:alchemy/canonicalize/main
function toybox:alchemy/canonicalize/off
scoreboard players set $total_effects tb_data 2
function toybox:alchemy/union/build
scoreboard players set $smoke_union_count tb_gid -1
execute store result score $smoke_union_count tb_gid run data get storage toybox:scratch alchemy.result_effects
execute unless score $smoke_union_count tb_gid matches 2 run scoreboard players add $smoke_alchemy_fail tb_gid 1
execute unless data storage toybox:scratch alchemy.result_effects[{id:"minecraft:night_vision"}] run scoreboard players add $smoke_alchemy_fail tb_gid 1
execute unless data storage toybox:scratch alchemy.result_effects[{id:"minecraft:strength"}] run scoreboard players add $smoke_alchemy_fail tb_gid 1
# Six disjoint effects must be rejected before any result or cost is applied.
data remove storage toybox:scratch alchemy
scoreboard players set $invalid tb_data 0
scoreboard players set $reason tb_data 0
data modify storage toybox:scratch alchemy.main set value {components:{"minecraft:potion_contents":{custom_effects:[{id:"minecraft:speed",amplifier:0,duration:1200},{id:"minecraft:strength",amplifier:0,duration:1200},{id:"minecraft:haste",amplifier:0,duration:1200}]}}}
data modify storage toybox:scratch alchemy.off set value {components:{"minecraft:potion_contents":{custom_effects:[{id:"minecraft:night_vision",amplifier:0,duration:1200},{id:"minecraft:luck",amplifier:0,duration:1200},{id:"minecraft:fire_resistance",amplifier:0,duration:1200}]}}}
function toybox:alchemy/canonicalize/main
function toybox:alchemy/canonicalize/off
execute if score $invalid tb_data matches 0 run function toybox:alchemy/decide
scoreboard players operation $smoke_six_reason tb_gid = $reason tb_data
execute unless score $smoke_six_reason tb_gid matches 4 run scoreboard players add $smoke_alchemy_fail tb_gid 1
# Execute all three dynamic result item commands, including the V/72,000 boundary.
data remove storage toybox:scratch alchemy
data modify storage toybox:scratch alchemy.output.contents set value {custom_color:9133302,custom_effects:[{id:"minecraft:speed",amplifier:4,duration:72000}]}
execute in minecraft:overworld run forceload add 0 0
execute in minecraft:overworld run setblock 0 100 0 minecraft:barrel
scoreboard players set $smoke_alchemy_forms tb_gid 0
execute in minecraft:overworld run function toybox:alchemy/dev_apply/potion with storage toybox:scratch alchemy.output
execute in minecraft:overworld unless data block 0 100 0 Items[{Slot:0b,id:"minecraft:potion"}] run scoreboard players add $smoke_alchemy_forms tb_gid 1
execute in minecraft:overworld run function toybox:alchemy/dev_apply/splash with storage toybox:scratch alchemy.output
execute in minecraft:overworld unless data block 0 100 0 Items[{Slot:0b,id:"minecraft:splash_potion"}] run scoreboard players add $smoke_alchemy_forms tb_gid 1
execute in minecraft:overworld run function toybox:alchemy/dev_apply/lingering with storage toybox:scratch alchemy.output
execute in minecraft:overworld unless data block 0 100 0 Items[{Slot:0b,id:"minecraft:lingering_potion"}] run scoreboard players add $smoke_alchemy_forms tb_gid 1
scoreboard players operation $smoke_alchemy_fail tb_gid += $smoke_alchemy_forms tb_gid
scoreboard players set $smoke_amp tb_gid -1
scoreboard players set $smoke_duration tb_gid -1
execute in minecraft:overworld store result score $smoke_amp tb_gid run data get block 0 100 0 Items[{Slot:0b}].components."minecraft:potion_contents".custom_effects[0].amplifier
execute in minecraft:overworld store result score $smoke_duration tb_gid run data get block 0 100 0 Items[{Slot:0b}].components."minecraft:potion_contents".custom_effects[0].duration
scoreboard players operation $smoke_alchemy_item_amp tb_gid = $smoke_amp tb_gid
scoreboard players operation $smoke_alchemy_item_duration tb_gid = $smoke_duration tb_gid
execute unless score $smoke_amp tb_gid matches 4 run scoreboard players add $smoke_alchemy_fail tb_gid 1
execute unless score $smoke_duration tb_gid matches 72000 run scoreboard players add $smoke_alchemy_fail tb_gid 1
scoreboard players set $smoke_alchemy_marker tb_gid 0
scoreboard players set $smoke_alchemy_name tb_gid 0
execute in minecraft:overworld if data block 0 100 0 Items[{Slot:0b}].components."minecraft:custom_data"{toybox:{mixed_potion:true}} run scoreboard players set $smoke_alchemy_marker tb_gid 1
execute in minecraft:overworld if data block 0 100 0 Items[{Slot:0b}].components."minecraft:custom_name" run scoreboard players set $smoke_alchemy_name tb_gid 1
execute unless score $smoke_alchemy_marker tb_gid matches 1 run scoreboard players add $smoke_alchemy_fail tb_gid 1
execute unless score $smoke_alchemy_name tb_gid matches 1 run scoreboard players add $smoke_alchemy_fail tb_gid 1
execute in minecraft:overworld run setblock 0 100 0 minecraft:air
execute in minecraft:overworld run forceload remove 0 0
data remove storage toybox:scratch alchemy
