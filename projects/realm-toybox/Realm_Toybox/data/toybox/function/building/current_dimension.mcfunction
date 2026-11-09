scoreboard players set $current_dim tb_data -99
execute if dimension minecraft:overworld run scoreboard players set $current_dim tb_data 0
execute if dimension minecraft:the_nether run scoreboard players set $current_dim tb_data 1
execute if dimension minecraft:the_end run scoreboard players set $current_dim tb_data 2
