# Runs as the casting player while preserving the new bobber position.
scoreboard players add $next tb_gid 1
execute if score $next tb_gid matches 2147483600.. unless entity @a[tag=toybox.grappling_active] unless entity @e[type=minecraft:fishing_bobber,tag=toybox.grappling_anchor] run scoreboard players set $next tb_gid 1
scoreboard players operation @s tb_gid = $next tb_gid
scoreboard players operation @e[type=minecraft:fishing_bobber,tag=toybox.grappling_new,distance=..1,sort=nearest,limit=1] tb_gid = $next tb_gid
tag @e[type=minecraft:fishing_bobber,tag=toybox.grappling_new,distance=..1,sort=nearest,limit=1] add toybox.grappling_anchor
tag @e[type=minecraft:fishing_bobber,tag=toybox.grappling_new,distance=..1,sort=nearest,limit=1] remove toybox.grappling_new
scoreboard players set @s tb_gt 100
scoreboard players set @s tb_gp 0
scoreboard players operation @s tb_gleave = @s tb_leave
scoreboard players operation @s tb_gdeath = @s tb_death
scoreboard players set $started tb_gid 1
tag @s add toybox.grappling_active
playsound minecraft:block.chain.place player @s ~ ~ ~ 0.55 1.6
