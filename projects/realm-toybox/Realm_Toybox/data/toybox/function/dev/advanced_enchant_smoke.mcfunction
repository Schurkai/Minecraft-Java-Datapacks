execute in minecraft:overworld run forceload add 0 0
execute in minecraft:overworld run setblock 0 100 0 minecraft:barrel
execute in minecraft:overworld run item replace block 0 100 0 container.0 with minecraft:diamond_sword[minecraft:enchantments={"minecraft:sharpness":5,"minecraft:unbreaking":3},minecraft:repair_cost=17,minecraft:custom_data={toybox:{preserve_test:1b}}]
execute in minecraft:overworld run item modify block 0 100 0 container.0 toybox:advanced_enchant/sharpness/6
scoreboard players set $smoke_level tb_gid -1
scoreboard players set $smoke_other_enchant tb_gid -1
execute in minecraft:overworld store result score $smoke_level tb_gid run data get block 0 100 0 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:sharpness"
execute in minecraft:overworld store result score $smoke_other_enchant tb_gid run data get block 0 100 0 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:unbreaking"
execute unless score $smoke_level tb_gid matches 6 run scoreboard players add $smoke_adv_fail tb_gid 1
execute unless score $smoke_other_enchant tb_gid matches 3 run scoreboard players add $smoke_adv_fail tb_gid 1
scoreboard players set $smoke_adv_custom tb_gid 0
scoreboard players set $smoke_adv_repair tb_gid 0
execute in minecraft:overworld if data block 0 100 0 Items[{Slot:0b}].components."minecraft:custom_data"{toybox:{preserve_test:1b}} run scoreboard players set $smoke_adv_custom tb_gid 1
execute in minecraft:overworld if data block 0 100 0 Items[{Slot:0b}].components."minecraft:repair_cost" run scoreboard players set $smoke_adv_repair tb_gid 1
execute unless score $smoke_adv_custom tb_gid matches 1 run scoreboard players add $smoke_adv_fail tb_gid 1
execute unless score $smoke_adv_repair tb_gid matches 1 run scoreboard players add $smoke_adv_fail tb_gid 1
data modify storage toybox:scratch advanced_book set value {"minecraft:sharpness":5}
scoreboard players set $smoke_count tb_gid 0
execute store result score $smoke_count tb_gid run data get storage toybox:scratch advanced_book
execute unless score $smoke_count tb_gid matches 1 run scoreboard players add $smoke_adv_fail tb_gid 1
data remove storage toybox:scratch advanced_book
execute in minecraft:overworld run setblock 0 100 0 minecraft:air
# All 60 fixed shelf slots must count, and an opaque transmitter obstruction must reduce the count.
execute in minecraft:overworld run fill -3 110 -3 3 111 3 minecraft:air
execute in minecraft:overworld run setblock 0 110 0 minecraft:enchanting_table
execute in minecraft:overworld run setblock -2 110 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 110 -1 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 110 0 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 110 1 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 110 2 minecraft:bookshelf
execute in minecraft:overworld run setblock -1 110 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock -1 110 2 minecraft:bookshelf
execute in minecraft:overworld run setblock 0 110 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock 0 110 2 minecraft:bookshelf
execute in minecraft:overworld run setblock 1 110 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock 1 110 2 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 110 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 110 -1 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 110 0 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 110 1 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 110 2 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 111 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 111 -1 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 111 0 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 111 1 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 111 2 minecraft:bookshelf
execute in minecraft:overworld run setblock -1 111 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock -1 111 2 minecraft:bookshelf
execute in minecraft:overworld run setblock 0 111 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock 0 111 2 minecraft:bookshelf
execute in minecraft:overworld run setblock 1 111 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock 1 111 2 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 111 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 111 -1 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 111 0 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 111 1 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 111 2 minecraft:bookshelf
execute in minecraft:overworld run setblock -3 110 -3 minecraft:bookshelf
execute in minecraft:overworld run setblock -3 110 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock -3 110 -1 minecraft:bookshelf
execute in minecraft:overworld run setblock -3 110 0 minecraft:bookshelf
execute in minecraft:overworld run setblock -3 110 1 minecraft:bookshelf
execute in minecraft:overworld run setblock -3 110 2 minecraft:bookshelf
execute in minecraft:overworld run setblock -3 110 3 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 110 -3 minecraft:bookshelf
execute in minecraft:overworld run setblock -2 110 3 minecraft:bookshelf
execute in minecraft:overworld run setblock -1 110 -3 minecraft:bookshelf
execute in minecraft:overworld run setblock -1 110 3 minecraft:bookshelf
execute in minecraft:overworld run setblock 0 110 -3 minecraft:bookshelf
execute in minecraft:overworld run setblock 0 110 3 minecraft:bookshelf
execute in minecraft:overworld run setblock 1 110 -3 minecraft:bookshelf
execute in minecraft:overworld run setblock 1 110 3 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 110 -3 minecraft:bookshelf
execute in minecraft:overworld run setblock 2 110 3 minecraft:bookshelf
execute in minecraft:overworld run setblock 3 110 -3 minecraft:bookshelf
execute in minecraft:overworld run setblock 3 110 -2 minecraft:bookshelf
execute in minecraft:overworld run setblock 3 110 -1 minecraft:bookshelf
execute in minecraft:overworld run setblock 3 110 0 minecraft:bookshelf
execute in minecraft:overworld run setblock 3 110 1 minecraft:bookshelf
execute in minecraft:overworld run setblock 3 110 2 minecraft:bookshelf
execute in minecraft:overworld run setblock 3 110 3 minecraft:bookshelf
execute in minecraft:overworld run setblock 3 111 0 minecraft:bookshelf
execute in minecraft:overworld run setblock -3 111 0 minecraft:bookshelf
execute in minecraft:overworld run setblock 0 111 3 minecraft:bookshelf
execute in minecraft:overworld run setblock 0 111 -3 minecraft:bookshelf
execute in minecraft:overworld positioned 0 110 0 run function toybox:advanced_enchant/count_shelves
scoreboard players operation $smoke_shelves tb_gid = $shelves tb_data
execute unless score $smoke_shelves tb_gid matches 60 run scoreboard players add $smoke_adv_fail tb_gid 1
execute in minecraft:overworld run setblock 1 110 0 minecraft:stone
execute in minecraft:overworld positioned 0 110 0 run function toybox:advanced_enchant/count_shelves
scoreboard players operation $smoke_blocked_shelves tb_gid = $shelves tb_data
execute unless score $smoke_blocked_shelves tb_gid matches ..59 run scoreboard players add $smoke_adv_fail tb_gid 1
execute in minecraft:overworld run fill -3 110 -3 3 111 3 minecraft:air
execute in minecraft:overworld run forceload remove 0 0
