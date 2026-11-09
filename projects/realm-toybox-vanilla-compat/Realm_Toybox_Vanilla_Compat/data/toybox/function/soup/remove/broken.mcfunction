execute if score $soup_total tb_data matches 1.. run scoreboard players remove $soup_total tb_data 1
tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.broken","fallback":"[Toybox] The Soup Pot structure was broken, so its remaining servings were discarded.","color":"red"}
kill @s
