scoreboard players set $soup_given tb_data 0
execute if score @s tb_stype matches 1 store success score $soup_given tb_data run item replace entity @a[tag=toybox.soup_user,limit=1] weapon.mainhand with minecraft:mushroom_stew
execute if score @s tb_stype matches 2 store success score $soup_given tb_data run item replace entity @a[tag=toybox.soup_user,limit=1] weapon.mainhand with minecraft:rabbit_stew
execute if score @s tb_stype matches 3 store success score $soup_given tb_data run item replace entity @a[tag=toybox.soup_user,limit=1] weapon.mainhand with minecraft:beetroot_soup
execute if score $soup_given tb_data matches 1 run scoreboard players remove @s tb_sleft 1
execute if score $soup_given tb_data matches 1 run scoreboard players operation $soup_left tb_data = @s tb_sleft
execute if score $soup_given tb_data matches 1 run tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.served","fallback":"[Toybox] Serving taken. %s remain.","color":"green","with":[{"score":{"name":"$soup_left","objective":"tb_data"}}]}
execute if score $soup_given tb_data matches 1 run particle minecraft:smoke ~ ~0.7 ~ 0.18 0.2 0.18 0.01 5 force @a[tag=toybox.soup_user,limit=1]
execute if score $soup_given tb_data matches 1 run playsound minecraft:item.bowl.empty player @a[tag=toybox.soup_user,limit=1] ~ ~ ~ 0.8 1.0
execute if score $soup_given tb_data matches 1 if score @s tb_sleft matches 0 run function toybox:soup/remove/empty
execute if score $soup_given tb_data matches 0 run tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.serve_failed","fallback":"[Toybox] The serving could not be placed; no serving was consumed.","color":"red"}
