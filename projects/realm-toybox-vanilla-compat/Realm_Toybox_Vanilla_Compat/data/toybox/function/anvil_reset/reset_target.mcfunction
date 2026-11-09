scoreboard players set $anvil_cost tb_data 0
execute store result score $anvil_cost tb_data run data get entity @s Item.components."minecraft:repair_cost"
execute if score $anvil_cost tb_data matches 1.. if entity @e[type=minecraft:item,tag=toybox.anvil_catalyst,distance=..1.5,limit=1] run function toybox:anvil_reset/reset_entity
