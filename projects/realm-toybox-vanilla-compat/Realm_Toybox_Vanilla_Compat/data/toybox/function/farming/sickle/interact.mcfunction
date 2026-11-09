# using_item awards once; a short player-tag cooldown rearms it without a global entity scan.
scoreboard players set $sickle_hand tb_data -1
execute if items entity @s weapon.mainhand minecraft:iron_hoe[minecraft:custom_data~{toybox:{harvest_sickle:1b}}] run scoreboard players set $sickle_hand tb_data 0
execute unless score $sickle_hand tb_data matches 0 if items entity @s weapon.offhand minecraft:iron_hoe[minecraft:custom_data~{toybox:{harvest_sickle:1b}}] run scoreboard players set $sickle_hand tb_data 1
execute if score $sickle_hand tb_data matches 0..1 at @s run function toybox:farming/sickle/start
execute if score $sickle_hand tb_data matches 0..1 run scoreboard players set @s tb_scd 10
execute if score $sickle_hand tb_data matches 0..1 run tag @s add toybox.sickle_active
execute unless score $sickle_hand tb_data matches 0..1 run advancement revoke @s only toybox:interaction/sickle_use
