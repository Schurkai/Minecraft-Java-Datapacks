# Twenty-five 0.2-block steps: a bounded five-block ray, stopped by any non-air block.
scoreboard players add $sickle_step tb_data 1
execute if score $sickle_found tb_data matches 0 if block ~ ~ ~ minecraft:wheat[age=7] align xyz run function toybox:farming/sickle/harvest_grid
execute if score $sickle_found tb_data matches 0 if block ~ ~ ~ minecraft:carrots[age=7] align xyz run function toybox:farming/sickle/harvest_grid
execute if score $sickle_found tb_data matches 0 if block ~ ~ ~ minecraft:potatoes[age=7] align xyz run function toybox:farming/sickle/harvest_grid
execute if score $sickle_found tb_data matches 0 if block ~ ~ ~ minecraft:beetroots[age=3] align xyz run function toybox:farming/sickle/harvest_grid
execute if score $sickle_found tb_data matches 0 if block ~ ~ ~ minecraft:nether_wart[age=3] align xyz run function toybox:farming/sickle/harvest_grid
execute if score $sickle_found tb_data matches 0 if score $sickle_step tb_data matches ..24 if block ~ ~ ~ #toybox:sickle_raycast_passable positioned ^ ^ ^0.2 run function toybox:farming/sickle/raycast
