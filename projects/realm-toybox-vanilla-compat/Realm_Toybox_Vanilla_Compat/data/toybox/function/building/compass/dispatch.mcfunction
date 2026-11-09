execute if score @s tb_compass matches 1 run function toybox:building/compass/slot/1
execute if score @s tb_compass matches 2 run function toybox:building/compass/slot/2
execute if score @s tb_compass matches 3 run function toybox:building/compass/slot/3
execute if score @s tb_compass matches 4 run function toybox:building/compass/slot/4
execute if score @s tb_compass matches 5 run function toybox:building/compass/slot/5
execute if score @s tb_compass matches 6 run function toybox:building/compass/slot/6
execute if score @s tb_compass matches 7 run function toybox:building/compass/slot/7
execute if score @s tb_compass matches 8 run function toybox:building/compass/slot/8
execute unless score @s tb_compass matches 1..8 run tellraw @s {"translate":"message.toybox.compass.invalid_slot","fallback":"[Toybox] Compass target slot must be from 1 to 8.","color":"red"}
scoreboard players set @s tb_compass 0
