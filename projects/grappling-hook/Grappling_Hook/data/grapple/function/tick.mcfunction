# Player-bounded input and lifecycle checks. No global entity scan.
execute as @a[tag=!grapple.initialized] run function grapple:player/init
execute as @a[tag=!grapple.rc_initialized] run function grapple:player/init_rc
scoreboard players remove @a[scores={gh_cd=1..}] gh_cd 1
execute as @a if score @s gh_use > @s gh_seen run function grapple:input/use
execute as @a[scores={gh_state=1}] at @s run function grapple:cast/tick_pending
execute as @a[scores={gh_state=2..3}] at @s run function grapple:active/tick
execute as @a[scores={gh_state=4}] at @s run function grapple:cast/tick_reject
tag @a[tag=grapple.current] remove grapple.current
