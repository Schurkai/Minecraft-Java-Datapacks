# Runs as a fishing bobber spawned from the dedicated enchanted rod.
scoreboard players set $started tb_gid 0
tag @s add toybox.grappling_new
execute on origin if entity @s[type=minecraft:player,tag=!toybox.grappling_active,scores={tb_gcd=0}] run function toybox:grappling/start_player
execute if score $started tb_gid matches 0 run tag @s remove toybox.grappling_new
