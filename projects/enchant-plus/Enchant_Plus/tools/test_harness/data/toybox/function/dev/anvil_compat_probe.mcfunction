# Test-harness compatibility proof. Vanilla 26.2 AnvilMenu.createResult and the
# /enchant command both call Enchantment.canEnchant and
# Enchantment.areCompatible, so these success scores exercise the same two
# gates that decide whether an enchanted book may enter the anvil result.
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat]
execute in minecraft:overworld run summon minecraft:armor_stand 18 100 16 {Tags:["toybox_debug_anvil_compat"],Invisible:1b,NoGravity:1b}

# Sword: Sharpness V + Smite V + Bane of Arthropods V.
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] weapon.mainhand with minecraft:diamond_sword
execute in minecraft:overworld store success score $anvil_sword_sharp ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:sharpness 5
execute in minecraft:overworld store success score $anvil_sword_smite ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:smite 5
execute in minecraft:overworld store success score $anvil_sword_bane ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:bane_of_arthropods 5

# Exact survival-world regression: worked Smite V sword, then Sharpness V and Bane V books.
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] weapon.mainhand with minecraft:netherite_sword[minecraft:repair_cost=1]
execute in minecraft:overworld store success score $anvil_sword_smite_rev ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:smite 5
execute in minecraft:overworld store success score $anvil_sword_sharp_rev ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:sharpness 5
execute in minecraft:overworld store success score $anvil_sword_bane_rev ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:bane_of_arthropods 5

# Mace: Density V + Breach IV + Sharpness V + Smite V + Bane V.
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] weapon.mainhand with minecraft:mace
execute in minecraft:overworld store success score $anvil_mace_density ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:density 5
execute in minecraft:overworld store success score $anvil_mace_breach ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:breach 4
execute in minecraft:overworld store success score $anvil_mace_sharp ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:sharpness 5
execute in minecraft:overworld store success score $anvil_mace_smite ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:smite 5
execute in minecraft:overworld store success score $anvil_mace_bane ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:bane_of_arthropods 5

# Armor: all four Protections.
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] weapon.mainhand with minecraft:diamond_chestplate
execute in minecraft:overworld store success score $anvil_armor_prot ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:protection 4
execute in minecraft:overworld store success score $anvil_armor_blast ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:blast_protection 4
execute in minecraft:overworld store success score $anvil_armor_fire ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:fire_protection 4
execute in minecraft:overworld store success score $anvil_armor_proj ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:projectile_protection 4

# Bow: Mending I + Infinity I, then reverse order on a fresh bow.
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] weapon.mainhand with minecraft:bow
execute in minecraft:overworld store success score $anvil_bow_mending ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:mending 1
execute in minecraft:overworld store success score $anvil_bow_infinity ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:infinity 1
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] weapon.mainhand with minecraft:bow
execute in minecraft:overworld store success score $anvil_bow_infinity_rev ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:infinity 1
execute in minecraft:overworld store success score $anvil_bow_mending_rev ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:mending 1

# Crossbow: Multishot I + Piercing IV, then reverse order.
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] weapon.mainhand with minecraft:crossbow
execute in minecraft:overworld store success score $anvil_cross_multi ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:multishot 1
execute in minecraft:overworld store success score $anvil_cross_pierce ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:piercing 4
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] weapon.mainhand with minecraft:crossbow
execute in minecraft:overworld store success score $anvil_cross_pierce_rev ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:piercing 4
execute in minecraft:overworld store success score $anvil_cross_multi_rev ep_data run enchant @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat,limit=1] minecraft:multishot 1

execute unless score $anvil_sword_sharp ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_sword_smite ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_sword_bane ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_sword_smite_rev ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_sword_sharp_rev ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_sword_bane_rev ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_mace_density ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_mace_breach ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_mace_sharp ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_mace_smite ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_mace_bane ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_armor_prot ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_armor_blast ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_armor_fire ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_armor_proj ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_bow_mending ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_bow_infinity ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_bow_infinity_rev ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_bow_mending_rev ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_cross_multi ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_cross_pierce ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_cross_pierce_rev ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $anvil_cross_multi_rev ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1

execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_compat]
