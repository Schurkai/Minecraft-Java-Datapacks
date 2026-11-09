execute if score @s gh_state matches 1.. at @s run function grapple:cleanup/reset
scoreboard players set @s gh_block 0
scoreboard players set @s gh_cd 0
tag @s add grapple.rc_initialized
