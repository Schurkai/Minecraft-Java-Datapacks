# Only a player with a newly observed hook use scans a five-block local set for at most three ticks.
tag @s add grapple.current
execute as @e[type=minecraft:fishing_bobber,tag=!grapple.anchor,distance=..5] at @s run function grapple:cast/check_candidate
tag @s remove grapple.current
