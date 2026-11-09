# Event-bounded tooltip refresh. The stored NBT value, not the default item
# component, decides whether a positive prior-work line is visible.
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:0b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s hotbar.0 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.0 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s hotbar.0 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.0 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s hotbar.0 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.0 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:1b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s hotbar.1 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.1 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s hotbar.1 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.1 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s hotbar.1 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.1 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:2b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s hotbar.2 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.2 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s hotbar.2 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.2 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s hotbar.2 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.2 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:3b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s hotbar.3 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.3 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s hotbar.3 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.3 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s hotbar.3 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.3 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:4b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s hotbar.4 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.4 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s hotbar.4 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.4 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s hotbar.4 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.4 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:5b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s hotbar.5 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.5 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s hotbar.5 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.5 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s hotbar.5 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.5 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:6b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s hotbar.6 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.6 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s hotbar.6 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.6 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s hotbar.6 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.6 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:7b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s hotbar.7 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.7 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s hotbar.7 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.7 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s hotbar.7 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.7 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:8b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s hotbar.8 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.8 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s hotbar.8 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.8 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s hotbar.8 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s hotbar.8 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:9b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.0 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.0 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.0 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.0 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.0 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.0 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:10b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.1 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.1 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.1 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.1 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.1 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.1 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:11b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.2 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.2 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.2 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.2 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.2 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.2 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:12b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.3 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.3 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.3 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.3 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.3 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.3 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:13b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.4 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.4 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.4 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.4 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.4 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.4 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:14b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.5 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.5 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.5 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.5 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.5 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.5 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:15b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.6 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.6 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.6 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.6 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.6 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.6 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:16b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.7 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.7 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.7 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.7 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.7 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.7 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:17b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.8 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.8 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.8 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.8 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.8 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.8 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:18b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.9 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.9 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.9 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.9 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.9 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.9 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:19b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.10 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.10 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.10 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.10 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.10 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.10 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:20b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.11 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.11 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.11 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.11 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.11 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.11 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:21b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.12 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.12 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.12 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.12 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.12 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.12 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:22b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.13 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.13 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.13 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.13 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.13 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.13 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:23b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.14 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.14 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.14 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.14 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.14 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.14 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:24b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.15 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.15 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.15 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.15 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.15 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.15 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:25b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.16 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.16 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.16 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.16 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.16 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.16 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:26b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.17 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.17 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.17 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.17 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.17 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.17 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:27b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.18 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.18 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.18 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.18 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.18 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.18 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:28b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.19 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.19 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.19 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.19 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.19 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.19 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:29b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.20 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.20 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.20 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.20 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.20 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.20 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:30b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.21 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.21 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.21 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.21 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.21 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.21 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:31b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.22 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.22 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.22 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.22 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.22 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.22 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:32b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.23 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.23 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.23 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.23 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.23 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.23 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:33b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.24 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.24 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.24 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.24 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.24 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.24 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:34b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.25 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.25 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.25 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.25 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.25 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.25 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:35b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s inventory.26 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.26 toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s inventory.26 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.26 toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s inventory.26 *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s inventory.26 toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:-106b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s weapon.offhand *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s weapon.offhand toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s weapon.offhand *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s weapon.offhand toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s weapon.offhand *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s weapon.offhand toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:100b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s armor.feet *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.feet toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s armor.feet *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.feet toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s armor.feet *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.feet toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:101b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s armor.legs *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.legs toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s armor.legs *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.legs toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s armor.legs *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.legs toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:102b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s armor.chest *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.chest toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s armor.chest *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.chest toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s armor.chest *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.chest toybox:anvil_lore_remove
scoreboard players set $anvil_cost ep_data 0
execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:103b}].components."minecraft:repair_cost"
execute if score $anvil_cost ep_data matches 1.. if items entity @s armor.head *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.head toybox:anvil_lore_replace
execute if score $anvil_cost ep_data matches 1.. unless items entity @s armor.head *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.head toybox:anvil_lore_insert
execute unless score $anvil_cost ep_data matches 1.. if items entity @s armor.head *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s armor.head toybox:anvil_lore_remove
