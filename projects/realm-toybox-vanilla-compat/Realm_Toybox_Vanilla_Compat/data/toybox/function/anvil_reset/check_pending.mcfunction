# Runs only after an inventory-change event; no permanent item-entity tick scan.
tag @a[tag=toybox.anvil_scan_pending] add toybox.anvil_scan_processing
tag @a[tag=toybox.anvil_scan_pending] remove toybox.anvil_scan_pending
execute as @a[tag=toybox.anvil_scan_processing] at @s run function toybox:anvil_reset/scan_player
tag @a[tag=toybox.anvil_scan_processing] remove toybox.anvil_scan_processing
