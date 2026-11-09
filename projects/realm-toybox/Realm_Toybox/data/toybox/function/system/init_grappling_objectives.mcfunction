scoreboard objectives add tb_gid dummy
scoreboard objectives add tb_gt dummy
scoreboard objectives add tb_gcd dummy
scoreboard players add $next tb_gid 0
data modify storage toybox:runtime grappling_objectives_initialized set value 1b
