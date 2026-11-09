# Runs as the matching bobber at its own position.
scoreboard players set $found gh_tmp 1
execute if score @a[tag=grapple.current,limit=1] gh_state matches 2 run function grapple:flight/tick
execute if score @a[tag=grapple.current,limit=1] gh_state matches 3 run function grapple:pull/tick
