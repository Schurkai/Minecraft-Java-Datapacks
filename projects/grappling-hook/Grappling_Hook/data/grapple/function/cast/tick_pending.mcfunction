function grapple:cast/scan
execute if score @s gh_state matches 1 run scoreboard players remove @s gh_timer 1
execute if score @s gh_state matches 1 if score @s gh_timer matches ..0 run function grapple:cleanup/fail
