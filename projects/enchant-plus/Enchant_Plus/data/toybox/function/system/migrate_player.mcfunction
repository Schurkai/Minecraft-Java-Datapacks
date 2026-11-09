recipe give @s toybox:winged_leather_chestplate
recipe give @s toybox:winged_copper_chestplate
recipe give @s toybox:winged_chainmail_chestplate
recipe give @s toybox:winged_golden_chestplate
recipe give @s toybox:winged_iron_chestplate
recipe give @s toybox:winged_diamond_chestplate
recipe give @s toybox:winged_netherite_chestplate
tag @s remove toybox.grappling_active
tag @s remove toybox.grappling_current
tag @s remove toybox.sickle_active
tag @s remove toybox.soup_user
tag @s remove toybox_v01
scoreboard players set @s ep_pver 1104
tellraw @s {"translate":"message.enchant_plus.updated_core","fallback":"[인챈트플러스] v1.1.4로 갱신되었습니다. 도움말 명령은 /trigger ep_help입니다.","color":"aqua"}
