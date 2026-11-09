scoreboard players set $client_rig_found tb_gid 0
# Entity-free cleanup: stand directly on the test enchanting table.
execute at @s if block ~ ~-1 ~ minecraft:enchanting_table positioned ~ ~-1 ~ run function toybox:dev/client_test/cleanup_here
execute at @s if score $client_rig_found tb_gid matches 0 if block ~ ~ ~ minecraft:enchanting_table positioned ~ ~ ~ run function toybox:dev/client_test/cleanup_here
clear @s minecraft:diamond_sword[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:enchanted_book[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:potion[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:splash_potion[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:lingering_potion[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:lapis_lazuli[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:amethyst_shard[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:glowstone_dust[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:redstone[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:gunpowder[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:dragon_breath[minecraft:custom_data~{toybox:{client_test:1b}}]
execute if score $client_rig_found tb_gid matches 0 run tellraw @s {"translate":"message.toybox.dev.client_test.no_rig","fallback":"[Toybox Test] Stand directly on the test enchanting table and run cleanup again; tagged unused inputs were still removed.","color":"yellow"}
execute if score $client_rig_found tb_gid matches 1 run tellraw @s {"translate":"message.toybox.dev.client_test.cleanup_done","fallback":"[Toybox Test] Rig under your feet and tagged unused inputs removed. Added XP and synthesized results were left alone.","color":"green"}
