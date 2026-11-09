data remove storage toybox:scratch alchemy
scoreboard players set $invalid tb_data 0
scoreboard players set $reason tb_data 0
scoreboard players set $main_form tb_data 0
scoreboard players set $off_form tb_data 0
execute if items entity @s weapon.mainhand minecraft:potion run scoreboard players set $main_form tb_data 1
execute if items entity @s weapon.mainhand minecraft:splash_potion run scoreboard players set $main_form tb_data 2
execute if items entity @s weapon.mainhand minecraft:lingering_potion run scoreboard players set $main_form tb_data 3
execute if items entity @s weapon.offhand minecraft:potion run scoreboard players set $off_form tb_data 1
execute if items entity @s weapon.offhand minecraft:splash_potion run scoreboard players set $off_form tb_data 2
execute if items entity @s weapon.offhand minecraft:lingering_potion run scoreboard players set $off_form tb_data 3
scoreboard players operation $result_form tb_data = $main_form tb_data
scoreboard players operation $result_form tb_data > $off_form tb_data
scoreboard players set $gunpowder_cost tb_data 0
scoreboard players set $dragon_cost tb_data 0
execute if score $result_form tb_data matches 2 if score $main_form tb_data matches 1 run scoreboard players set $gunpowder_cost tb_data 1
execute if score $result_form tb_data matches 2 if score $off_form tb_data matches 1 run scoreboard players set $gunpowder_cost tb_data 1
execute if score $result_form tb_data matches 3 if score $main_form tb_data matches ..2 run scoreboard players set $dragon_cost tb_data 1
execute if score $result_form tb_data matches 3 if score $off_form tb_data matches ..2 run scoreboard players set $dragon_cost tb_data 1
execute store result score $glowstone tb_data run clear @s minecraft:glowstone_dust 0
execute store result score $redstone tb_data run clear @s minecraft:redstone 0
execute store result score $amethyst tb_data run clear @s minecraft:amethyst_shard 0
execute store result score $gunpowder tb_data run clear @s minecraft:gunpowder 0
execute store result score $dragon tb_data run clear @s minecraft:dragon_breath 0
execute store result score $player_levels tb_data run experience query @s levels
data modify storage toybox:scratch alchemy.main set from entity @s SelectedItem
data modify storage toybox:scratch alchemy.off set from entity @s Inventory[{Slot:-106b}]
function toybox:alchemy/canonicalize/main
execute if score $invalid tb_data matches 0 run function toybox:alchemy/canonicalize/off
execute if score $invalid tb_data matches 0 if score $main_count tb_data matches 0 run scoreboard players set $invalid tb_data 1
execute if score $invalid tb_data matches 0 if score $off_count tb_data matches 0 run scoreboard players set $invalid tb_data 1
execute if score $invalid tb_data matches 1 if score $reason tb_data matches 0 run scoreboard players set $reason tb_data 1
execute if score $invalid tb_data matches 0 run function toybox:alchemy/decide
execute if score $reason tb_data matches 1 run tellraw @s {"translate":"message.toybox.alchemy.invalid","fallback":"[Toybox] Unsupported or unsafe potion data. Effects must be vanilla IDs, level I–V, 1–72000 ticks, with no hidden or duplicate effect.","color":"red"}
execute if score $reason tb_data matches 2 run tellraw @s {"translate":"message.toybox.alchemy.choose_mode","fallback":"[Toybox] For one matching effect, carry glowstone only for potency or redstone only for duration.","color":"red"}
execute if score $reason tb_data matches 3 run tellraw @s {"translate":"message.toybox.alchemy.overlap","fallback":"[Toybox] Multi-effect potions may be fused only when their effect IDs do not overlap.","color":"red"}
execute if score $reason tb_data matches 4 run tellraw @s {"translate":"message.toybox.alchemy.too_many","fallback":"[Toybox] A mixed potion can contain at most five effects.","color":"red"}
execute if score $reason tb_data matches 5 run tellraw @s {"translate":"message.toybox.alchemy.cost","fallback":"[Toybox] Missing experience or catalysts (amethyst, mode dust, or bottle-promotion reagent).","color":"red"}
execute if score $reason tb_data matches 6 run tellraw @s {"translate":"message.toybox.alchemy.apply_failed","fallback":"[Toybox] The result bottle could not be created; nothing else was consumed.","color":"red"}
data remove storage toybox:scratch alchemy
