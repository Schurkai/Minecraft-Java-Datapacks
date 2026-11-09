scoreboard players set @s tb_mstate 0
scoreboard players set @s tb_measure 0
tellraw @s {"translate":"message.toybox.measure.cancel","fallback":"[Toybox] Measurement start cleared.","color":"gray"}
