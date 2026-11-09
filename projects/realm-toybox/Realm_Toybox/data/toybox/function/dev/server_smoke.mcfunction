# Headless assertion: execute on origin must switch executor but preserve projectile position.
scoreboard players set $smoke_fail tb_gid 0
execute in minecraft:overworld run kill @e[type=minecraft:marker,tag=toybox.debug_origin_owner]
execute in minecraft:overworld run kill @e[type=minecraft:arrow,tag=toybox.debug_origin_projectile]
execute in minecraft:overworld run summon minecraft:marker 0 100 0 {Tags:["toybox.debug_origin_owner"]}
execute in minecraft:overworld run summon minecraft:arrow 10 100 0 {Tags:["toybox.debug_origin_projectile"]}
execute in minecraft:overworld run data modify entity @e[type=minecraft:arrow,tag=toybox.debug_origin_projectile,limit=1] Owner set from entity @e[type=minecraft:marker,tag=toybox.debug_origin_owner,limit=1] UUID
execute in minecraft:overworld as @e[type=minecraft:arrow,tag=toybox.debug_origin_projectile,limit=1] at @s on origin unless entity @s[tag=toybox.debug_origin_owner] run scoreboard players add $smoke_fail tb_gid 1
execute in minecraft:overworld as @e[type=minecraft:arrow,tag=toybox.debug_origin_projectile,limit=1] at @s on origin unless entity @e[type=minecraft:arrow,tag=toybox.debug_origin_projectile,distance=..0.01,limit=1] run scoreboard players add $smoke_fail tb_gid 1
execute in minecraft:overworld run kill @e[type=minecraft:marker,tag=toybox.debug_origin_owner]
execute in minecraft:overworld run kill @e[type=minecraft:arrow,tag=toybox.debug_origin_projectile]

# v0.9.0-rc1 migration/objective assertions.
execute unless data storage toybox:runtime {rc4_objectives_initialized:1b} run scoreboard players add $smoke_fail tb_gid 1
execute unless data storage toybox:runtime {v050_objectives_initialized:1b} run scoreboard players add $smoke_fail tb_gid 1
execute unless data storage toybox:runtime {v060_objectives_initialized:1b} run scoreboard players add $smoke_fail tb_gid 1
execute unless data storage toybox:runtime {v070_objectives_initialized:1b} run scoreboard players add $smoke_fail tb_gid 1
execute unless data storage toybox:runtime {v080_objectives_initialized:1b} run scoreboard players add $smoke_fail tb_gid 1
execute unless data storage toybox:runtime {v090_objectives_initialized:1b} run scoreboard players add $smoke_fail tb_gid 1
execute unless score $pack tb_data matches 900 run scoreboard players add $smoke_fail tb_gid 1

# v0.4 gameplay assertions execute generated item modifiers, storage processing,
# dynamic potion item macros, and the documented V/72,000-tick boundaries.
scoreboard players set $smoke_adv_fail tb_gid 0
scoreboard players set $smoke_alchemy_fail tb_gid 0
scoreboard players set $smoke_client_kit_fail tb_gid 0
scoreboard players set $smoke_building_fail tb_gid 0
scoreboard players set $smoke_pad_fail tb_gid 0
scoreboard players set $smoke_soup_fail tb_gid 0
scoreboard players set $smoke_survey_fail tb_gid 0
function toybox:dev/advanced_enchant_smoke
function toybox:dev/alchemy_smoke
function toybox:dev/client_test_rig_smoke
function toybox:dev/building_smoke
function toybox:dev/jump_pad_smoke
function toybox:dev/soup_smoke
function toybox:dev/sickle_smoke
function toybox:dev/survey_smoke
scoreboard players operation $smoke_fail tb_gid += $smoke_adv_fail tb_gid
scoreboard players operation $smoke_fail tb_gid += $smoke_alchemy_fail tb_gid
scoreboard players operation $smoke_fail tb_gid += $smoke_client_kit_fail tb_gid
scoreboard players operation $smoke_fail tb_gid += $smoke_building_fail tb_gid
scoreboard players operation $smoke_fail tb_gid += $smoke_pad_fail tb_gid
scoreboard players operation $smoke_fail tb_gid += $smoke_soup_fail tb_gid
scoreboard players operation $smoke_fail tb_gid += $smoke_sickle_fail tb_gid
scoreboard players operation $smoke_fail tb_gid += $smoke_survey_fail tb_gid
