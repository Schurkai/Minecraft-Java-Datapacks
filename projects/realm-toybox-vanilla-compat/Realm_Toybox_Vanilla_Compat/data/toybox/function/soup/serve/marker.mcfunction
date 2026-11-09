execute unless block ~ ~ ~ minecraft:cauldron run function toybox:soup/remove/broken
execute if block ~ ~ ~ minecraft:cauldron unless block ~ ~-1 ~ minecraft:campfire run function toybox:soup/remove/broken
execute if block ~ ~ ~ minecraft:cauldron if block ~ ~-1 ~ minecraft:campfire unless block ~ ~-1 ~ minecraft:campfire[lit=true] run tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.need_lit","fallback":"[Toybox] Relight the campfire before serving soup.","color":"red"}
scoreboard players set $soup_marker_valid tb_data 1
execute unless score @s tb_stype matches 1..3 run scoreboard players set $soup_marker_valid tb_data 0
execute unless score @s tb_sleft matches 1..4 run scoreboard players set $soup_marker_valid tb_data 0
execute if block ~ ~ ~ minecraft:cauldron if block ~ ~-1 ~ minecraft:campfire[lit=true] if score $soup_marker_valid tb_data matches 0 run function toybox:soup/remove/corrupt
execute if block ~ ~ ~ minecraft:cauldron if block ~ ~-1 ~ minecraft:campfire[lit=true] if score $soup_marker_valid tb_data matches 1 run function toybox:soup/serve/dispense
