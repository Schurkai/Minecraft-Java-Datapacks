# Refresh only inventories containing an explicit cost or an old managed line.
# Nether Star drops arm the ritual through ep_star_drop, not this broad event.
scoreboard players set $anvil_refresh ep_data 0
execute if data entity @s Inventory[].components."minecraft:repair_cost" run scoreboard players set $anvil_refresh ep_data 1
execute if data entity @s Inventory[].components."minecraft:custom_data".toybox.anvil_lore run scoreboard players set $anvil_refresh ep_data 1
execute if score $anvil_refresh ep_data matches 1 run function toybox:anvil_reset/refresh_inventory
advancement revoke @s only toybox:interaction/repair_cost_inventory
