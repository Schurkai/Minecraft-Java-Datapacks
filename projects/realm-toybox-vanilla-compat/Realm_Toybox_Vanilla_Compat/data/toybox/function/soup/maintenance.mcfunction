# At most 64 registered markers, checked once per five minutes and only while loaded.
execute as @e[type=minecraft:marker,tag=toybox.soup_pot] at @s unless block ~ ~ ~ minecraft:cauldron run function toybox:soup/remove/orphan
execute as @e[type=minecraft:marker,tag=toybox.soup_pot] at @s unless block ~ ~-1 ~ minecraft:campfire run function toybox:soup/remove/orphan
schedule function toybox:soup/maintenance 6000t replace
