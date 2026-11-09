# Headless proof for bounded ray hit, five-crop 3x3 harvest, durability, break, and cleanup.
scoreboard players set $smoke_sickle_fail tb_gid 0
scoreboard players set $smoke_sickle_raycast tb_gid 0
scoreboard players set $smoke_sickle_grid tb_gid 0
scoreboard players set $smoke_sickle_damage tb_gid 0
scoreboard players set $smoke_sickle_break tb_gid 0
scoreboard players set $smoke_sickle_setup tb_gid 0
scoreboard players set $smoke_sickle_ray_step tb_gid 0
scoreboard players set $smoke_sickle_ray_count tb_gid 0
scoreboard players set $smoke_sickle_plants tb_gid 0
scoreboard players set $smoke_sickle_grid_count tb_gid 0
scoreboard players set $sickle_damage_value tb_gid -1
execute unless data storage toybox:runtime {v090_objectives_initialized:1b} run scoreboard players add $smoke_sickle_fail tb_gid 1
execute unless score $pack tb_data matches 904 run scoreboard players add $smoke_sickle_fail tb_gid 1
execute in minecraft:overworld run forceload add -16 -16 15 15
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox.debug_sickle]
execute in minecraft:overworld run kill @e[type=minecraft:item,x=-2,y=98,z=-4,dx=6,dy=5,dz=8]
execute in minecraft:overworld run fill -2 98 -4 4 102 4 minecraft:air
execute in minecraft:overworld run setblock 0 99 3 minecraft:farmland[moisture=7]
execute in minecraft:overworld run setblock 0 100 3 minecraft:wheat[age=7]
execute in minecraft:overworld run summon minecraft:armor_stand 0.5 100 0.5 {Tags:["toybox.debug_sickle"],Invisible:1b,NoGravity:1b,Rotation:[0f,24f]}
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] weapon.mainhand with minecraft:iron_hoe[minecraft:custom_data={toybox:{harvest_sickle:1b}}]
execute in minecraft:overworld if block 0 100 3 minecraft:wheat[age=7] run scoreboard players add $smoke_sickle_setup tb_gid 1
execute in minecraft:overworld if entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] run scoreboard players add $smoke_sickle_setup tb_gid 1
execute in minecraft:overworld if items entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] weapon.mainhand minecraft:iron_hoe run scoreboard players add $smoke_sickle_setup tb_gid 1
scoreboard players set $sickle_hand tb_data 0
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] at @s run function toybox:farming/sickle/start
scoreboard players operation $smoke_sickle_ray_step tb_gid = $sickle_step tb_data
scoreboard players operation $smoke_sickle_ray_count tb_gid = $sickle_count tb_data
execute if score $sickle_found tb_data matches 1 if score $sickle_count tb_data matches 1 in minecraft:overworld unless block 0 100 3 #toybox:sickle_targets run scoreboard players set $smoke_sickle_raycast tb_gid 1
execute in minecraft:overworld store result score $sickle_damage_value tb_gid run data get entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] equipment.mainhand.components."minecraft:damage" 1
execute if score $sickle_damage_value tb_gid matches 1 run scoreboard players set $smoke_sickle_damage tb_gid 1
execute unless score $smoke_sickle_raycast tb_gid matches 1 run scoreboard players add $smoke_sickle_fail tb_gid 1
execute unless score $smoke_sickle_damage tb_gid matches 1 run scoreboard players add $smoke_sickle_fail tb_gid 1
execute in minecraft:overworld run kill @e[type=minecraft:item,x=-2,y=98,z=-4,dx=6,dy=5,dz=8]
# Keep the executor but move its hitbox out of the 3x3 block fixture.
execute in minecraft:overworld run tp @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] 0.5 103 0.5
execute in minecraft:overworld run setblock -1 99 -1 minecraft:farmland[moisture=7]
execute in minecraft:overworld run setblock 0 99 -1 minecraft:farmland[moisture=7]
execute in minecraft:overworld run setblock 1 99 -1 minecraft:farmland[moisture=7]
execute in minecraft:overworld run setblock -1 99 0 minecraft:farmland[moisture=7]
execute in minecraft:overworld run setblock 0 99 0 minecraft:farmland[moisture=7]
execute in minecraft:overworld run setblock 1 99 0 minecraft:farmland[moisture=7]
execute in minecraft:overworld run setblock -1 99 1 minecraft:soul_sand
execute in minecraft:overworld run setblock 0 99 1 minecraft:soul_sand
execute in minecraft:overworld run setblock 1 99 1 minecraft:soul_sand
execute in minecraft:overworld run setblock -1 100 -1 minecraft:wheat[age=7]
execute in minecraft:overworld run setblock 0 100 -1 minecraft:carrots[age=7]
execute in minecraft:overworld run setblock 1 100 -1 minecraft:potatoes[age=7]
execute in minecraft:overworld run setblock -1 100 0 minecraft:beetroots[age=3]
execute in minecraft:overworld run setblock 0 100 0 minecraft:wheat[age=7]
execute in minecraft:overworld run setblock 1 100 0 minecraft:carrots[age=7]
execute in minecraft:overworld run setblock -1 100 1 minecraft:nether_wart[age=3]
execute in minecraft:overworld run setblock 0 100 1 minecraft:nether_wart[age=3]
execute in minecraft:overworld run setblock 1 100 1 minecraft:nether_wart[age=3]
execute in minecraft:overworld if block -1 100 -1 minecraft:wheat[age=7] run scoreboard players add $smoke_sickle_plants tb_gid 1
execute in minecraft:overworld if block 0 100 -1 minecraft:carrots[age=7] run scoreboard players add $smoke_sickle_plants tb_gid 1
execute in minecraft:overworld if block 1 100 -1 minecraft:potatoes[age=7] run scoreboard players add $smoke_sickle_plants tb_gid 1
execute in minecraft:overworld if block -1 100 0 minecraft:beetroots[age=3] run scoreboard players add $smoke_sickle_plants tb_gid 1
execute in minecraft:overworld if block 0 100 0 minecraft:wheat[age=7] run scoreboard players add $smoke_sickle_plants tb_gid 1
execute in minecraft:overworld if block 1 100 0 minecraft:carrots[age=7] run scoreboard players add $smoke_sickle_plants tb_gid 1
execute in minecraft:overworld if block -1 100 1 minecraft:nether_wart[age=3] run scoreboard players add $smoke_sickle_plants tb_gid 1
execute in minecraft:overworld if block 0 100 1 minecraft:nether_wart[age=3] run scoreboard players add $smoke_sickle_plants tb_gid 1
execute in minecraft:overworld if block 1 100 1 minecraft:nether_wart[age=3] run scoreboard players add $smoke_sickle_plants tb_gid 1
scoreboard players set $sickle_count tb_data 0
scoreboard players set $sickle_hand tb_data 0
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] positioned 0 100 0 run function toybox:farming/sickle/harvest_grid
scoreboard players operation $smoke_sickle_grid_count tb_gid = $sickle_count tb_data
execute if score $sickle_count tb_data matches 9 in minecraft:overworld unless block -1 100 -1 #toybox:sickle_targets unless block 0 100 -1 #toybox:sickle_targets unless block 1 100 -1 #toybox:sickle_targets unless block -1 100 0 #toybox:sickle_targets unless block 0 100 0 #toybox:sickle_targets unless block 1 100 0 #toybox:sickle_targets unless block -1 100 1 #toybox:sickle_targets unless block 0 100 1 #toybox:sickle_targets unless block 1 100 1 #toybox:sickle_targets run scoreboard players set $smoke_sickle_grid tb_gid 1
execute unless score $smoke_sickle_grid tb_gid matches 1 run scoreboard players add $smoke_sickle_fail tb_gid 1
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] weapon.mainhand with minecraft:iron_hoe[minecraft:custom_data={toybox:{harvest_sickle:1b}},minecraft:damage=249]
execute in minecraft:overworld run setblock 0 99 0 minecraft:farmland[moisture=7]
execute in minecraft:overworld run setblock 0 100 0 minecraft:wheat[age=7]
scoreboard players set $sickle_count tb_data 0
scoreboard players set $sickle_hand tb_data 0
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] positioned 0 100 0 run function toybox:farming/sickle/harvest_one
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] at @s run function toybox:farming/sickle/finish
execute in minecraft:overworld unless items entity @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] weapon.mainhand * unless block 0 100 0 #toybox:sickle_targets run scoreboard players set $smoke_sickle_break tb_gid 1
execute unless score $smoke_sickle_break tb_gid matches 1 run scoreboard players add $smoke_sickle_fail tb_gid 1
execute in minecraft:overworld run setblock 0 99 0 minecraft:farmland[moisture=7]
execute in minecraft:overworld run setblock 0 100 0 minecraft:wheat[age=6]
scoreboard players set $sickle_count tb_data 0
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox.debug_sickle,limit=1] positioned 0 100 0 run function toybox:farming/sickle/harvest_one
execute unless score $sickle_count tb_data matches 0 run scoreboard players add $smoke_sickle_fail tb_gid 1
execute in minecraft:overworld unless block 0 100 0 minecraft:wheat[age=6] run scoreboard players add $smoke_sickle_fail tb_gid 1
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox.debug_sickle]
execute in minecraft:overworld run kill @e[type=minecraft:item,x=-2,y=98,z=-4,dx=6,dy=5,dz=8]
execute in minecraft:overworld run fill -2 98 -4 4 102 4 minecraft:air
execute in minecraft:overworld run forceload remove -16 -16 15 15
