execute as @e[type=minecraft:item,tag=toybox.anvil_catalyst,distance=..1.5,sort=nearest,limit=1] run function toybox:anvil_reset/consume_star
execute at @s run particle minecraft:enchant ~ ~0.2 ~ 0.35 0.25 0.35 0.2 24 force @a[distance=..16]
execute at @s run playsound minecraft:block.anvil.use player @a[distance=..16] ~ ~ ~ 0.8 1.25
execute at @s run tellraw @a[tag=toybox.anvil_scan_processing,distance=..4,sort=nearest,limit=1] {"translate":"message.toybox.anvil.success","fallback":"[Toybox] Consumed 1 Nether Star and reset the item's prior-work penalty.","color":"aqua"}
