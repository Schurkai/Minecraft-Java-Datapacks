# Public guidance trigger; it never bypasses the Nether Star cost.
tellraw @s {"translate":"message.enchant_plus.anvil.hint","fallback":"[인챈트플러스] 비용 +1 이상인 장비와 네더의 별 1개를 Q키로 같은 모루 윗면에 던지세요.","color":"yellow"}
scoreboard players set @s ep_anvil 0
