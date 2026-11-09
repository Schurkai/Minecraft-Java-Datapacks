summon minecraft:item ~ ~0.2 ~ {PickupDelay:10s,Motion:[0.0d,0.12d,0.0d],Item:{id:"minecraft:elytra",count:1}}
particle minecraft:enchant ~ ~0.2 ~ 0.35 0.25 0.35 0.15 18 force @a[distance=..16]
playsound minecraft:block.grindstone.use player @a[distance=..16] ~ ~ ~ 0.8 1.15
tellraw @a[tag=toybox.wingbound_scan_processing,distance=..4,sort=nearest,limit=1] {"translate":"message.enchant_plus.wingbound.separated","fallback":"[인챈트플러스] 날개 결속을 해제해 흉갑과 겉날개로 분리했습니다.","color":"aqua"}
