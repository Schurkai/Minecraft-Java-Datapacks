scoreboard players set $applied tb_data 0
execute store success score $applied tb_data run item modify entity @s weapon.mainhand toybox:advanced_enchant/fire_protection/5
execute if score $applied tb_data matches 1 run function toybox:advanced_enchant/consume/5
execute unless score $applied tb_data matches 1 run tellraw @s {"translate":"message.toybox.advanced_enchant.apply_failed","fallback":"[Toybox] The item could not be upgraded; nothing was consumed.","color":"red"}
