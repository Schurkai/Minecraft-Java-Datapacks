# Snapshot the existing vanilla statistic so installing the pack never treats old rod uses as a new cast.
scoreboard players add @s gh_use 0
scoreboard players operation @s gh_seen = @s gh_use
scoreboard players set @s gh_state 0
scoreboard players set @s gh_timer 0
scoreboard players set @s gh_id 0
tag @s remove grapple.current
tag @s add grapple.initialized
recipe give @s grapple:grappling_hook
tellraw @s [{"text":"[갈고리] ","color":"aqua"},{"text":"제작법이 해금되었습니다. ","color":"gray"},{"text":"/function grapple:help","color":"white","underlined":true}]
