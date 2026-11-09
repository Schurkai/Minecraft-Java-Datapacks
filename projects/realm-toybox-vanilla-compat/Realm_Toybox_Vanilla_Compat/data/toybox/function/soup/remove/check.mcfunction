execute unless entity @e[type=minecraft:marker,tag=toybox.soup_pot,distance=..0.9,limit=1] run tellraw @s {"translate":"message.toybox.soup.no_pot","fallback":"[Toybox] This cauldron is not a loaded Soup Pot.","color":"red"}
execute as @e[type=minecraft:marker,tag=toybox.soup_pot,distance=..0.9,limit=1,sort=nearest] at @s run function toybox:soup/remove/manual
