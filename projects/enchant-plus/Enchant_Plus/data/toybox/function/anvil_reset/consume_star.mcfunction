scoreboard players set $anvil_star_count ep_data 0
execute store result score $anvil_star_count ep_data run data get entity @s Item.count
scoreboard players remove $anvil_star_count ep_data 1
execute if score $anvil_star_count ep_data matches 1.. store result entity @s Item.count int 1 run scoreboard players get $anvil_star_count ep_data
execute if score $anvil_star_count ep_data matches ..0 run kill @s
