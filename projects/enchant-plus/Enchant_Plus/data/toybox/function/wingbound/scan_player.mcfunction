# Search only around the player who recently dropped an item.
tag @s add toybox.wingbound_scan_processing
execute as @e[type=minecraft:item,distance=..4,sort=nearest] at @s if block ~ ~-1 ~ minecraft:grindstone if items entity @s contents #toybox:wingbound_chestplates run function toybox:wingbound/separate
tag @s remove toybox.wingbound_scan_processing
