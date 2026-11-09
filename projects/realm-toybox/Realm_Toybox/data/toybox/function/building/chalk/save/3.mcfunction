execute store result score @s tb_c3x run data get entity @s Pos[0] 1
execute store result score @s tb_c3y run data get entity @s Pos[1] 1
execute store result score @s tb_c3z run data get entity @s Pos[2] 1
scoreboard players operation @s tb_c3d = $current_dim tb_data
tellraw @s {"translate":"message.toybox.chalk.saved","fallback":"[Toybox] Chalk slot %s saved at %s, %s, %s.","color":"yellow","with":["3",{"score":{"name":"@s","objective":"tb_c3x"}},{"score":{"name":"@s","objective":"tb_c3y"}},{"score":{"name":"@s","objective":"tb_c3z"}}]}
