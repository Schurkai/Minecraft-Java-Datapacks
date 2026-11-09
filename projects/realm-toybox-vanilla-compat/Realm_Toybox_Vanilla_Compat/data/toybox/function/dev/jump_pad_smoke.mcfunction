scoreboard players set $smoke_pad_fail tb_gid 0
execute unless data storage toybox:runtime {v060_objectives_initialized:1b} run scoreboard players add $smoke_pad_fail tb_gid 1
execute in minecraft:overworld run forceload add 40 40
execute in minecraft:overworld run fill 40 100 40 40 106 40 minecraft:air
execute in minecraft:overworld run setblock 40 100 40 minecraft:yellow_glazed_terracotta
execute in minecraft:overworld run setblock 40 101 40 minecraft:heavy_weighted_pressure_plate
execute in minecraft:overworld unless block 40 100 40 minecraft:yellow_glazed_terracotta run scoreboard players add $smoke_pad_fail tb_gid 1
execute in minecraft:overworld unless block 40 101 40 minecraft:heavy_weighted_pressure_plate run scoreboard players add $smoke_pad_fail tb_gid 1
execute in minecraft:overworld positioned 40 101 40 unless block ~ ~1 ~ #toybox:jump_pad_clearance run scoreboard players add $smoke_pad_fail tb_gid 1
execute in minecraft:overworld positioned 40 101 40 unless block ~ ~5 ~ #toybox:jump_pad_clearance run scoreboard players add $smoke_pad_fail tb_gid 1
execute in minecraft:overworld run setblock 40 103 40 minecraft:stone
execute in minecraft:overworld positioned 40 101 40 if block ~ ~2 ~ #toybox:jump_pad_clearance run scoreboard players add $smoke_pad_fail tb_gid 1
execute in minecraft:overworld run fill 40 100 40 40 106 40 minecraft:air
execute in minecraft:overworld run forceload remove 40 40
