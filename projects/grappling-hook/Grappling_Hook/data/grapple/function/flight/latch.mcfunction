scoreboard players set @a[tag=grapple.current,limit=1] gh_state 3
scoreboard players set @a[tag=grapple.current,limit=1] gh_timer 60
scoreboard players set @a[tag=grapple.current,limit=1] gh_block 0
particle minecraft:crit ~ ~ ~ 0.12 0.12 0.12 0.02 8 force
playsound minecraft:block.chain.place player @a[tag=grapple.current,limit=1] ~ ~ ~ 0.8 1.2
