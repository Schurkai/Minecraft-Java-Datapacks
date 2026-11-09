scoreboard players operation $current gh_id = @s gh_id
execute as @e[type=minecraft:fishing_bobber,tag=grapple.anchor,distance=..35] if score @s gh_id = $current gh_id run kill @s
tag @s remove grapple.current
scoreboard players set @s gh_state 0
scoreboard players set @s gh_timer 0
scoreboard players set @s gh_id 0
scoreboard players set @s gh_block 0
