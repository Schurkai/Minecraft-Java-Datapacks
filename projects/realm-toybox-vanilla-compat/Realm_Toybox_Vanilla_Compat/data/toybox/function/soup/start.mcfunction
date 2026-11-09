# A shared user tag is safe because each function call completes synchronously.
tag @a[tag=toybox.soup_user] remove toybox.soup_user
tag @s add toybox.soup_user
scoreboard players set $soup_found tb_data 0
execute if score @s tb_soup matches 1..3 run function toybox:soup/find_cauldron
execute unless score @s tb_soup matches 1..3 run tellraw @s {"translate":"message.toybox.soup.invalid_action","fallback":"[Toybox] Soup Pot action must be 1, 2, or 3.","color":"red"}
execute if score @s tb_soup matches 1..3 if score $soup_found tb_data matches 0 run tellraw @s {"translate":"message.toybox.soup.no_cauldron","fallback":"[Toybox] Face an empty cauldron within 5 blocks.","color":"red"}
scoreboard players set @s tb_soup 0
tag @s remove toybox.soup_user
