execute if score $soup_total tb_data matches 1.. run scoreboard players remove $soup_total tb_data 1
tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.removed","fallback":"[Toybox] Soup Pot removed. Remaining servings were discarded.","color":"gray"}
particle minecraft:smoke ~ ~0.6 ~ 0.2 0.2 0.2 0.01 6 force @a[tag=toybox.soup_user,limit=1]
kill @s
