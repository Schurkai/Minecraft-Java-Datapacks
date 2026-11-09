scoreboard players set @s gh_tmp 0
execute store success score @s gh_tmp run execute on origin if entity @s[type=minecraft:player,tag=grapple.current,scores={gh_state=4}] run scoreboard players get $one gh_tmp
execute if score @s gh_tmp matches 1 run function grapple:cast/reject_owned
