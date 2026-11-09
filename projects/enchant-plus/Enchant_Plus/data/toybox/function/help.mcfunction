scoreboard players set @s ep_help 0
tellraw @s {"text":""}
tellraw @s {"translate":"message.enchant_plus.help.title","fallback":"인챈트플러스 v1.1.4 | Minecraft Java 26.2","color":"aqua","bold":true}
tellraw @s {"translate":"message.enchant_plus.help.enchantments","fallback":"• 모루 중복(레벨은 바닐라 상한): 날카로움·강타·살충 / 보호 4종 / 수선·무한 / 다중 발사·관통 / 철퇴 육중·격파·날카로움·강타·살충","color":"red"}
tellraw @s {"translate":"message.enchant_plus.help.wingbound","fallback":"• 날개 결속: 제작 칸에서 흉갑 1개 + 겉날개 1개 조합 (모루 아님)","color":"aqua"}
tellraw @s {"translate":"message.enchant_plus.help.wingbound_separate","fallback":"• 날개 분리: 날개 결속 흉갑을 Q키로 숫돌 윗면에 올리기 (흉갑·겉날개 반환)","color":"aqua"}
tellraw @s {"translate":"message.enchant_plus.help.anvil","fallback":"• 비용 초기화: 누적 작업 비용이 +1 이상인 장비와 네더의 별 1개를 Q키로 같은 모루 윗면에 던지기","color":"yellow"}
tellraw @s {"translate":"message.enchant_plus.help.anvil_cost","fallback":"• 표시값은 마인크래프트의 이전 작업 페널티이며 +0은 표시하지 않음","color":"gray"}
tellraw @s {"translate":"message.enchant_plus.help.commands","fallback":"• 도움말: /trigger ep_help | 재련 안내: /trigger ep_anvil","color":"green"}
tellraw @s {"text":""}
