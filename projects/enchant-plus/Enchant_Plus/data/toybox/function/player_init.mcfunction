# Data-versioned initial setup for the core feature set.
recipe give @s toybox:winged_leather_chestplate
recipe give @s toybox:winged_copper_chestplate
recipe give @s toybox:winged_chainmail_chestplate
recipe give @s toybox:winged_golden_chestplate
recipe give @s toybox:winged_iron_chestplate
recipe give @s toybox:winged_diamond_chestplate
recipe give @s toybox:winged_netherite_chestplate
scoreboard players set @s ep_pver 1104
tellraw @s {"translate":"message.enchant_plus.enabled","fallback":"[인챈트플러스] v1.1.4가 활성화되었습니다. 도움말: /trigger ep_help","color":"aqua"}
