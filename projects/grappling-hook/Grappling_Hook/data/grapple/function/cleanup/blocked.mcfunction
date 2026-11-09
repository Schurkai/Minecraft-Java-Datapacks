title @s actionbar {"text":"갈고리 경로가 막혔습니다.","color":"red"}
playsound minecraft:block.iron_trapdoor.close player @s ~ ~ ~ 0.5 0.7
scoreboard players set @s gh_cd 30
function grapple:cleanup/reset
