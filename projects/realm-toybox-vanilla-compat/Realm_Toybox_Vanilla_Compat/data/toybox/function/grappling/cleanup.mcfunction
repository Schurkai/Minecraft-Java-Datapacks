scoreboard players operation $current tb_gid = @s tb_gid
execute in minecraft:overworld as @e[type=minecraft:fishing_bobber,tag=toybox.grappling_anchor] if score @s tb_gid = $current tb_gid run kill @s
execute in minecraft:the_nether as @e[type=minecraft:fishing_bobber,tag=toybox.grappling_anchor] if score @s tb_gid = $current tb_gid run kill @s
execute in minecraft:the_end as @e[type=minecraft:fishing_bobber,tag=toybox.grappling_anchor] if score @s tb_gid = $current tb_gid run kill @s
tag @s remove toybox.grappling_active
tag @s remove toybox.grappling_current
scoreboard players set @s tb_gt 0
scoreboard players set @s tb_gp 0
scoreboard players set @s tb_gid 0
scoreboard players operation @s tb_gleave = @s tb_leave
scoreboard players operation @s tb_gdeath = @s tb_death
scoreboard players set @s tb_gcd 20
