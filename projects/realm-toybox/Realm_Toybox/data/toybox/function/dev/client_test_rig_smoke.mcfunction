execute in minecraft:overworld run forceload add 32 32
execute in minecraft:overworld run fill 28 100 27 36 102 36 minecraft:air
execute in minecraft:overworld positioned 32 100 32 run function toybox:dev/client_test/build_here
scoreboard players set $client_rig_found tb_gid 0
scoreboard players operation $smoke_client_rig_shelves tb_gid = $client_kit_shelves tb_gid
execute unless score $smoke_client_rig_shelves tb_gid matches 60 run scoreboard players add $smoke_client_kit_fail tb_gid 1
execute in minecraft:overworld unless block 32 100 32 minecraft:enchanting_table run scoreboard players add $smoke_client_kit_fail tb_gid 1
execute in minecraft:overworld unless block 32 100 27 minecraft:brewing_stand run scoreboard players add $smoke_client_kit_fail tb_gid 1
execute in minecraft:overworld positioned 32 100 32 run function toybox:dev/client_test/cleanup_here
scoreboard players operation $smoke_client_cleanup_called tb_gid = $client_rig_found tb_gid
execute in minecraft:overworld positioned 32 100 32 run function toybox:advanced_enchant/count_shelves
scoreboard players operation $smoke_client_cleanup_shelves tb_gid = $shelves tb_data
execute unless score $smoke_client_cleanup_shelves tb_gid matches 0 run scoreboard players add $smoke_client_kit_fail tb_gid 1
execute in minecraft:overworld unless block 32 100 32 minecraft:air run scoreboard players add $smoke_client_kit_fail tb_gid 1
execute in minecraft:overworld unless block 32 100 27 minecraft:air run scoreboard players add $smoke_client_kit_fail tb_gid 1
execute in minecraft:overworld run forceload remove 32 32
