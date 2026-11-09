# Event-only entry point. Nothing from this graph is called by the tick function.
advancement revoke @s only toybox:interaction/enchanting_table
execute if items entity @s weapon.offhand minecraft:enchanted_book if items entity @s weapon.mainhand * run function toybox:advanced_enchant/prepare
