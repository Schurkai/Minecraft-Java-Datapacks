execute store result score @s tb_c2x run data get entity @s Pos[0] 1
execute store result score @s tb_c2y run data get entity @s Pos[1] 1
execute store result score @s tb_c2z run data get entity @s Pos[2] 1
scoreboard players operation @s tb_c2d = $current_dim tb_data
tellraw @s {"translate":"message.toybox.chalk.saved","fallback":"[Toybox] Chalk slot %s saved at %s, %s, %s.","color":"yellow","with":["2",{"score":{"name":"@s","objective":"tb_c2x"}},{"score":{"name":"@s","objective":"tb_c2y"}},{"score":{"name":"@s","objective":"tb_c2z"}}]}
