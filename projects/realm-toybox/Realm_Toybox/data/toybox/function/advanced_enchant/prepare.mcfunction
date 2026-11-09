scoreboard players set $book_count tb_data 0
execute store result score $book_count tb_data run data get entity @s Inventory[{Slot:-106b}].components."minecraft:stored_enchantments"
execute if score $book_count tb_data matches 1 run function toybox:advanced_enchant/find_table
execute unless score $book_count tb_data matches 1 run tellraw @s {"translate":"message.toybox.advanced_enchant.one_book","fallback":"[Toybox] The off-hand book must contain exactly one supported enchantment.","color":"red"}
