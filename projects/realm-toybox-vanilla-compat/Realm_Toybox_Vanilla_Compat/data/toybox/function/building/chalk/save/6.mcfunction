execute store result score @s tb_c6x run data get entity @s Pos[0] 1
execute store result score @s tb_c6y run data get entity @s Pos[1] 1
execute store result score @s tb_c6z run data get entity @s Pos[2] 1
scoreboard players operation @s tb_c6d = $current_dim tb_data
tellraw @s {"translate":"message.toybox.chalk.saved","fallback":"[Toybox] Chalk slot %s saved at %s, %s, %s.","color":"yellow","with":["6",{"score":{"name":"@s","objective":"tb_c6x"}},{"score":{"name":"@s","objective":"tb_c6y"}},{"score":{"name":"@s","objective":"tb_c6z"}}]}
