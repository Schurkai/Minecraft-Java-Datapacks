scoreboard players set $sickle_found tb_data 0
scoreboard players set $sickle_step tb_data 0
scoreboard players set $sickle_count tb_data 0
execute anchored eyes positioned ^ ^ ^0.2 run function toybox:farming/sickle/raycast
execute if score $sickle_count tb_data matches 1.. run function toybox:farming/sickle/finish
