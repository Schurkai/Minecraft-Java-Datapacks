# States: 2 flying, 3 pulling. Only the matching tagged bobber is processed.
execute if entity @s[gamemode=spectator] run return run function grapple:cleanup/fail
execute unless predicate grapple:player/pull_eligible run return run function grapple:cleanup/fail
execute if predicate grapple:player/is_sneaking run return run function grapple:cleanup/cancel
execute if block ~ ~ ~ minecraft:lava run return run function grapple:cleanup/fail
execute if block ~ ~1 ~ minecraft:lava run return run function grapple:cleanup/fail
scoreboard players operation $current gh_id = @s gh_id
scoreboard players set $found gh_tmp 0
scoreboard players set $cancel gh_tmp 0
scoreboard players set $contact gh_tmp 0
scoreboard players set $arrived gh_tmp 0
scoreboard players set $moved gh_tmp 0
tag @s add grapple.current
execute as @e[type=minecraft:fishing_bobber,tag=grapple.anchor,distance=..30] if score @s gh_id = $current gh_id at @s run function grapple:active/tick_anchor
tag @s remove grapple.current
execute if score $cancel gh_tmp matches 1 run return run function grapple:cleanup/fail
execute if score $arrived gh_tmp matches 1 run return run function grapple:cleanup/finish
execute if score $found gh_tmp matches 0 run return run function grapple:cleanup/fail
execute if score @s gh_state matches 3 if score $moved gh_tmp matches 0 run scoreboard players add @s gh_block 1
execute if score @s gh_state matches 3 if score $moved gh_tmp matches 1 run scoreboard players set @s gh_block 0
execute if score @s gh_block matches 4.. run return run function grapple:cleanup/blocked
execute if score @s gh_state matches 3 run effect give @s minecraft:slow_falling 1 0 true
scoreboard players remove @s gh_timer 1
execute if score @s gh_timer matches ..0 run function grapple:cleanup/fail
