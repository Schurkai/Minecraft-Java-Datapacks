playsound minecraft:block.chain.hit player @s ~ ~ ~ 0.8 1.6
particle minecraft:cloud ~ ~0.5 ~ 0.2 0.2 0.2 0.02 8 force
effect give @s minecraft:slow_falling 1 0 true
scoreboard players set @s gh_cd 30
function grapple:cleanup/reset
