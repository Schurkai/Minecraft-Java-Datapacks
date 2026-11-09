item modify entity @s weapon.mainhand toybox:reset_repair_cost
clear @s minecraft:amethyst_shard 1
experience add @s -5 levels
playsound minecraft:block.anvil.use player @s ~ ~ ~ 0.8 1.2
tellraw @s {"translate":"message.toybox.anvil.success","fallback":"[Toybox] Reset the main-hand item's accumulated anvil cost.","color":"aqua"}
