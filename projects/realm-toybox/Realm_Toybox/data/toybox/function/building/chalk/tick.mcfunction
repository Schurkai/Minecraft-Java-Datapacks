function toybox:building/current_dimension
scoreboard players set $chalk_alive tb_data 0
execute if score @s tb_cslot matches 1 if score @s tb_c1d = $current_dim tb_data run scoreboard players set $chalk_alive tb_data 1
execute if score @s tb_cslot matches 2 if score @s tb_c2d = $current_dim tb_data run scoreboard players set $chalk_alive tb_data 1
execute if score @s tb_cslot matches 3 if score @s tb_c3d = $current_dim tb_data run scoreboard players set $chalk_alive tb_data 1
execute if score @s tb_cslot matches 4 if score @s tb_c4d = $current_dim tb_data run scoreboard players set $chalk_alive tb_data 1
execute if score @s tb_cslot matches 5 if score @s tb_c5d = $current_dim tb_data run scoreboard players set $chalk_alive tb_data 1
execute if score @s tb_cslot matches 6 if score @s tb_c6d = $current_dim tb_data run scoreboard players set $chalk_alive tb_data 1
execute if score @s tb_cslot matches 7 if score @s tb_c7d = $current_dim tb_data run scoreboard players set $chalk_alive tb_data 1
execute if score @s tb_cslot matches 8 if score @s tb_c8d = $current_dim tb_data run scoreboard players set $chalk_alive tb_data 1
execute if score $chalk_alive tb_data matches 0 run function toybox:building/chalk/stop_dimension
execute if score $chalk_alive tb_data matches 1 if score @s tb_cslot matches 1 run function toybox:building/chalk/particle/1
execute if score $chalk_alive tb_data matches 1 if score @s tb_cslot matches 2 run function toybox:building/chalk/particle/2
execute if score $chalk_alive tb_data matches 1 if score @s tb_cslot matches 3 run function toybox:building/chalk/particle/3
execute if score $chalk_alive tb_data matches 1 if score @s tb_cslot matches 4 run function toybox:building/chalk/particle/4
execute if score $chalk_alive tb_data matches 1 if score @s tb_cslot matches 5 run function toybox:building/chalk/particle/5
execute if score $chalk_alive tb_data matches 1 if score @s tb_cslot matches 6 run function toybox:building/chalk/particle/6
execute if score $chalk_alive tb_data matches 1 if score @s tb_cslot matches 7 run function toybox:building/chalk/particle/7
execute if score $chalk_alive tb_data matches 1 if score @s tb_cslot matches 8 run function toybox:building/chalk/particle/8
execute if score $chalk_alive tb_data matches 1 run scoreboard players remove @s tb_cshow 1
execute if score @s tb_cshow matches 0 run scoreboard players set @s tb_cslot 0
