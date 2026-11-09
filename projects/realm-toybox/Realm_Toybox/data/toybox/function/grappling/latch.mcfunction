scoreboard players set @a[tag=toybox.grappling_current,limit=1] tb_gp 1
scoreboard players set @a[tag=toybox.grappling_current,limit=1] tb_gt 100
particle minecraft:crit ~ ~ ~ 0.12 0.12 0.12 0.02 8 force
playsound minecraft:block.chain.place player @a[tag=toybox.grappling_current,limit=1] ~ ~ ~ 0.8 1.2
