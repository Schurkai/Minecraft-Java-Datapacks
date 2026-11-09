scoreboard players set $candidate tb_data 1
scoreboard players set $book_level tb_data -1
scoreboard players set $item_level tb_data -1
scoreboard players set $valid tb_data 0
execute store result score $book_level tb_data run data get entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"."minecraft:power"
execute store result score $item_level tb_data run data get entity @s SelectedItem.components."minecraft:enchantments"."minecraft:power"
execute if score $book_level tb_data = $item_level tb_data if score $item_level tb_data matches 5..9 run scoreboard players set $valid tb_data 1
execute if score $valid tb_data matches 0 run tellraw @s {"translate":"message.toybox.advanced_enchant.level_mismatch","fallback":"[Toybox] The item and book must have the same level, starting at the enchantment’s vanilla maximum.","color":"red"}
execute if score $valid tb_data matches 1 if score $item_level tb_data matches 5 run function toybox:advanced_enchant/try/power/6
execute if score $valid tb_data matches 1 if score $item_level tb_data matches 6 run function toybox:advanced_enchant/try/power/7
execute if score $valid tb_data matches 1 if score $item_level tb_data matches 7 run function toybox:advanced_enchant/try/power/8
execute if score $valid tb_data matches 1 if score $item_level tb_data matches 8 run function toybox:advanced_enchant/try/power/9
execute if score $valid tb_data matches 1 if score $item_level tb_data matches 9 run function toybox:advanced_enchant/try/power/10
