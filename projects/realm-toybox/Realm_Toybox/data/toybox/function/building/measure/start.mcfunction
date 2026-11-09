function toybox:building/current_dimension
execute if score $current_dim tb_data matches -99 run tellraw @s {"translate":"message.toybox.measure.unsupported_dimension","fallback":"[Toybox] Measuring is supported only in the Overworld, Nether, and End.","color":"red"}
execute unless score $current_dim tb_data matches -99 store result score @s tb_mx run data get entity @s Pos[0] 1
execute unless score $current_dim tb_data matches -99 store result score @s tb_my run data get entity @s Pos[1] 1
execute unless score $current_dim tb_data matches -99 store result score @s tb_mz run data get entity @s Pos[2] 1
execute unless score $current_dim tb_data matches -99 run scoreboard players operation @s tb_mdim = $current_dim tb_data
execute unless score $current_dim tb_data matches -99 run scoreboard players set @s tb_mstate 1
execute unless score $current_dim tb_data matches -99 run tellraw @s {"translate":"message.toybox.measure.start","fallback":"[Toybox] Measurement start saved at %s, %s, %s. Run the trigger again at the endpoint.","color":"aqua","with":[{"score":{"name":"@s","objective":"tb_mx"}},{"score":{"name":"@s","objective":"tb_my"}},{"score":{"name":"@s","objective":"tb_mz"}}]}
scoreboard players set @s tb_measure 0
