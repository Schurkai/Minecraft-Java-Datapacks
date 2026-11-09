# Fishing bobbers do not expose a block-hit enchantment event. Use their
# 0.125-block radius to detect contact without confusing a free-flight apex
# or an entity hook in open air for a block latch.
execute if block ~ ~ ~ minecraft:water run scoreboard players set $cancel tb_gid 1
execute if block ~ ~ ~ minecraft:lava run scoreboard players set $cancel tb_gid 1
scoreboard players set $contact tb_gid 0
execute if predicate toybox:entity/is_on_ground run scoreboard players set $contact tb_gid 1
execute positioned ~0.16 ~ ~ unless block ~ ~ ~ #toybox:grappling_passable run scoreboard players set $contact tb_gid 1
execute positioned ~-0.16 ~ ~ unless block ~ ~ ~ #toybox:grappling_passable run scoreboard players set $contact tb_gid 1
execute positioned ~ ~0.16 ~ unless block ~ ~ ~ #toybox:grappling_passable run scoreboard players set $contact tb_gid 1
execute positioned ~ ~-0.16 ~ unless block ~ ~ ~ #toybox:grappling_passable run scoreboard players set $contact tb_gid 1
execute positioned ~ ~ ~0.16 unless block ~ ~ ~ #toybox:grappling_passable run scoreboard players set $contact tb_gid 1
execute positioned ~ ~ ~-0.16 unless block ~ ~ ~ #toybox:grappling_passable run scoreboard players set $contact tb_gid 1
execute if score $cancel tb_gid matches 0 if score $contact tb_gid matches 1 run function toybox:grappling/latch
