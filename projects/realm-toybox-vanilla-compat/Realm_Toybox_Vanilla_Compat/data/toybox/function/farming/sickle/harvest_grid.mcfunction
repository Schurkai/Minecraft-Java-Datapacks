execute positioned ~-1 ~ ~-1 run function toybox:farming/sickle/harvest_one
execute positioned ~0 ~ ~-1 run function toybox:farming/sickle/harvest_one
execute positioned ~1 ~ ~-1 run function toybox:farming/sickle/harvest_one
execute positioned ~-1 ~ ~0 run function toybox:farming/sickle/harvest_one
execute positioned ~0 ~ ~0 run function toybox:farming/sickle/harvest_one
execute positioned ~1 ~ ~0 run function toybox:farming/sickle/harvest_one
execute positioned ~-1 ~ ~1 run function toybox:farming/sickle/harvest_one
execute positioned ~0 ~ ~1 run function toybox:farming/sickle/harvest_one
execute positioned ~1 ~ ~1 run function toybox:farming/sickle/harvest_one
execute if score $sickle_count tb_data matches 1.. run scoreboard players set $sickle_found tb_data 1
