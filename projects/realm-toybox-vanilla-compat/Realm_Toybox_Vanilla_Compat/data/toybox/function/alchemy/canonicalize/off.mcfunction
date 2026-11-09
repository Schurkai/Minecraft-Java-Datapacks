data modify storage toybox:scratch alchemy.off_effects set value {}
scoreboard players set $off_count tb_data 0
scoreboard players set $off_high tb_data 0
scoreboard players set $input_side tb_data 2
data modify storage toybox:scratch alchemy.input set from storage toybox:scratch alchemy.off
data modify storage toybox:scratch alchemy.queue set value []
function toybox:alchemy/canonicalize/base
