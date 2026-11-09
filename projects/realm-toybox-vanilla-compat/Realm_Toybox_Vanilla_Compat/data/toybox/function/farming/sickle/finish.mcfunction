scoreboard players set $sickle_break tb_data 0
execute if score $sickle_hand tb_data matches 0 if items entity @s weapon.mainhand minecraft:iron_hoe[minecraft:custom_data~{toybox:{harvest_sickle:1b}},minecraft:damage=249] run scoreboard players set $sickle_break tb_data 1
execute if score $sickle_hand tb_data matches 1 if items entity @s weapon.offhand minecraft:iron_hoe[minecraft:custom_data~{toybox:{harvest_sickle:1b}},minecraft:damage=249] run scoreboard players set $sickle_break tb_data 1
execute if score $sickle_break tb_data matches 0 if score $sickle_hand tb_data matches 0 run item modify entity @s weapon.mainhand toybox:farming/sickle_damage
execute if score $sickle_break tb_data matches 0 if score $sickle_hand tb_data matches 1 run item modify entity @s weapon.offhand toybox:farming/sickle_damage
execute if score $sickle_break tb_data matches 1 if score $sickle_hand tb_data matches 0 run item replace entity @s weapon.mainhand with minecraft:air
execute if score $sickle_break tb_data matches 1 if score $sickle_hand tb_data matches 1 run item replace entity @s weapon.offhand with minecraft:air
execute if score $sickle_break tb_data matches 1 at @s run playsound minecraft:entity.item.break player @a[distance=..16] ~ ~ ~ 0.8 1.0
execute at @s run playsound minecraft:block.crop.break player @a[distance=..16] ~ ~ ~ 0.7 1.1
execute at @s run particle minecraft:sweep_attack ~ ~1 ~ 0 0 0 0 1 force @a[distance=..16]
