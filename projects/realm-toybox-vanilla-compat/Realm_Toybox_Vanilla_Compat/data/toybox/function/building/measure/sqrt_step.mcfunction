# Upper-mid binary search; 16 iterations cover the inclusive range 0..46340.
scoreboard players operation $mid tb_data = $lo tb_data
scoreboard players operation $mid tb_data += $hi tb_data
scoreboard players add $mid tb_data 1
scoreboard players operation $mid tb_data /= $two tb_data
scoreboard players operation $square tb_data = $mid tb_data
scoreboard players operation $square tb_data *= $mid tb_data
execute if score $square tb_data <= $distance2 tb_data run scoreboard players operation $lo tb_data = $mid tb_data
execute if score $square tb_data > $distance2 tb_data run scoreboard players operation $hi tb_data = $mid tb_data
execute if score $square tb_data > $distance2 tb_data run scoreboard players remove $hi tb_data 1
scoreboard players add $iter tb_data 1
execute if score $iter tb_data matches ..15 run function toybox:building/measure/sqrt_step
