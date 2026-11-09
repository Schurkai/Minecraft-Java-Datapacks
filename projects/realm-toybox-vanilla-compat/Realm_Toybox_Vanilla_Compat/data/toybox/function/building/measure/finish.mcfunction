# All calculations use shared fake players, but one function call is synchronous.
function toybox:building/current_dimension
scoreboard players set $measure_reason tb_data 0
execute if score $current_dim tb_data matches -99 run scoreboard players set $measure_reason tb_data 1
execute if score $measure_reason tb_data matches 0 unless score $current_dim tb_data = @s tb_mdim run scoreboard players set $measure_reason tb_data 2
execute if score $measure_reason tb_data matches 0 store result score $tx tb_data run data get entity @s Pos[0] 1
execute if score $measure_reason tb_data matches 0 store result score $ty tb_data run data get entity @s Pos[1] 1
execute if score $measure_reason tb_data matches 0 store result score $tz tb_data run data get entity @s Pos[2] 1
scoreboard players operation $dx tb_data = $tx tb_data
scoreboard players operation $dx tb_data -= @s tb_mx
scoreboard players operation $dy tb_data = $ty tb_data
scoreboard players operation $dy tb_data -= @s tb_my
scoreboard players operation $dz tb_data = $tz tb_data
scoreboard players operation $dz tb_data -= @s tb_mz
scoreboard players set $negative_one tb_data -1
scoreboard players operation $abs_x tb_data = $dx tb_data
scoreboard players operation $abs_y tb_data = $dy tb_data
scoreboard players operation $abs_z tb_data = $dz tb_data
execute if score $abs_x tb_data matches ..-1 run scoreboard players operation $abs_x tb_data *= $negative_one tb_data
execute if score $abs_y tb_data matches ..-1 run scoreboard players operation $abs_y tb_data *= $negative_one tb_data
execute if score $abs_z tb_data matches ..-1 run scoreboard players operation $abs_z tb_data *= $negative_one tb_data
execute if score $measure_reason tb_data matches 0 if score $abs_x tb_data matches 26001.. run scoreboard players set $measure_reason tb_data 3
execute if score $measure_reason tb_data matches 0 if score $abs_y tb_data matches 26001.. run scoreboard players set $measure_reason tb_data 3
execute if score $measure_reason tb_data matches 0 if score $abs_z tb_data matches 26001.. run scoreboard players set $measure_reason tb_data 3
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $manhattan tb_data = $abs_x tb_data
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $manhattan tb_data += $abs_y tb_data
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $manhattan tb_data += $abs_z tb_data
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $distance2 tb_data = $abs_x tb_data
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $distance2 tb_data *= $abs_x tb_data
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $square tb_data = $abs_y tb_data
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $square tb_data *= $abs_y tb_data
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $distance2 tb_data += $square tb_data
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $square tb_data = $abs_z tb_data
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $square tb_data *= $abs_z tb_data
execute if score $measure_reason tb_data matches 0 run scoreboard players operation $distance2 tb_data += $square tb_data
execute if score $measure_reason tb_data matches 0 run function toybox:building/measure/sqrt
execute if score $measure_reason tb_data matches 0 run tellraw @s {"translate":"message.toybox.measure.result","fallback":"[Toybox] ΔX %s, ΔY %s, ΔZ %s | straight %s blocks | Manhattan %s blocks","color":"green","with":[{"score":{"name":"$dx","objective":"tb_data"}},{"score":{"name":"$dy","objective":"tb_data"}},{"score":{"name":"$dz","objective":"tb_data"}},{"score":{"name":"$distance","objective":"tb_data"}},{"score":{"name":"$manhattan","objective":"tb_data"}}]}
execute if score $measure_reason tb_data matches 0 run function toybox:building/measure/geometry
execute if score $measure_reason tb_data matches 0 run function toybox:building/measure/geometry_report
execute if score $measure_reason tb_data matches 0 run scoreboard players set @s tb_mstate 0
execute if score $measure_reason tb_data matches 1 run tellraw @s {"translate":"message.toybox.measure.unsupported_dimension","fallback":"[Toybox] Measuring is supported only in the Overworld, Nether, and End.","color":"red"}
execute if score $measure_reason tb_data matches 2 run tellraw @s {"translate":"message.toybox.measure.dimension_mismatch","fallback":"[Toybox] Return to the dimension containing the saved start point, or cancel with /trigger tb_measure set 2.","color":"red"}
execute if score $measure_reason tb_data matches 3 run tellraw @s {"translate":"message.toybox.measure.too_far","fallback":"[Toybox] Each coordinate difference must be at most 26,000 blocks.","color":"red"}
scoreboard players set @s tb_measure 0
