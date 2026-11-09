tag @s add grapple.current
execute as @e[type=minecraft:fishing_bobber,tag=!grapple.anchor,distance=..5] at @s run function grapple:cast/reject_candidate
tag @s remove grapple.current
execute if score @s gh_state matches 4 run scoreboard players remove @s gh_timer 1
execute if score @s gh_state matches 4 if score @s gh_timer matches ..0 run scoreboard players set @s gh_state 0
