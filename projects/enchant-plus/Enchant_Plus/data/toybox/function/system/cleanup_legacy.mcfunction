# One-time cleanup for runtime state left by features removed before v1.1.1.
execute if data storage toybox:runtime {v070_objectives_initialized:1b} run schedule clear toybox:soup/maintenance
execute in minecraft:overworld run kill @e[type=minecraft:marker,tag=toybox.soup_pot]
execute in minecraft:the_nether run kill @e[type=minecraft:marker,tag=toybox.soup_pot]
execute in minecraft:the_end run kill @e[type=minecraft:marker,tag=toybox.soup_pot]
execute in minecraft:overworld run kill @e[type=minecraft:fishing_bobber,tag=toybox.grappling_anchor]
execute in minecraft:the_nether run kill @e[type=minecraft:fishing_bobber,tag=toybox.grappling_anchor]
execute in minecraft:the_end run kill @e[type=minecraft:fishing_bobber,tag=toybox.grappling_anchor]
tag @a remove toybox.grappling_active
tag @a remove toybox.grappling_current
tag @a remove toybox.sickle_active
tag @a remove toybox.soup_user
data remove storage toybox:scratch alchemy
data modify storage toybox:runtime core_cleanup_1100 set value 1b
