item replace entity @s weapon.offhand with air
clear @s minecraft:lapis_lazuli 3
experience add @s -14 levels
tellraw @s [{"translate":"message.toybox.advanced_enchant.success","fallback":"[Toybox] Advanced enchantment complete: level %s.","color":"aqua","with":[{"score":{"name":"$result_level","objective":"tb_data"}}]}]
