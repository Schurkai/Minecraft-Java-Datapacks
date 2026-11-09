scoreboard players set @s tb_cshow 0
scoreboard players set @s tb_cslot 0
data remove storage toybox:runtime chalk_marker
tellraw @s {"translate":"message.toybox.chalk.stopped_dimension","fallback":"[Toybox] Chalk display stopped after a dimension change.","color":"gray"}
