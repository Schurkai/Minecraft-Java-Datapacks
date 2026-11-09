# Enchant Plus v1.1.4 Realm-safe load. Storage prevents duplicate objective errors on /reload.
execute unless data storage toybox:runtime {ep_objectives_initialized:1b} run function toybox:system/init_objectives
execute unless data storage toybox:runtime {ep_objectives_1104:1b} run function toybox:system/init_objectives_1104
execute unless data storage toybox:runtime {ep_objectives_migrated:1b} run function toybox:system/migrate_objectives
execute unless data storage toybox:runtime {core_cleanup_1100:1b} run function toybox:system/cleanup_legacy
scoreboard players set $pack ep_data 1104
data modify storage toybox:runtime data_version set value 1104
