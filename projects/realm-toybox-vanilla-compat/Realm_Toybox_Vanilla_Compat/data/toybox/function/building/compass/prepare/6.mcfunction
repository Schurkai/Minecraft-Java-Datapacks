# Scratch storage is shared only for this synchronous trigger call.
data remove storage toybox:scratch compass
data modify storage toybox:scratch compass set value {slot:6}
execute store result storage toybox:scratch compass.x int 1 run scoreboard players get @s tb_c6x
execute store result storage toybox:scratch compass.y int 1 run scoreboard players get @s tb_c6y
execute store result storage toybox:scratch compass.z int 1 run scoreboard players get @s tb_c6z
execute store result storage toybox:scratch compass.dimension int 1 run scoreboard players get @s tb_c6d
scoreboard players set $compass_applied tb_data 0
execute if score @s tb_c6d matches 0 run function toybox:building/compass/apply/overworld with storage toybox:scratch compass
execute if score @s tb_c6d matches 1 run function toybox:building/compass/apply/nether with storage toybox:scratch compass
execute if score @s tb_c6d matches 2 run function toybox:building/compass/apply/end with storage toybox:scratch compass
execute if score $compass_applied tb_data matches 1 run clear @s minecraft:amethyst_shard 1
execute if score $compass_applied tb_data matches 1 run playsound minecraft:item.lodestone_compass.lock player @s ~ ~ ~ 0.8 1.2
execute if score $compass_applied tb_data matches 1 run particle minecraft:end_rod ~ ~1 ~ 0.15 0.25 0.15 0.01 8 force @s
execute if score $compass_applied tb_data matches 1 run tellraw @s {"translate":"message.toybox.compass.success","fallback":"[Toybox] Compass attuned to chalk slot %s at %s, %s, %s.","color":"aqua","with":["6",{"score":{"name":"@s","objective":"tb_c6x"}},{"score":{"name":"@s","objective":"tb_c6y"}},{"score":{"name":"@s","objective":"tb_c6z"}}]}
execute if score $compass_applied tb_data matches 0 run tellraw @s {"translate":"message.toybox.compass.apply_failed","fallback":"[Toybox] The compass could not be attuned; no amethyst was consumed.","color":"red"}
data remove storage toybox:scratch compass
