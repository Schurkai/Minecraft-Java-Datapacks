# Runs once for every observed fishing-rod use increment.
scoreboard players operation @s gh_seen = @s gh_use
execute if score @s gh_state matches 1.. run return run function grapple:cleanup/cancel
execute if items entity @s weapon.mainhand minecraft:fishing_rod[minecraft:custom_data~{grapple:{hook:1b}}] if score @s gh_cd matches 1.. run return run function grapple:cast/reject_start
execute if items entity @s weapon.mainhand minecraft:fishing_rod[minecraft:custom_data~{grapple:{hook:1b}}] if score @s gh_cd matches 0 run return run function grapple:cast/start
