# Realm Toybox v0.9.0-rc1 load. Storage prevents harmless-but-noisy duplicate objective errors on /reload.
execute unless data storage toybox:runtime {objectives_initialized:1b} run function toybox:system/init_objectives
execute unless data storage toybox:runtime {grappling_objectives_initialized:1b} run function toybox:system/init_grappling_objectives
execute unless data storage toybox:runtime {grappling_lifecycle_objectives_initialized:1b} run function toybox:system/init_grappling_lifecycle_objectives
execute unless data storage toybox:runtime {rc4_objectives_initialized:1b} run function toybox:system/init_rc4_objectives
execute unless data storage toybox:runtime {v050_objectives_initialized:1b} run function toybox:system/init_v050_objectives
execute unless data storage toybox:runtime {v060_objectives_initialized:1b} run function toybox:system/init_v060_objectives
execute unless data storage toybox:runtime {v070_objectives_initialized:1b} run function toybox:system/init_v070_objectives
execute unless data storage toybox:runtime {v080_objectives_initialized:1b} run function toybox:system/init_v080_objectives
execute unless data storage toybox:runtime {v090_objectives_initialized:1b} run function toybox:system/init_v090_objectives
scoreboard players set $pack tb_data 900
data modify storage toybox:runtime data_version set value 900
schedule function toybox:soup/maintenance 6000t replace
