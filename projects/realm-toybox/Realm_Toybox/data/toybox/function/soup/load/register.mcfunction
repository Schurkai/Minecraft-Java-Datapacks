# The marker is created before consumption; failed creation consumes nothing.
execute positioned ~0.5 ~0.5 ~0.5 run summon minecraft:marker ~ ~ ~ {Tags:["toybox.soup_pot","toybox.soup_new"]}
scoreboard players set $soup_registered tb_data 0
execute if entity @e[type=minecraft:marker,tag=toybox.soup_new,distance=..0.9,limit=1] run scoreboard players set $soup_registered tb_data 1
execute if score $soup_registered tb_data matches 1 run function toybox:soup/load/finalize
execute if score $soup_registered tb_data matches 0 run tellraw @s {"translate":"message.toybox.soup.load_failed","fallback":"[Toybox] Soup Pot registration failed; nothing was consumed.","color":"red"}
