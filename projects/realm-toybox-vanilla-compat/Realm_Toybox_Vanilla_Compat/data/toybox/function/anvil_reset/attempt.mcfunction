# Backward-compatible trigger: explain the physical ritual instead of bypassing its cost.
tellraw @s {"translate":"message.toybox.anvil.hint","fallback":"[Toybox] Drop the worked item and 1 Nether Star together on top of an anvil.","color":"yellow"}
scoreboard players set @s tb_anvil 0
