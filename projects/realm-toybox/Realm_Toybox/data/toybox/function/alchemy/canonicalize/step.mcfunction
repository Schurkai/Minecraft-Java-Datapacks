data modify storage toybox:scratch alchemy.current set from storage toybox:scratch alchemy.queue[0]
data remove storage toybox:scratch alchemy.queue[0]
execute unless data storage toybox:scratch alchemy.current.amplifier run data modify storage toybox:scratch alchemy.current.amplifier set value 0
execute unless data storage toybox:scratch alchemy.current.duration run data modify storage toybox:scratch alchemy.current.duration set value 1
scoreboard players set $amp tb_data -999
scoreboard players set $duration tb_data -999
execute store result score $amp tb_data run data get storage toybox:scratch alchemy.current.amplifier
execute store result score $duration tb_data run data get storage toybox:scratch alchemy.current.duration
execute unless data storage toybox:scratch alchemy.current.id run scoreboard players set $invalid tb_data 1
execute if data storage toybox:scratch alchemy.current.hidden_effect run scoreboard players set $invalid tb_data 1
execute unless score $amp tb_data matches 0..4 run scoreboard players set $invalid tb_data 1
execute unless score $duration tb_data matches 1..72000 run scoreboard players set $invalid tb_data 1
execute if score $invalid tb_data matches 1 run scoreboard players set $reason tb_data 1
execute if score $invalid tb_data matches 0 run function toybox:alchemy/canonicalize/dispatch
execute if score $invalid tb_data matches 0 run function toybox:alchemy/canonicalize/queue
