# Public triggers and short, player-local scan windows after item-drop events.
scoreboard players enable @a ep_help
scoreboard players enable @a ep_anvil
scoreboard players add @a ep_pver 0
scoreboard players add @a ep_scan 0
scoreboard players add @a ep_star_drop 0
scoreboard players add @a ep_item_drop 0
scoreboard players add @a ep_wing_scan 0
execute as @a[scores={ep_pver=0}] run function toybox:player_init
execute as @a[scores={ep_pver=1..1103}] run function toybox:system/migrate_player
execute as @a[scores={ep_help=1..}] run function toybox:help
execute as @a[scores={ep_anvil=1..}] run function toybox:anvil_reset/attempt
execute as @a[scores={ep_star_drop=1..}] run function toybox:anvil_reset/arm_scan
execute as @a[scores={ep_item_drop=1..}] run function toybox:wingbound/arm_scan
execute as @a[scores={ep_scan=1..}] at @s run function toybox:anvil_reset/scan_player
execute as @a[scores={ep_wing_scan=1..}] at @s run function toybox:wingbound/scan_player
scoreboard players remove @a[scores={ep_scan=1..}] ep_scan 1
scoreboard players remove @a[scores={ep_wing_scan=1..}] ep_wing_scan 1
