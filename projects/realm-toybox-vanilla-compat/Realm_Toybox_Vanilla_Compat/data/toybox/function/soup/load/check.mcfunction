scoreboard players set $soup_reason tb_data 0
scoreboard players set $soup_type tb_data 0
scoreboard players set $soup_count tb_data 0
execute unless block ~ ~-1 ~ minecraft:campfire[lit=true] run scoreboard players set $soup_reason tb_data 1
execute if score $soup_reason tb_data matches 0 if entity @e[type=minecraft:marker,tag=toybox.soup_pot,distance=..0.9,limit=1] run scoreboard players set $soup_reason tb_data 2
execute if items entity @s weapon.mainhand minecraft:mushroom_stew run scoreboard players set $soup_type tb_data 1
execute if items entity @s weapon.mainhand minecraft:rabbit_stew run scoreboard players set $soup_type tb_data 2
execute if items entity @s weapon.mainhand minecraft:beetroot_soup run scoreboard players set $soup_type tb_data 3
execute if score $soup_reason tb_data matches 0 if score $soup_type tb_data matches 0 run scoreboard players set $soup_reason tb_data 3
execute if score $soup_reason tb_data matches 0 if score $soup_type tb_data matches 1 store result score $soup_count tb_data run clear @s minecraft:mushroom_stew 0
execute if score $soup_reason tb_data matches 0 if score $soup_type tb_data matches 2 store result score $soup_count tb_data run clear @s minecraft:rabbit_stew 0
execute if score $soup_reason tb_data matches 0 if score $soup_type tb_data matches 3 store result score $soup_count tb_data run clear @s minecraft:beetroot_soup 0
execute if score $soup_reason tb_data matches 0 unless score $soup_count tb_data matches 4.. run scoreboard players set $soup_reason tb_data 4
execute if score $soup_reason tb_data matches 0 if score $soup_total tb_data matches 64.. run scoreboard players set $soup_reason tb_data 5
execute if score $soup_reason tb_data matches 0 run function toybox:soup/load/register
execute if score $soup_reason tb_data matches 1 run tellraw @s {"translate":"message.toybox.soup.need_structure","fallback":"[Toybox] The empty cauldron needs a lit regular campfire directly below it.","color":"red"}
execute if score $soup_reason tb_data matches 2 run tellraw @s {"translate":"message.toybox.soup.occupied","fallback":"[Toybox] This cauldron already contains soup.","color":"red"}
execute if score $soup_reason tb_data matches 3 run tellraw @s {"translate":"message.toybox.soup.unsupported","fallback":"[Toybox] Hold mushroom stew, rabbit stew, or beetroot soup in your main hand.","color":"red"}
execute if score $soup_reason tb_data matches 4 run tellraw @s {"translate":"message.toybox.soup.need_four","fallback":"[Toybox] You need four soups of the held vanilla type.","color":"red"}
execute if score $soup_reason tb_data matches 5 run tellraw @s {"translate":"message.toybox.soup.cap","fallback":"[Toybox] The server-wide limit of 64 Soup Pots has been reached.","color":"red"}
