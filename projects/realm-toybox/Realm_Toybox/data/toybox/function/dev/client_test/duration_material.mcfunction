clear @s minecraft:glowstone_dust[minecraft:custom_data~{toybox:{client_test:1b}}]
clear @s minecraft:redstone[minecraft:custom_data~{toybox:{client_test:1b}}]
give @s minecraft:redstone[minecraft:custom_name={translate:"item.toybox.test.material",fallback:"[TEST] Exact-Budget Material",color:"yellow",italic:false},minecraft:custom_data={toybox:{client_test:1b}}] 4
tellraw @s {"translate":"message.toybox.dev.client_test.duration_ready","fallback":"[Toybox Test] Duration mode ready: exactly 4 tagged redstone dust added. Carry no glowstone.","color":"dark_aqua"}
