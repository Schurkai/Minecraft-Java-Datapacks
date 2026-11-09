scoreboard players set $found tb_data 1
function toybox:advanced_enchant/count_shelves
execute store result score $lapis tb_data run clear @s minecraft:lapis_lazuli 0
execute store result score $amethyst tb_data run clear @s minecraft:amethyst_shard 0
execute store result score $player_levels tb_data run experience query @s levels
scoreboard players set $candidate tb_data 0
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:bane_of_arthropods" run function toybox:advanced_enchant/check/bane_of_arthropods
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:blast_protection" run function toybox:advanced_enchant/check/blast_protection
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:fire_protection" run function toybox:advanced_enchant/check/fire_protection
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:impaling" run function toybox:advanced_enchant/check/impaling
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:power" run function toybox:advanced_enchant/check/power
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:projectile_protection" run function toybox:advanced_enchant/check/projectile_protection
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:protection" run function toybox:advanced_enchant/check/protection
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:sharpness" run function toybox:advanced_enchant/check/sharpness
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:smite" run function toybox:advanced_enchant/check/smite
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:density" run function toybox:advanced_enchant/check/density
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:efficiency" run function toybox:advanced_enchant/check/efficiency
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:fortune" run function toybox:advanced_enchant/check/fortune
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:looting" run function toybox:advanced_enchant/check/looting
execute if data entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:unbreaking" run function toybox:advanced_enchant/check/unbreaking
execute if score $candidate tb_data matches 0 run tellraw @s {"translate":"message.toybox.advanced_enchant.unsupported","fallback":"[Toybox] That enchantment has no advanced tier in this pack.","color":"red"}
