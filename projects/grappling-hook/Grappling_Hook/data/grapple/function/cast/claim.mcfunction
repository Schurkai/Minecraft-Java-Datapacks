# Runs as the verified bobber; exactly one player is temporarily tagged current.
scoreboard players add $next gh_id 1
scoreboard players operation @s gh_id = $next gh_id
tag @s add grapple.anchor
scoreboard players operation @a[tag=grapple.current,scores={gh_state=1},limit=1] gh_id = $next gh_id
scoreboard players set @a[tag=grapple.current,scores={gh_state=1},limit=1] gh_state 2
scoreboard players set @a[tag=grapple.current,scores={gh_state=2},limit=1] gh_timer 60
playsound minecraft:block.chain.place player @a[tag=grapple.current,limit=1] ~ ~ ~ 0.7 1.4
