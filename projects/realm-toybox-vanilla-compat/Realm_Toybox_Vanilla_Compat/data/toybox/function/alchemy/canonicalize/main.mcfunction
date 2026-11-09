data modify storage toybox:scratch alchemy.main_effects set value {}
scoreboard players set $main_count tb_data 0
scoreboard players set $main_high tb_data 0
scoreboard players set $input_side tb_data 1
data modify storage toybox:scratch alchemy.input set from storage toybox:scratch alchemy.main
data modify storage toybox:scratch alchemy.queue set value []
function toybox:alchemy/canonicalize/base
