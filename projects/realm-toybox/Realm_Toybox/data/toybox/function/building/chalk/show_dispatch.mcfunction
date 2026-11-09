function toybox:building/current_dimension
execute if score @s tb_chshow matches 1 run function toybox:building/chalk/show/1
execute if score @s tb_chshow matches 2 run function toybox:building/chalk/show/2
execute if score @s tb_chshow matches 3 run function toybox:building/chalk/show/3
execute if score @s tb_chshow matches 4 run function toybox:building/chalk/show/4
execute if score @s tb_chshow matches 5 run function toybox:building/chalk/show/5
execute if score @s tb_chshow matches 6 run function toybox:building/chalk/show/6
execute if score @s tb_chshow matches 7 run function toybox:building/chalk/show/7
execute if score @s tb_chshow matches 8 run function toybox:building/chalk/show/8
execute unless score @s tb_chshow matches 1..8 run tellraw @s {"translate":"message.toybox.chalk.invalid_slot","fallback":"[Toybox] Chalk slot must be from 1 to 8.","color":"red"}
scoreboard players set @s tb_chshow 0
