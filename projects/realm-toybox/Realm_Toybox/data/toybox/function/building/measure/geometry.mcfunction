# Inclusive cuboid dimensions: selecting one block produces 1 x 1 x 1.
scoreboard players operation $span_x tb_data = $abs_x tb_data
scoreboard players operation $span_y tb_data = $abs_y tb_data
scoreboard players operation $span_z tb_data = $abs_z tb_data
scoreboard players add $span_x tb_data 1
scoreboard players add $span_y tb_data 1
scoreboard players add $span_z tb_data 1
# Pairwise products are safe because every span is at most 26,001.
scoreboard players operation $floor_area tb_data = $span_x tb_data
scoreboard players operation $floor_area tb_data *= $span_z tb_data
scoreboard players operation $area_xy tb_data = $span_x tb_data
scoreboard players operation $area_xy tb_data *= $span_y tb_data
scoreboard players operation $area_yz tb_data = $span_y tb_data
scoreboard players operation $area_yz tb_data *= $span_z tb_data
# Four vertical face areas: 2 * (X*Y + Y*Z). Guard the final doubling.
scoreboard players operation $wall_half tb_data = $area_xy tb_data
scoreboard players operation $wall_half tb_data += $area_yz tb_data
scoreboard players set $wall_ok tb_data 1
execute if score $wall_half tb_data matches 1073741824.. run scoreboard players set $wall_ok tb_data 0
scoreboard players set $wall_area tb_data 0
scoreboard players set $two tb_data 2
execute if score $wall_ok tb_data matches 1 run scoreboard players operation $wall_area tb_data = $wall_half tb_data
execute if score $wall_ok tb_data matches 1 run scoreboard players operation $wall_area tb_data *= $two tb_data
# Inclusive volume: compare X*Y with floor(INT_MAX / Z) before multiplying.
scoreboard players set $int_max tb_data 2147483647
scoreboard players operation $volume_limit tb_data = $int_max tb_data
scoreboard players operation $volume_limit tb_data /= $span_z tb_data
scoreboard players set $volume_ok tb_data 0
execute if score $area_xy tb_data <= $volume_limit tb_data run scoreboard players set $volume_ok tb_data 1
scoreboard players set $volume tb_data 0
execute if score $volume_ok tb_data matches 1 run scoreboard players operation $volume tb_data = $area_xy tb_data
execute if score $volume_ok tb_data matches 1 run scoreboard players operation $volume tb_data *= $span_z tb_data
