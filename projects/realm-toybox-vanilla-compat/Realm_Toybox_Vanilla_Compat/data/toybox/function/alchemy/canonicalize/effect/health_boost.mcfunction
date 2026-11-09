scoreboard players set $recognized tb_data 1
scoreboard players set $duplicate tb_data 0
execute if score $input_side tb_data matches 1 if data storage toybox:scratch alchemy.main_effects."minecraft:health_boost" run scoreboard players set $duplicate tb_data 1
execute if score $input_side tb_data matches 2 if data storage toybox:scratch alchemy.off_effects."minecraft:health_boost" run scoreboard players set $duplicate tb_data 1
execute if score $duplicate tb_data matches 1 run scoreboard players set $invalid tb_data 1
execute if score $duplicate tb_data matches 1 run scoreboard players set $reason tb_data 1
execute if score $duplicate tb_data matches 0 if score $input_side tb_data matches 1 run data modify storage toybox:scratch alchemy.main_effects."minecraft:health_boost" set from storage toybox:scratch alchemy.current
execute if score $duplicate tb_data matches 0 if score $input_side tb_data matches 2 run data modify storage toybox:scratch alchemy.off_effects."minecraft:health_boost" set from storage toybox:scratch alchemy.current
execute if score $duplicate tb_data matches 0 if score $input_side tb_data matches 1 run scoreboard players add $main_count tb_data 1
execute if score $duplicate tb_data matches 0 if score $input_side tb_data matches 2 run scoreboard players add $off_count tb_data 1
execute if score $duplicate tb_data matches 0 if score $amp tb_data matches 2.. if score $input_side tb_data matches 1 run scoreboard players add $main_high tb_data 1
execute if score $duplicate tb_data matches 0 if score $amp tb_data matches 2.. if score $input_side tb_data matches 2 run scoreboard players add $off_high tb_data 1
