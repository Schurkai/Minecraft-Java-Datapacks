# Only a stored glider component proves that this chestplate can be separated.
scoreboard players set $wing_glider ep_data 0
execute if data entity @s Item.components."minecraft:glider" run scoreboard players set $wing_glider ep_data 1
scoreboard players set $wing_applied ep_data 0
execute if score $wing_glider ep_data matches 1 store success score $wing_applied ep_data run item modify entity @s contents toybox:remove_wingbound_components
scoreboard players set $wing_remaining ep_data 0
execute if data entity @s Item.components."minecraft:glider" run scoreboard players set $wing_remaining ep_data 1
execute if score $wing_applied ep_data matches 1 if score $wing_remaining ep_data matches 0 run function toybox:wingbound/finish
