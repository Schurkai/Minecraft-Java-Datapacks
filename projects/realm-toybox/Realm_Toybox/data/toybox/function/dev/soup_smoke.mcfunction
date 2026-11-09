# Destructive only inside the disposable automated server world.
scoreboard players set $smoke_soup_fail tb_gid 0
scoreboard players set $smoke_soup_structure tb_gid 0
scoreboard players set $smoke_soup_marker tb_gid 0
scoreboard players set $smoke_soup_type tb_gid -1
scoreboard players set $smoke_soup_left tb_gid -1
scoreboard players set $smoke_soup_total tb_gid -1
scoreboard players set $smoke_soup_after tb_gid 0
scoreboard players set $smoke_soup_summon tb_gid 0
scoreboard players set $smoke_soup_maintenance tb_gid 0
execute unless data storage toybox:runtime {v070_objectives_initialized:1b} run scoreboard players add $smoke_soup_fail tb_gid 1
execute unless score $pack tb_data matches 700.. run scoreboard players add $smoke_soup_fail tb_gid 1
execute in minecraft:overworld run forceload add 8 8
execute in minecraft:overworld run kill @e[type=minecraft:marker,tag=toybox.debug_soup]
execute in minecraft:overworld run fill 8 98 8 8 101 8 minecraft:air
execute in minecraft:overworld run setblock 8 98 8 minecraft:stone
execute in minecraft:overworld run setblock 8 99 8 minecraft:campfire[lit=true]
execute in minecraft:overworld run setblock 8 100 8 minecraft:cauldron
execute in minecraft:overworld store success score $smoke_soup_summon tb_gid run summon minecraft:marker 8.5 100.5 8.5 {Tags:["toybox.soup_pot","toybox.debug_soup"]}
execute in minecraft:overworld run scoreboard players set @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_stype 2
execute in minecraft:overworld run scoreboard players set @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_sleft 4
scoreboard players set $soup_total tb_data 1
execute in minecraft:overworld if block 8 99 8 minecraft:campfire[lit=true] run scoreboard players add $smoke_soup_structure tb_gid 1
execute in minecraft:overworld if block 8 100 8 minecraft:cauldron run scoreboard players add $smoke_soup_structure tb_gid 1
execute in minecraft:overworld if entity @e[type=minecraft:marker,tag=toybox.debug_soup,distance=0..,limit=1] run scoreboard players set $smoke_soup_marker tb_gid 1
execute in minecraft:overworld run scoreboard players operation $smoke_soup_type tb_gid = @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_stype
execute in minecraft:overworld run scoreboard players operation $smoke_soup_left tb_gid = @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_sleft
execute in minecraft:overworld unless block 8 99 8 minecraft:campfire[lit=true] run scoreboard players add $smoke_soup_fail tb_gid 1
execute in minecraft:overworld unless block 8 100 8 minecraft:cauldron run scoreboard players add $smoke_soup_fail tb_gid 1
execute in minecraft:overworld unless entity @e[type=minecraft:marker,tag=toybox.debug_soup,distance=0..,limit=1] run scoreboard players add $smoke_soup_fail tb_gid 1
execute in minecraft:overworld unless score @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_stype matches 2 run scoreboard players add $smoke_soup_fail tb_gid 1
execute in minecraft:overworld unless score @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] tb_sleft matches 4 run scoreboard players add $smoke_soup_fail tb_gid 1
execute in minecraft:overworld as @e[type=minecraft:marker,tag=toybox.debug_soup,limit=1] at @s run function toybox:soup/remove/empty
scoreboard players operation $smoke_soup_total tb_gid = $soup_total tb_data
execute in minecraft:overworld if entity @e[type=minecraft:marker,tag=toybox.debug_soup,distance=0..,limit=1] run scoreboard players set $smoke_soup_after tb_gid 1
execute unless score $soup_total tb_data matches 0 run scoreboard players add $smoke_soup_fail tb_gid 1
execute in minecraft:overworld if entity @e[type=minecraft:marker,tag=toybox.debug_soup,distance=0..,limit=1] run scoreboard players add $smoke_soup_fail tb_gid 1
execute in minecraft:overworld run summon minecraft:marker 8.5 100.5 8.5 {Tags:["toybox.soup_pot","toybox.debug_soup"]}
scoreboard players set $soup_total tb_data 1
execute in minecraft:overworld run setblock 8 100 8 minecraft:air
function toybox:soup/maintenance
execute if score $soup_total tb_data matches 0 in minecraft:overworld unless entity @e[type=minecraft:marker,tag=toybox.debug_soup,distance=0..,limit=1] run scoreboard players set $smoke_soup_maintenance tb_gid 1
execute unless score $smoke_soup_maintenance tb_gid matches 1 run scoreboard players add $smoke_soup_fail tb_gid 1
execute in minecraft:overworld run fill 8 98 8 8 101 8 minecraft:air
execute in minecraft:overworld run forceload remove 8 8
