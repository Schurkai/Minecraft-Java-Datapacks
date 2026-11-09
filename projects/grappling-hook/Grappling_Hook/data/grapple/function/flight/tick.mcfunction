# Approximate the 0.25-wide bobber's contact; open-air entity hooks do not latch.
execute if block ~ ~ ~ minecraft:water run scoreboard players set $cancel gh_tmp 1
execute if block ~ ~ ~ minecraft:lava run scoreboard players set $cancel gh_tmp 1
execute if predicate grapple:entity/is_on_ground run scoreboard players set $contact gh_tmp 1
execute positioned ~0.16 ~ ~ unless block ~ ~ ~ #grapple:movement_passable run scoreboard players set $contact gh_tmp 1
execute positioned ~-0.16 ~ ~ unless block ~ ~ ~ #grapple:movement_passable run scoreboard players set $contact gh_tmp 1
execute positioned ~ ~0.16 ~ unless block ~ ~ ~ #grapple:movement_passable run scoreboard players set $contact gh_tmp 1
execute positioned ~ ~-0.16 ~ unless block ~ ~ ~ #grapple:movement_passable run scoreboard players set $contact gh_tmp 1
execute positioned ~ ~ ~0.16 unless block ~ ~ ~ #grapple:movement_passable run scoreboard players set $contact gh_tmp 1
execute positioned ~ ~ ~-0.16 unless block ~ ~ ~ #grapple:movement_passable run scoreboard players set $contact gh_tmp 1
execute if score $cancel gh_tmp matches 0 if score $contact gh_tmp matches 1 run function grapple:flight/latch
