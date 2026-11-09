# Headless arithmetic and exact item-component assertions for v0.8.
scoreboard players set $smoke_survey_fail tb_gid 0
scoreboard players set $smoke_survey_geometry tb_gid 0
scoreboard players set $smoke_survey_compass_forms tb_gid 0
scoreboard players set $smoke_survey_compass_meta tb_gid 0
scoreboard players set $smoke_survey_stack tb_gid 0
scoreboard players set $smoke_survey_apply tb_gid 0
scoreboard players set $smoke_survey_copy tb_gid 0
execute unless data storage toybox:runtime {v080_objectives_initialized:1b} run scoreboard players add $smoke_survey_fail tb_gid 1
execute unless score $pack tb_data matches 904 run scoreboard players add $smoke_survey_fail tb_gid 1
scoreboard players set $abs_x tb_data 2
scoreboard players set $abs_y tb_data 3
scoreboard players set $abs_z tb_data 4
function toybox:building/measure/geometry
execute if score $span_x tb_data matches 3 if score $span_y tb_data matches 4 if score $span_z tb_data matches 5 if score $floor_area tb_data matches 15 if score $wall_area tb_data matches 64 if score $volume tb_data matches 60 if score $wall_ok tb_data matches 1 if score $volume_ok tb_data matches 1 run scoreboard players add $smoke_survey_geometry tb_gid 1
scoreboard players set $abs_x tb_data 26000
scoreboard players set $abs_y tb_data 26000
scoreboard players set $abs_z tb_data 26000
function toybox:building/measure/geometry
execute if score $floor_area tb_data matches 676052001 if score $wall_ok tb_data matches 0 if score $volume_ok tb_data matches 0 run scoreboard players add $smoke_survey_geometry tb_gid 1
execute unless score $smoke_survey_geometry tb_gid matches 2 run scoreboard players add $smoke_survey_fail tb_gid 1
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox.debug_survey]
execute in minecraft:overworld run summon minecraft:armor_stand 0 100 0 {Tags:["toybox.debug_survey"],Invisible:1b,NoGravity:1b,Small:1b}
execute in minecraft:overworld run setblock 1 100 0 minecraft:barrel
data modify storage toybox:scratch compass set value {slot:3,x:12,y:64,z:-7,dimension:0}
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] run function toybox:building/compass/apply/overworld with storage toybox:scratch compass
scoreboard players operation $smoke_survey_apply tb_gid += $compass_applied tb_data
execute in minecraft:overworld store success score $compass_copied tb_data run item replace block 1 100 0 container.0 from entity @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] weapon.mainhand
scoreboard players operation $smoke_survey_copy tb_gid += $compass_copied tb_data
execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:lodestone_tracker"{target:{dimension:"minecraft:overworld",pos:[I;12,64,-7]},tracked:0b} run scoreboard players add $smoke_survey_compass_forms tb_gid 1
data modify storage toybox:scratch compass.dimension set value 1
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] run function toybox:building/compass/apply/nether with storage toybox:scratch compass
scoreboard players operation $smoke_survey_apply tb_gid += $compass_applied tb_data
execute in minecraft:overworld store success score $compass_copied tb_data run item replace block 1 100 0 container.0 from entity @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] weapon.mainhand
scoreboard players operation $smoke_survey_copy tb_gid += $compass_copied tb_data
execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:lodestone_tracker"{target:{dimension:"minecraft:the_nether",pos:[I;12,64,-7]},tracked:0b} run scoreboard players add $smoke_survey_compass_forms tb_gid 1
data modify storage toybox:scratch compass.dimension set value 2
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] run function toybox:building/compass/apply/end with storage toybox:scratch compass
scoreboard players operation $smoke_survey_apply tb_gid += $compass_applied tb_data
execute in minecraft:overworld store success score $compass_copied tb_data run item replace block 1 100 0 container.0 from entity @e[type=minecraft:armor_stand,tag=toybox.debug_survey,limit=1] weapon.mainhand
scoreboard players operation $smoke_survey_copy tb_gid += $compass_copied tb_data
execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:lodestone_tracker"{target:{dimension:"minecraft:the_end",pos:[I;12,64,-7]},tracked:0b} run scoreboard players add $smoke_survey_compass_forms tb_gid 1
execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:custom_name" run scoreboard players add $smoke_survey_compass_meta tb_gid 1
execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:lore" run scoreboard players add $smoke_survey_compass_meta tb_gid 1
execute in minecraft:overworld if data block 1 100 0 Items[{Slot:0b}].components."minecraft:custom_data"{toybox:{chalk_compass:{version:1,slot:3,dimension:2,x:12,y:64,z:-7}}} run scoreboard players add $smoke_survey_compass_meta tb_gid 1
execute in minecraft:overworld store result score $smoke_survey_stack tb_gid run data get block 1 100 0 Items[{Slot:0b}].components."minecraft:max_stack_size"
execute if score $smoke_survey_stack tb_gid matches 1 run scoreboard players add $smoke_survey_compass_meta tb_gid 1
execute unless score $smoke_survey_apply tb_gid matches 3 run scoreboard players add $smoke_survey_fail tb_gid 1
execute unless score $smoke_survey_copy tb_gid matches 3 run scoreboard players add $smoke_survey_fail tb_gid 1
execute unless score $smoke_survey_compass_forms tb_gid matches 3 run scoreboard players add $smoke_survey_fail tb_gid 1
execute unless score $smoke_survey_compass_meta tb_gid matches 4 run scoreboard players add $smoke_survey_fail tb_gid 1
data remove storage toybox:scratch compass
execute in minecraft:overworld run setblock 1 100 0 minecraft:air
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox.debug_survey]
execute in minecraft:overworld if entity @e[type=minecraft:armor_stand,tag=toybox.debug_survey] run scoreboard players add $smoke_survey_fail tb_gid 1
