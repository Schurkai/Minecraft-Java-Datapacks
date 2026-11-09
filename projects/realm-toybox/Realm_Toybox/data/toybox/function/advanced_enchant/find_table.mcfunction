# The advancement proves an enchanting table was used; this short view ray recovers its block position.
scoreboard players set $found tb_data 0
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^0.25 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^0.5 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^0.75 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^1 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^1.25 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^1.5 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^1.75 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^2 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^2.25 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^2.5 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^2.75 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^3 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^3.25 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^3.5 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^3.75 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^4 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^4.25 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^4.5 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^4.75 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^5 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 at @s anchored eyes positioned ^ ^ ^5.25 align xyz if block ~ ~ ~ minecraft:enchanting_table run function toybox:advanced_enchant/table
execute if score $found tb_data matches 0 run tellraw @s {"translate":"message.toybox.advanced_enchant.no_table","fallback":"[Toybox] Could not resolve the enchanting table you used. Face its top or side and try again.","color":"red"}
