# Search only item entities close to a player with an active Nether Star drop window.
tag @s add toybox.anvil_scan_processing
execute as @e[type=minecraft:item,distance=..4,sort=nearest] at @s if block ~ ~-1 ~ #minecraft:anvil if items entity @s contents minecraft:nether_star run function toybox:anvil_reset/scan_star
tag @s remove toybox.anvil_scan_processing
