scoreboard players set $compass_reason tb_data 0
execute if score @s tb_c8d matches -99 run scoreboard players set $compass_reason tb_data 1
execute if score $compass_reason tb_data matches 0 unless score @s tb_c8d matches 0..2 run scoreboard players set $compass_reason tb_data 5
execute if score $compass_reason tb_data matches 0 unless items entity @s weapon.mainhand minecraft:compass run scoreboard players set $compass_reason tb_data 2
scoreboard players set $compass_count tb_data 0
execute if score $compass_reason tb_data matches 0 store result score $compass_count tb_data run data get entity @s SelectedItem.count 1
execute if score $compass_reason tb_data matches 0 unless score $compass_count tb_data matches 1 run scoreboard players set $compass_reason tb_data 3
execute if score $compass_reason tb_data matches 0 if data entity @s SelectedItem.components run scoreboard players set $compass_reason tb_data 6
execute if score $compass_reason tb_data matches 0 unless items entity @s inventory.* minecraft:amethyst_shard run scoreboard players set $compass_reason tb_data 4
execute if score $compass_reason tb_data matches 0 run function toybox:building/compass/prepare/8
execute if score $compass_reason tb_data matches 1 run tellraw @s {"translate":"message.toybox.compass.empty","fallback":"[Toybox] That chalk slot is empty.","color":"red"}
execute if score $compass_reason tb_data matches 2 run tellraw @s {"translate":"message.toybox.compass.need_compass","fallback":"[Toybox] Hold a regular compass in your main hand.","color":"red"}
execute if score $compass_reason tb_data matches 3 run tellraw @s {"translate":"message.toybox.compass.single","fallback":"[Toybox] Hold exactly one compass so no stacked compasses are lost.","color":"red"}
execute if score $compass_reason tb_data matches 4 run tellraw @s {"translate":"message.toybox.compass.need_shard","fallback":"[Toybox] You need 1 amethyst shard to attune the compass.","color":"red"}
execute if score $compass_reason tb_data matches 5 run tellraw @s {"translate":"message.toybox.compass.invalid_dimension","fallback":"[Toybox] That chalk slot has invalid dimension data; save it again.","color":"red"}
execute if score $compass_reason tb_data matches 6 run tellraw @s {"translate":"message.toybox.compass.modified","fallback":"[Toybox] Use an unmodified compass; attuned or custom compasses are not overwritten.","color":"red"}
