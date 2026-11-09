data modify storage toybox:scratch alchemy.result_effects set value []
data modify storage toybox:scratch alchemy.current set from storage toybox:scratch alchemy.merged
scoreboard players set $potion_score tb_data 0
function toybox:alchemy/result/append_current
scoreboard players set $amethyst_cost tb_data 1
execute if score $result_amp tb_data matches 2.. run scoreboard players add $amethyst_cost tb_data 1
scoreboard players set $glowstone_cost tb_data 0
scoreboard players set $redstone_cost tb_data 0
execute if score $mode tb_data matches 1 run scoreboard players operation $glowstone_cost tb_data = $result_amp tb_data
execute if score $mode tb_data matches 1 if score $glowstone_cost tb_data matches ..0 run scoreboard players set $glowstone_cost tb_data 1
execute if score $mode tb_data matches 2 run scoreboard players operation $redstone_cost tb_data = $result_duration tb_data
execute if score $mode tb_data matches 2 run scoreboard players add $redstone_cost tb_data 17999
scoreboard players set $eighteen_thousand tb_data 18000
execute if score $mode tb_data matches 2 run scoreboard players operation $redstone_cost tb_data /= $eighteen_thousand tb_data
execute if score $redstone_cost tb_data matches 5.. run scoreboard players set $redstone_cost tb_data 4
function toybox:alchemy/cost/calculate_xp
function toybox:alchemy/finalize
