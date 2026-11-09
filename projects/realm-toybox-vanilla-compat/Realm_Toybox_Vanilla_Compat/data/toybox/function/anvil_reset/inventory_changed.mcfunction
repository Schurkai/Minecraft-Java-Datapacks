# Refresh tooltip lore only when an inventory actually contains prior-work cost.
# Keep the advancement granted until item modifications finish, preventing recursive rewards.
execute if data entity @s Inventory[].components."minecraft:repair_cost" run function toybox:anvil_reset/refresh_inventory
tag @s add toybox.anvil_scan_pending
schedule function toybox:anvil_reset/check_pending 1t replace
advancement revoke @s only toybox:interaction/repair_cost_inventory
