scoreboard players set $soup_removed tb_data 0
execute if score $soup_type tb_data matches 1 store result score $soup_removed tb_data run clear @s minecraft:mushroom_stew 4
execute if score $soup_type tb_data matches 2 store result score $soup_removed tb_data run clear @s minecraft:rabbit_stew 4
execute if score $soup_type tb_data matches 3 store result score $soup_removed tb_data run clear @s minecraft:beetroot_soup 4
execute if score $soup_removed tb_data matches 4 run scoreboard players operation @e[type=minecraft:marker,tag=toybox.soup_new,distance=..0.9,limit=1] tb_stype = $soup_type tb_data
execute if score $soup_removed tb_data matches 4 run scoreboard players set @e[type=minecraft:marker,tag=toybox.soup_new,distance=..0.9,limit=1] tb_sleft 4
execute if score $soup_removed tb_data matches 4 run tag @e[type=minecraft:marker,tag=toybox.soup_new,distance=..0.9,limit=1] remove toybox.soup_new
execute if score $soup_removed tb_data matches 4 run scoreboard players add $soup_total tb_data 1
execute if score $soup_removed tb_data matches 4 run particle minecraft:happy_villager ~0.5 ~0.8 ~0.5 0.25 0.2 0.25 0.02 8 force @s
execute if score $soup_removed tb_data matches 4 run playsound minecraft:block.campfire.crackle player @s ~ ~ ~ 0.8 1.1
execute if score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 1 run tellraw @s {"translate":"message.toybox.soup.loaded_mushroom","fallback":"[Toybox] Mushroom Stew Pot loaded with 4 servings.","color":"gold"}
execute if score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 2 run tellraw @s {"translate":"message.toybox.soup.loaded_rabbit","fallback":"[Toybox] Rabbit Stew Pot loaded with 4 servings.","color":"gold"}
execute if score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 3 run tellraw @s {"translate":"message.toybox.soup.loaded_beetroot","fallback":"[Toybox] Beetroot Soup Pot loaded with 4 servings.","color":"gold"}
# Defensive rollback: the precheck and clear are synchronous, but return any partial removal if a command fails unexpectedly.
execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 1 if score $soup_removed tb_data matches 1 run give @s minecraft:mushroom_stew 1
execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 1 if score $soup_removed tb_data matches 2 run give @s minecraft:mushroom_stew 2
execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 1 if score $soup_removed tb_data matches 3 run give @s minecraft:mushroom_stew 3
execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 2 if score $soup_removed tb_data matches 1 run give @s minecraft:rabbit_stew 1
execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 2 if score $soup_removed tb_data matches 2 run give @s minecraft:rabbit_stew 2
execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 2 if score $soup_removed tb_data matches 3 run give @s minecraft:rabbit_stew 3
execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 3 if score $soup_removed tb_data matches 1 run give @s minecraft:beetroot_soup 1
execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 3 if score $soup_removed tb_data matches 2 run give @s minecraft:beetroot_soup 2
execute unless score $soup_removed tb_data matches 4 if score $soup_type tb_data matches 3 if score $soup_removed tb_data matches 3 run give @s minecraft:beetroot_soup 3
execute unless score $soup_removed tb_data matches 4 run kill @e[type=minecraft:marker,tag=toybox.soup_new,distance=..0.9,limit=1]
execute unless score $soup_removed tb_data matches 4 run tellraw @s {"translate":"message.toybox.soup.load_failed","fallback":"[Toybox] Soup Pot registration failed; nothing was consumed.","color":"red"}
