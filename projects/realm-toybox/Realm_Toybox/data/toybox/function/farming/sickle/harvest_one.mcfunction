# Generate the block's own loot before replacing it, preserving vanilla Fortune behavior.
scoreboard players set $sickle_one tb_data 0
execute if block ~ ~ ~ minecraft:wheat[age=7] run scoreboard players set $sickle_one tb_data 1
execute if block ~ ~ ~ minecraft:carrots[age=7] run scoreboard players set $sickle_one tb_data 1
execute if block ~ ~ ~ minecraft:potatoes[age=7] run scoreboard players set $sickle_one tb_data 1
execute if block ~ ~ ~ minecraft:beetroots[age=3] run scoreboard players set $sickle_one tb_data 1
execute if block ~ ~ ~ minecraft:nether_wart[age=3] run scoreboard players set $sickle_one tb_data 1
execute if score $sickle_one tb_data matches 1 if score $sickle_hand tb_data matches 0 run loot spawn ~0.5 ~0.25 ~0.5 mine ~ ~ ~ mainhand
execute if score $sickle_one tb_data matches 1 if score $sickle_hand tb_data matches 1 run loot spawn ~0.5 ~0.25 ~0.5 mine ~ ~ ~ offhand
execute if score $sickle_one tb_data matches 1 run setblock ~ ~ ~ minecraft:air
execute if score $sickle_one tb_data matches 1 run scoreboard players add $sickle_count tb_data 1
