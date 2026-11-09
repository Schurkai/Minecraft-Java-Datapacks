# Try nearby items in distance order. Zero/default repair-cost items are skipped;
# the first item with a stored positive cost consumes exactly one catalyst.
tag @s add toybox.anvil_catalyst
scoreboard players set $anvil_done ep_data 0
execute as @e[type=minecraft:item,tag=!toybox.anvil_catalyst,distance=..1.5,sort=nearest] at @s if block ~ ~-1 ~ #minecraft:anvil run function toybox:anvil_reset/reset_target
tag @s remove toybox.anvil_catalyst
