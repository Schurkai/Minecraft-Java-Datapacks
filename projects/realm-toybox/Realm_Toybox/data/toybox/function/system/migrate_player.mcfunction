execute if score @s tb_pver matches 0 run function toybox:player_init
execute if score @s tb_pver matches 1..399 if entity @s[tag=toybox.grappling_active] run function toybox:grappling/cleanup
execute if score @s tb_pver matches 1..399 run recipe give @s toybox:grappling_hook
execute if score @s tb_pver matches ..499 run function toybox:system/init_v050_player
execute if score @s tb_pver matches ..599 run function toybox:system/init_v060_player
execute if score @s tb_pver matches ..699 run function toybox:system/init_v070_player
execute if score @s tb_pver matches ..799 run function toybox:system/init_v080_player
execute if score @s tb_pver matches ..899 run function toybox:system/init_v090_player
execute if score @s tb_pver matches ..899 run recipe give @s toybox:harvest_sickle
scoreboard players set @s tb_gcd 0
scoreboard players set @s tb_rcd 0
scoreboard players set @s tb_gp 0
scoreboard players set @s tb_pver 900
tag @s remove toybox_v01
