# Write a visible zero-cost line first, then remove only repair_cost.
data modify storage toybox:runtime anvil_lore.cost set value 0
execute if items entity @s contents *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s contents toybox:anvil_lore_replace
execute unless items entity @s contents *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s contents toybox:anvil_lore_insert
scoreboard players set $anvil_applied tb_data 0
execute store success score $anvil_applied tb_data run item modify entity @s contents toybox:reset_repair_cost
execute if score $anvil_applied tb_data matches 1 unless items entity @s contents *[minecraft:repair_cost] run function toybox:anvil_reset/finish
