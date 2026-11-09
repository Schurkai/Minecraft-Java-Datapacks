# Each execute line returns to the original bobber context before the next command.
execute on origin if entity @s[tag=grapple.current,scores={gh_state=4}] run scoreboard players set @s gh_state 0
execute on origin if entity @s[tag=grapple.current] run scoreboard players set @s gh_timer 0
kill @s
