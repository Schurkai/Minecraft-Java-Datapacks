scoreboard players set $missing tb_data 0
execute if score $amethyst_cost tb_data > $amethyst tb_data run scoreboard players set $missing tb_data 1
execute if score $glowstone_cost tb_data > $glowstone tb_data run scoreboard players set $missing tb_data 1
execute if score $redstone_cost tb_data > $redstone tb_data run scoreboard players set $missing tb_data 1
execute if score $gunpowder_cost tb_data > $gunpowder tb_data run scoreboard players set $missing tb_data 1
execute if score $dragon_cost tb_data > $dragon tb_data run scoreboard players set $missing tb_data 1
execute if score $xp_cost tb_data > $player_levels tb_data run scoreboard players set $missing tb_data 1
execute if score $missing tb_data matches 1 run scoreboard players set $reason tb_data 5
execute if score $missing tb_data matches 0 run data modify storage toybox:scratch alchemy.output.contents set value {custom_color:9133302,custom_effects:[]}
execute if score $missing tb_data matches 0 run data modify storage toybox:scratch alchemy.output.contents.custom_effects set from storage toybox:scratch alchemy.result_effects
execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.amethyst int 1 run scoreboard players get $amethyst_cost tb_data
execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.glowstone int 1 run scoreboard players get $glowstone_cost tb_data
execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.redstone int 1 run scoreboard players get $redstone_cost tb_data
execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.gunpowder int 1 run scoreboard players get $gunpowder_cost tb_data
execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.dragon int 1 run scoreboard players get $dragon_cost tb_data
execute if score $missing tb_data matches 0 store result storage toybox:scratch alchemy.output.xp int 1 run scoreboard players get $xp_cost tb_data
scoreboard players set $applied tb_data 0
execute if score $missing tb_data matches 0 if score $result_form tb_data matches 1 run function toybox:alchemy/apply/potion with storage toybox:scratch alchemy.output
execute if score $missing tb_data matches 0 if score $result_form tb_data matches 2 run function toybox:alchemy/apply/splash with storage toybox:scratch alchemy.output
execute if score $missing tb_data matches 0 if score $result_form tb_data matches 3 run function toybox:alchemy/apply/lingering with storage toybox:scratch alchemy.output
execute if score $missing tb_data matches 0 if score $applied tb_data matches 1 run function toybox:alchemy/consume with storage toybox:scratch alchemy.output
execute if score $missing tb_data matches 0 unless score $applied tb_data matches 1 run scoreboard players set $reason tb_data 6
