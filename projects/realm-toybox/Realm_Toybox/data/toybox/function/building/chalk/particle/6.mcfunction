execute store result storage toybox:runtime chalk_marker.x int 1 run scoreboard players get @s tb_c6x
execute store result storage toybox:runtime chalk_marker.y int 1 run scoreboard players get @s tb_c6y
execute store result storage toybox:runtime chalk_marker.z int 1 run scoreboard players get @s tb_c6z
execute if score @s tb_c6d matches 0 run function toybox:building/chalk/particle_overworld with storage toybox:runtime chalk_marker
execute if score @s tb_c6d matches 1 run function toybox:building/chalk/particle_nether with storage toybox:runtime chalk_marker
execute if score @s tb_c6d matches 2 run function toybox:building/chalk/particle_end with storage toybox:runtime chalk_marker
data remove storage toybox:runtime chalk_marker
