# Pair this catalyst with the nearest worked item resting on an anvil.
tag @s add toybox.anvil_catalyst
tag @e[type=minecraft:item,tag=toybox.anvil_candidate,distance=..1.5] remove toybox.anvil_candidate
execute as @e[type=minecraft:item,tag=!toybox.anvil_catalyst,distance=..1.5,sort=nearest] at @s if block ~ ~-1 ~ #minecraft:anvil if items entity @s contents *[minecraft:repair_cost] run tag @s add toybox.anvil_candidate
execute as @e[type=minecraft:item,tag=toybox.anvil_candidate,distance=..1.5,sort=nearest,limit=1] run function toybox:anvil_reset/reset_target
tag @e[type=minecraft:item,tag=toybox.anvil_candidate,distance=..1.5] remove toybox.anvil_candidate
tag @s remove toybox.anvil_catalyst
