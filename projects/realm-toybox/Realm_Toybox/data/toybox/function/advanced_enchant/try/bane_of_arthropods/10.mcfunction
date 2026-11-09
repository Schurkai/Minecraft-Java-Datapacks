scoreboard players set $result_level tb_data 10
scoreboard players set $reason tb_data 0
execute unless score $shelves tb_data matches 60.. run scoreboard players set $reason tb_data 1
execute if score $reason tb_data matches 0 unless score $player_levels tb_data matches 24.. run scoreboard players set $reason tb_data 2
execute if score $reason tb_data matches 0 unless score $lapis tb_data matches 5.. run scoreboard players set $reason tb_data 3
execute if score $reason tb_data matches 0 unless score $amethyst tb_data matches 5.. run scoreboard players set $reason tb_data 4
execute if score $reason tb_data matches 1 run tellraw @s [{"translate":"message.toybox.advanced_enchant.need_shelves","fallback":"[Toybox] Not enough active fixed-slot bookshelves. Active: %s","color":"red","with":[{"score":{"name":"$shelves","objective":"tb_data"}}]}]
execute if score $reason tb_data matches 2 run tellraw @s {"translate":"message.toybox.advanced_enchant.need_xp","fallback":"[Toybox] Not enough experience levels for this tier.","color":"red"}
execute if score $reason tb_data matches 3 run tellraw @s {"translate":"message.toybox.advanced_enchant.need_lapis","fallback":"[Toybox] Not enough lapis lazuli for this tier.","color":"red"}
execute if score $reason tb_data matches 4 run tellraw @s {"translate":"message.toybox.advanced_enchant.need_amethyst","fallback":"[Toybox] Not enough amethyst shards for this tier.","color":"red"}
execute if score $reason tb_data matches 0 run function toybox:advanced_enchant/apply/bane_of_arthropods/10
