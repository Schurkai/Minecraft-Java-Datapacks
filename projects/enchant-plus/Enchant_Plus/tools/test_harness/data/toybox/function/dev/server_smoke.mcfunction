# Test-harness-only headless assertions.
scoreboard players set $smoke_fail ep_data 0
scoreboard players set $smoke_compat_fail ep_data 0

execute unless score $pack ep_data matches 1104 run scoreboard players add $smoke_fail ep_data 1
execute unless data storage toybox:runtime {core_cleanup_1100:1b} run scoreboard players add $smoke_fail ep_data 1

# The update cleanup removes loaded legacy runtime entities without scanning them every tick.
execute in minecraft:overworld run kill @e[type=minecraft:marker,tag=toybox_debug_legacy]
execute in minecraft:overworld run summon minecraft:marker 0 100 0 {Tags:["toybox.soup_pot","toybox_debug_legacy"]}
function toybox:system/cleanup_legacy
execute in minecraft:overworld if entity @e[type=minecraft:marker,tag=toybox_debug_legacy] run scoreboard players add $smoke_fail ep_data 1

function toybox:dev/vanilla_compat_smoke
scoreboard players operation $smoke_fail ep_data += $smoke_compat_fail ep_data
