# Opening an anvil never changes an item; it only explains the opt-in ritual.
execute if data entity @s Inventory[].components."minecraft:repair_cost" run title @s actionbar {"translate":"message.toybox.anvil.hint","fallback":"Drop the worked item and 1 Nether Star together on top of this anvil.","color":"yellow"}
advancement revoke @s only toybox:interaction/anvil_open
