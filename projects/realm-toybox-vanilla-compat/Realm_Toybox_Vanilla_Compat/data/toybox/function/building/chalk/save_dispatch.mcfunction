function toybox:building/current_dimension
execute if score $current_dim tb_data matches -99 run tellraw @s {"translate":"message.toybox.chalk.unsupported_dimension","fallback":"[Toybox] Chalk is supported only in the Overworld, Nether, and End.","color":"red"}
execute unless score $current_dim tb_data matches -99 if score @s tb_chalk matches 1 run function toybox:building/chalk/save/1
execute unless score $current_dim tb_data matches -99 if score @s tb_chalk matches 2 run function toybox:building/chalk/save/2
execute unless score $current_dim tb_data matches -99 if score @s tb_chalk matches 3 run function toybox:building/chalk/save/3
execute unless score $current_dim tb_data matches -99 if score @s tb_chalk matches 4 run function toybox:building/chalk/save/4
execute unless score $current_dim tb_data matches -99 if score @s tb_chalk matches 5 run function toybox:building/chalk/save/5
execute unless score $current_dim tb_data matches -99 if score @s tb_chalk matches 6 run function toybox:building/chalk/save/6
execute unless score $current_dim tb_data matches -99 if score @s tb_chalk matches 7 run function toybox:building/chalk/save/7
execute unless score $current_dim tb_data matches -99 if score @s tb_chalk matches 8 run function toybox:building/chalk/save/8
execute unless score @s tb_chalk matches 1..8 run tellraw @s {"translate":"message.toybox.chalk.invalid_slot","fallback":"[Toybox] Chalk slot must be from 1 to 8.","color":"red"}
scoreboard players set @s tb_chalk 0
