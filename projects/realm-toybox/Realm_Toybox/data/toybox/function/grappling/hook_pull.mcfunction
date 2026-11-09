particle minecraft:crit ~ ~ ~ 0.08 0.08 0.08 0.01 2 force
execute if entity @a[tag=toybox.grappling_current,distance=..2,limit=1] run scoreboard players set $arrived tb_gid 1
execute unless score $arrived tb_gid matches 1 at @a[tag=toybox.grappling_current,limit=1] if block ~ ~ ~ minecraft:water run function toybox:grappling/move_water
execute unless score $arrived tb_gid matches 1 at @a[tag=toybox.grappling_current,limit=1] unless block ~ ~ ~ minecraft:water run function toybox:grappling/move_air
