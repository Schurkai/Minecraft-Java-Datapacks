execute if score $soup_total tb_data matches 1.. run scoreboard players remove $soup_total tb_data 1
tellraw @a[tag=toybox.soup_user,limit=1] {"translate":"message.toybox.soup.corrupt","fallback":"[Toybox] Invalid Soup Pot data was removed without giving an item.","color":"red"}
kill @s
