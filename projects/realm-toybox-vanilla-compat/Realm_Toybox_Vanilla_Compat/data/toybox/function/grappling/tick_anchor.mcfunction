# Runs as the matching fishing bobber at its position.
scoreboard players set $found tb_gid 1
execute if score @a[tag=toybox.grappling_current,limit=1] tb_gp matches 0 run function toybox:grappling/hook_wait
execute if score @a[tag=toybox.grappling_current,limit=1] tb_gp matches 1 run function toybox:grappling/hook_pull
