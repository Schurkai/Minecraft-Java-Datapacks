scoreboard players set $smoke_building_fail tb_gid 0
execute in minecraft:overworld run function toybox:building/current_dimension
execute unless score $current_dim tb_data matches 0 run scoreboard players add $smoke_building_fail tb_gid 1
execute in minecraft:the_nether run function toybox:building/current_dimension
execute unless score $current_dim tb_data matches 1 run scoreboard players add $smoke_building_fail tb_gid 1
execute in minecraft:the_end run function toybox:building/current_dimension
execute unless score $current_dim tb_data matches 2 run scoreboard players add $smoke_building_fail tb_gid 1
scoreboard players set $distance2 tb_data 0
function toybox:building/measure/sqrt
execute unless score $distance tb_data matches 0 run scoreboard players add $smoke_building_fail tb_gid 1
scoreboard players set $distance2 tb_data 169
function toybox:building/measure/sqrt
execute unless score $distance tb_data matches 13 run scoreboard players add $smoke_building_fail tb_gid 1
scoreboard players set $distance2 tb_data 2028000000
function toybox:building/measure/sqrt
execute unless score $distance tb_data matches 45033 run scoreboard players add $smoke_building_fail tb_gid 1
execute unless data storage toybox:runtime {v050_objectives_initialized:1b} run scoreboard players add $smoke_building_fail tb_gid 1
