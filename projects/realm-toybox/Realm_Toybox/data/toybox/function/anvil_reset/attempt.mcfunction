# Reset score at the end so one request is processed once.
execute unless entity @s[level=5..] run tellraw @s {"translate":"message.toybox.anvil.need_levels","fallback":"[Toybox] You need at least 5 experience levels.","color":"red"}
execute if entity @s[level=5..] unless items entity @s inventory.* minecraft:amethyst_shard run tellraw @s {"translate":"message.toybox.anvil.need_shard","fallback":"[Toybox] You need 1 amethyst shard in your inventory.","color":"red"}
execute if entity @s[level=5..] if items entity @s inventory.* minecraft:amethyst_shard unless items entity @s weapon.mainhand * run tellraw @s {"translate":"message.toybox.anvil.need_item","fallback":"[Toybox] Hold the item to reset in your main hand.","color":"red"}
execute if entity @s[level=5..] if items entity @s inventory.* minecraft:amethyst_shard if items entity @s weapon.mainhand * run function toybox:anvil_reset/success
scoreboard players set @s tb_anvil 0
