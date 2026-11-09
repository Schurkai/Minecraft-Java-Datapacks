scoreboard players set $cost_amp tb_data 0
scoreboard players set $cost_duration tb_data 1
execute store result score $cost_amp tb_data run data get storage toybox:scratch alchemy.current.amplifier
execute store result score $cost_duration tb_data run data get storage toybox:scratch alchemy.current.duration
scoreboard players add $cost_amp tb_data 1
scoreboard players operation $cost_term tb_data = $cost_amp tb_data
scoreboard players operation $cost_term tb_data *= $cost_amp tb_data
scoreboard players operation $duration_units tb_data = $cost_duration tb_data
scoreboard players set $twelve_hundred tb_data 1200
scoreboard players operation $duration_units tb_data /= $twelve_hundred tb_data
execute if score $duration_units tb_data matches ..0 run scoreboard players set $duration_units tb_data 1
scoreboard players operation $cost_term tb_data *= $duration_units tb_data
scoreboard players operation $potion_score tb_data += $cost_term tb_data
