# Remove only repair_cost, then remove the managed first lore line instead of writing +0.
scoreboard players set $anvil_applied ep_data 0
execute store success score $anvil_applied ep_data run item modify entity @s contents toybox:reset_repair_cost
scoreboard players set $anvil_remaining ep_data 0
execute store result score $anvil_remaining ep_data run data get entity @s Item.components."minecraft:repair_cost"
execute if score $anvil_applied ep_data matches 1 unless score $anvil_remaining ep_data matches 1.. if items entity @s contents *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s contents toybox:anvil_lore_remove
execute if score $anvil_applied ep_data matches 1 unless score $anvil_remaining ep_data matches 1.. run function toybox:anvil_reset/finish
