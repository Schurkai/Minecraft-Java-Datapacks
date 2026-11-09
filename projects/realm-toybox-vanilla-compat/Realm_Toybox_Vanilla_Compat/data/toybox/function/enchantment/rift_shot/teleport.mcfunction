scoreboard players set $rift_ok tb_data 1
scoreboard players set @s tb_rcd 60
particle minecraft:portal ~ ~0.9 ~ 0.35 0.75 0.35 0.2 32 force
playsound minecraft:entity.enderman.teleport player @a[distance=..32] ~ ~ ~ 0.8 1.35
tp @s ~ ~ ~
damage @s 5 minecraft:ender_pearl
effect give @s minecraft:slow_falling 2 0 true
