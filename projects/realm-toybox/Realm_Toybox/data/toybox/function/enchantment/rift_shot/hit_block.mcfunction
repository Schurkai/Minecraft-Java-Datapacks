scoreboard players set $rift_ok tb_data 0
execute on origin if entity @s[type=minecraft:player,distance=8..48,scores={tb_rcd=0}] if predicate toybox:player/is_sneaking run function toybox:enchantment/rift_shot/try_teleport
execute if score $rift_ok tb_data matches 0 on origin if entity @s[type=minecraft:player] run title @s actionbar {"translate":"message.toybox.rift_shot.blocked","fallback":"[Toybox] Rift Shot needs sneak, 8–48 blocks, clear arrival space, and no cooldown.","color":"light_purple"}
kill @s
