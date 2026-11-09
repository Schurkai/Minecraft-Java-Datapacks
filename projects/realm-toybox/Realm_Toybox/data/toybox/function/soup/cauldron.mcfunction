scoreboard players set $soup_found tb_data 1
execute if score @s tb_soup matches 1 run function toybox:soup/load/check
execute if score @s tb_soup matches 2 run function toybox:soup/serve/check
execute if score @s tb_soup matches 3 run function toybox:soup/remove/check
