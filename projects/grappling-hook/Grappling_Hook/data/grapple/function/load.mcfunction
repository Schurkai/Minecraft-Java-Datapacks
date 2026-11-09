# Grappling Hook RC load. Storage keys make objective migrations quiet on /reload.
execute unless data storage grapple:runtime {objectives_initialized:1b} run function grapple:system/init_objectives
execute unless data storage grapple:runtime {movement_objectives_initialized:1b} run function grapple:system/init_movement_objectives
scoreboard players set $one gh_tmp 1
scoreboard players set $pack gh_tmp 101
data modify storage grapple:runtime data_version set value 2
tag @a remove grapple.current
execute as @a[scores={gh_state=1..}] at @s run function grapple:cleanup/reset
