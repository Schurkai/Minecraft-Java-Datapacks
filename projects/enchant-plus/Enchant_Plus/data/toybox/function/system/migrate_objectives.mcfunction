# Preserve player data-version scores, then retire the old Toybox-branded objectives.
execute if data storage toybox:runtime {objectives_initialized:1b} as @a run scoreboard players operation @s ep_pver = @s tb_pver
execute if data storage toybox:runtime {objectives_initialized:1b} run scoreboard objectives remove tb_help
execute if data storage toybox:runtime {objectives_initialized:1b} run scoreboard objectives remove tb_anvil
execute if data storage toybox:runtime {objectives_initialized:1b} run scoreboard objectives remove tb_pver
execute if data storage toybox:runtime {objectives_initialized:1b} run scoreboard objectives remove tb_data
data remove storage toybox:runtime objectives_initialized
data modify storage toybox:runtime ep_objectives_migrated set value 1b
