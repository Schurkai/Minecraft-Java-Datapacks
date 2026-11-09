item replace entity @s weapon.offhand with air
$clear @s minecraft:amethyst_shard $(amethyst)
$clear @s minecraft:glowstone_dust $(glowstone)
$clear @s minecraft:redstone $(redstone)
$clear @s minecraft:gunpowder $(gunpowder)
$clear @s minecraft:dragon_breath $(dragon)
$experience add @s -$(xp) levels
execute if score $mode tb_data matches 1 run tellraw @s {"translate":"message.toybox.alchemy.success_potency","fallback":"[Toybox] Potency synthesis complete.","color":"light_purple"}
execute if score $mode tb_data matches 2 run tellraw @s {"translate":"message.toybox.alchemy.success_duration","fallback":"[Toybox] Duration synthesis complete.","color":"light_purple"}
execute if score $mode tb_data matches 3 run tellraw @s {"translate":"message.toybox.alchemy.success_union","fallback":"[Toybox] Multi-effect potion fusion complete.","color":"light_purple"}
