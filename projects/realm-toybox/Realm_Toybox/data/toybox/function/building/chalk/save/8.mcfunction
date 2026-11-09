execute store result score @s tb_c8x run data get entity @s Pos[0] 1
execute store result score @s tb_c8y run data get entity @s Pos[1] 1
execute store result score @s tb_c8z run data get entity @s Pos[2] 1
scoreboard players operation @s tb_c8d = $current_dim tb_data
tellraw @s {"translate":"message.toybox.chalk.saved","fallback":"[Toybox] Chalk slot %s saved at %s, %s, %s.","color":"yellow","with":["8",{"score":{"name":"@s","objective":"tb_c8x"}},{"score":{"name":"@s","objective":"tb_c8y"}},{"score":{"name":"@s","objective":"tb_c8z"}}]}
