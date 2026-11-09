execute store result score @s tb_c4x run data get entity @s Pos[0] 1
execute store result score @s tb_c4y run data get entity @s Pos[1] 1
execute store result score @s tb_c4z run data get entity @s Pos[2] 1
scoreboard players operation @s tb_c4d = $current_dim tb_data
tellraw @s {"translate":"message.toybox.chalk.saved","fallback":"[Toybox] Chalk slot %s saved at %s, %s, %s.","color":"yellow","with":["4",{"score":{"name":"@s","objective":"tb_c4x"}},{"score":{"name":"@s","objective":"tb_c4y"}},{"score":{"name":"@s","objective":"tb_c4z"}}]}
