scoreboard players set $mode tb_data 3
scoreboard players set $glowstone_cost tb_data 0
scoreboard players set $redstone_cost tb_data 0
scoreboard players operation $amethyst_cost tb_data = $total_effects tb_data
scoreboard players operation $amethyst_cost tb_data += $main_high tb_data
scoreboard players operation $amethyst_cost tb_data += $off_high tb_data
function toybox:alchemy/union/build
function toybox:alchemy/finalize
