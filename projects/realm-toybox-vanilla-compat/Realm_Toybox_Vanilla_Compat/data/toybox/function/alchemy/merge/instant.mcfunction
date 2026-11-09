scoreboard players set $a_amp tb_data -999
scoreboard players set $b_amp tb_data -999
scoreboard players set $a_duration tb_data -999
scoreboard players set $b_duration tb_data -999
execute store result score $a_amp tb_data run data get storage toybox:scratch alchemy.a.amplifier
execute store result score $b_amp tb_data run data get storage toybox:scratch alchemy.b.amplifier
execute store result score $a_duration tb_data run data get storage toybox:scratch alchemy.a.duration
execute store result score $b_duration tb_data run data get storage toybox:scratch alchemy.b.duration
scoreboard players set $minus_one tb_data -1
scoreboard players operation $diff tb_data = $a_amp tb_data
scoreboard players operation $diff tb_data -= $b_amp tb_data
execute if score $diff tb_data matches ..-1 run scoreboard players operation $diff tb_data *= $minus_one tb_data
data modify storage toybox:scratch alchemy.merged set from storage toybox:scratch alchemy.a
execute if score $mode tb_data matches 1 if score $a_amp tb_data = $b_amp tb_data if score $a_amp tb_data matches 0..3 run scoreboard players set $merge_ok tb_data 1
execute if score $merge_ok tb_data matches 1 run scoreboard players operation $result_amp tb_data = $a_amp tb_data
execute if score $merge_ok tb_data matches 1 run scoreboard players add $result_amp tb_data 1
execute if score $merge_ok tb_data matches 1 run scoreboard players set $result_duration tb_data 1
execute if score $merge_ok tb_data matches 1 store result storage toybox:scratch alchemy.merged.amplifier int 1 run scoreboard players get $result_amp tb_data
execute if score $merge_ok tb_data matches 1 store result storage toybox:scratch alchemy.merged.duration int 1 run scoreboard players get $result_duration tb_data
