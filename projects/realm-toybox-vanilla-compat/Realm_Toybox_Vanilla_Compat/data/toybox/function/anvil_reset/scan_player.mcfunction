# Search only item entities close to the player whose inventory just changed.
execute as @e[type=minecraft:item,distance=..4,sort=nearest] at @s if block ~ ~-1 ~ #minecraft:anvil if items entity @s contents minecraft:nether_star run function toybox:anvil_reset/scan_star
