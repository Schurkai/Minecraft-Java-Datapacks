# Exact floor square root for a non-negative signed 32-bit score.
scoreboard players set $lo tb_data 0
scoreboard players set $hi tb_data 46340
scoreboard players set $two tb_data 2
scoreboard players set $iter tb_data 0
function toybox:building/measure/sqrt_step
scoreboard players operation $distance tb_data = $lo tb_data
