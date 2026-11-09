# Player-bounded trigger checks; no global projectile/entity scanning.
scoreboard players enable @a tb_help
scoreboard players enable @a tb_anvil
scoreboard players enable @a tb_measure
scoreboard players enable @a tb_chalk
scoreboard players enable @a tb_chshow
scoreboard players enable @a tb_soup
scoreboard players enable @a tb_compass
scoreboard players add @a tb_pver 0
scoreboard players add @a tb_gcd 0
scoreboard players add @a tb_rcd 0
scoreboard players add @a tb_leave 0
scoreboard players add @a tb_gleave 0
scoreboard players add @a tb_death 0
scoreboard players add @a tb_gdeath 0
scoreboard players add @a tb_padlock 0
execute as @a[scores={tb_pver=..899}] run function toybox:system/migrate_player
execute as @a[scores={tb_help=1..}] run function toybox:help
execute as @a[scores={tb_anvil=1..}] run function toybox:anvil_reset/attempt
execute as @a[scores={tb_measure=1,tb_mstate=1}] at @s run function toybox:building/measure/finish
execute as @a[scores={tb_measure=1,tb_mstate=0}] at @s run function toybox:building/measure/start
execute as @a[scores={tb_measure=2..}] run function toybox:building/measure/cancel
execute as @a[scores={tb_measure=..-1}] run function toybox:building/measure/cancel
execute as @a[scores={tb_chalk=1..}] at @s run function toybox:building/chalk/save_dispatch
execute as @a[scores={tb_chalk=..-1}] at @s run function toybox:building/chalk/save_dispatch
execute as @a[scores={tb_chshow=1..}] at @s run function toybox:building/chalk/show_dispatch
execute as @a[scores={tb_chshow=..-1}] at @s run function toybox:building/chalk/show_dispatch
execute as @a[scores={tb_soup=1..}] at @s run function toybox:soup/start
execute as @a[scores={tb_soup=..-1}] at @s run function toybox:soup/start
execute as @a[scores={tb_compass=1..}] at @s run function toybox:building/compass/dispatch
execute as @a[scores={tb_compass=..-1}] at @s run function toybox:building/compass/dispatch
execute as @a[scores={tb_cshow=1..}] at @s run function toybox:building/chalk/tick
execute as @a[scores={tb_padlock=0}] at @s if predicate toybox:player/jump_pad_eligible if block ~ ~ ~ minecraft:heavy_weighted_pressure_plate if block ~ ~-1 ~ minecraft:yellow_glazed_terracotta run function toybox:building/jump_pad/check
execute as @a[scores={tb_padlock=1}] at @s if predicate toybox:entity/is_on_ground unless block ~ ~ ~ minecraft:heavy_weighted_pressure_plate run scoreboard players set @s tb_padlock 0
execute as @a[scores={tb_padlock=1}] at @s if predicate toybox:entity/is_on_ground if block ~ ~ ~ minecraft:heavy_weighted_pressure_plate unless block ~ ~-1 ~ minecraft:yellow_glazed_terracotta run scoreboard players set @s tb_padlock 0
scoreboard players remove @a[scores={tb_gcd=1..}] tb_gcd 1
scoreboard players remove @a[scores={tb_rcd=1..}] tb_rcd 1
scoreboard players remove @a[tag=toybox.sickle_active,scores={tb_scd=1..}] tb_scd 1
execute as @a[tag=toybox.sickle_active,scores={tb_scd=..0}] run function toybox:farming/sickle/rearm
tag @a[tag=toybox.grappling_current] remove toybox.grappling_current
execute as @a[tag=toybox.grappling_active] at @s run function toybox:grappling/tick_player
