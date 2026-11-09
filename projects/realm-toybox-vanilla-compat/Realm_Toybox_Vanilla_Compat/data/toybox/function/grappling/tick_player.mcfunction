# Only active players call this function.
execute unless score @s tb_gid matches 1.. run return run function toybox:grappling/cleanup
execute unless score @s tb_leave = @s tb_gleave run return run function toybox:grappling/cleanup
execute unless score @s tb_death = @s tb_gdeath run return run function toybox:grappling/cleanup
execute if entity @s[gamemode=spectator] run return run function toybox:grappling/cleanup
execute if predicate toybox:player/is_sneaking run return run function toybox:grappling/cleanup
execute if block ~ ~ ~ minecraft:lava run return run function toybox:grappling/cleanup
execute if block ~ ~1 ~ minecraft:lava run return run function toybox:grappling/cleanup
scoreboard players operation $current tb_gid = @s tb_gid
scoreboard players set $found tb_gid 0
scoreboard players set $moved tb_gid 0
scoreboard players set $arrived tb_gid 0
scoreboard players set $cancel tb_gid 0
tag @s add toybox.grappling_current
execute as @e[type=minecraft:fishing_bobber,tag=toybox.grappling_anchor,distance=..32] if score @s tb_gid = $current tb_gid at @s run function toybox:grappling/tick_anchor
tag @s remove toybox.grappling_current
execute if score $cancel tb_gid matches 1 run return run function toybox:grappling/cleanup
execute if score $arrived tb_gid matches 1 run return run function toybox:grappling/finish
execute if score $found tb_gid matches 0 run return run function toybox:grappling/cleanup
execute if score @s tb_gp matches 0 run return run function toybox:grappling/wait_player
execute if score $moved tb_gid matches 0 run return run function toybox:grappling/blocked
effect give @s minecraft:slow_falling 1 0 true
scoreboard players remove @s tb_gt 1
execute if score @s tb_gt matches ..0 run return run function toybox:grappling/cleanup
