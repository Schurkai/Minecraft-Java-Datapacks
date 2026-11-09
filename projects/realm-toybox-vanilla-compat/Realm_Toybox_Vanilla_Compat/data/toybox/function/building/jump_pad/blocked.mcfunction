scoreboard players set @s tb_padlock 1
playsound minecraft:block.iron_trapdoor.close player @s ~ ~ ~ 0.45 0.7
tellraw @s {"translate":"message.toybox.jump_pad.blocked","fallback":"[Toybox] Jump Pad needs five clear blocks above it. Step off to re-arm it.","color":"red"}
