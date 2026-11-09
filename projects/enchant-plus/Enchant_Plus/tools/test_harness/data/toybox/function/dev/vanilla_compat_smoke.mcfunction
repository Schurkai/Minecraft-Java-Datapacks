# Headless runtime proof that 26.2 accepts every edited compatibility tag,
# applies each requested group to one item, and never chooses above-vanilla
# levels. The command probe exercises the same canEnchant/areCompatible gates
# used by AnvilMenu before the remaining data-component assertions.
scoreboard players set $smoke_compat_fail ep_data 0
execute in minecraft:overworld run forceload add 16 16
execute in minecraft:overworld run setblock 16 100 16 minecraft:barrel
function toybox:dev/anvil_compat_probe

# Sharpness V + Smite + Bane of Arthropods.
execute in minecraft:overworld run item replace block 16 100 16 container.0 with minecraft:diamond_sword[minecraft:enchantments={"minecraft:sharpness":5}]
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/smite
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/bane_of_arthropods
scoreboard players set $compat_sharp ep_data -1
scoreboard players set $compat_smite ep_data -1
scoreboard players set $compat_bane ep_data -1
execute in minecraft:overworld store result score $compat_sharp ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:sharpness"
execute in minecraft:overworld store result score $compat_smite ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:smite"
execute in minecraft:overworld store result score $compat_bane ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:bane_of_arthropods"
execute unless score $compat_sharp ep_data matches 5 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_smite ep_data matches 1..5 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_bane ep_data matches 1..5 run scoreboard players add $smoke_compat_fail ep_data 1

# Density I-V + Breach I-IV + Sharpness/Smite/Bane I-V on one mace.
execute in minecraft:overworld run item replace block 16 100 16 container.0 with minecraft:mace
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/density
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/breach
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/sharpness
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/smite
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/bane_of_arthropods
scoreboard players set $compat_density ep_data -1
scoreboard players set $compat_breach ep_data -1
scoreboard players set $compat_mace_sharp ep_data -1
scoreboard players set $compat_mace_smite ep_data -1
scoreboard players set $compat_mace_bane ep_data -1
execute in minecraft:overworld store result score $compat_density ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:density"
execute in minecraft:overworld store result score $compat_breach ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:breach"
execute in minecraft:overworld store result score $compat_mace_sharp ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:sharpness"
execute in minecraft:overworld store result score $compat_mace_smite ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:smite"
execute in minecraft:overworld store result score $compat_mace_bane ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:bane_of_arthropods"
execute unless score $compat_density ep_data matches 1..5 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_breach ep_data matches 1..4 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_mace_sharp ep_data matches 1..5 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_mace_smite ep_data matches 1..5 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_mace_bane ep_data matches 1..5 run scoreboard players add $smoke_compat_fail ep_data 1

# Protection IV + all three specialized protections.
execute in minecraft:overworld run item replace block 16 100 16 container.0 with minecraft:diamond_chestplate[minecraft:enchantments={"minecraft:protection":4}]
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/blast_protection
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/fire_protection
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/projectile_protection
scoreboard players set $compat_prot ep_data -1
scoreboard players set $compat_blast_prot ep_data -1
scoreboard players set $compat_fire_prot ep_data -1
scoreboard players set $compat_proj_prot ep_data -1
execute in minecraft:overworld store result score $compat_prot ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:protection"
execute in minecraft:overworld store result score $compat_blast_prot ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:blast_protection"
execute in minecraft:overworld store result score $compat_fire_prot ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:fire_protection"
execute in minecraft:overworld store result score $compat_proj_prot ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:projectile_protection"
execute unless score $compat_prot ep_data matches 4 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_blast_prot ep_data matches 1..4 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_fire_prot ep_data matches 1..4 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_proj_prot ep_data matches 1..4 run scoreboard players add $smoke_compat_fail ep_data 1

# Mending I + Infinity I.
execute in minecraft:overworld run item replace block 16 100 16 container.0 with minecraft:bow[minecraft:enchantments={"minecraft:mending":1}]
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/infinity
scoreboard players set $compat_mending ep_data -1
scoreboard players set $compat_infinity ep_data -1
execute in minecraft:overworld store result score $compat_mending ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:mending"
execute in minecraft:overworld store result score $compat_infinity ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:infinity"
execute unless score $compat_mending ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_infinity ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1

# Multishot I + Piercing I-IV.
execute in minecraft:overworld run item replace block 16 100 16 container.0 with minecraft:crossbow[minecraft:enchantments={"minecraft:multishot":1}]
execute in minecraft:overworld run item modify block 16 100 16 container.0 toybox:dev/compat/piercing
scoreboard players set $compat_multishot ep_data -1
scoreboard players set $compat_piercing ep_data -1
execute in minecraft:overworld store result score $compat_multishot ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:multishot"
execute in minecraft:overworld store result score $compat_piercing ep_data run data get block 16 100 16 Items[{Slot:0b}].components."minecraft:enchantments"."minecraft:piercing"
execute unless score $compat_multishot ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_piercing ep_data matches 1..4 run scoreboard players add $smoke_compat_fail ep_data 1

# Tooltip insertion and in-place refresh preserve pre-existing lore and custom data.
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore]
execute in minecraft:overworld run summon minecraft:armor_stand 18 100 16 {Tags:["toybox_debug_anvil_lore"],Invisible:1b,NoGravity:1b}
execute in minecraft:overworld run item replace entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] weapon.mainhand with minecraft:netherite_sword[minecraft:repair_cost=7,minecraft:damage=5,minecraft:enchantments={"minecraft:unbreaking":3},minecraft:custom_name={text:"Anvil Proof"},minecraft:lore=[{text:"Preserved lore",color:"gold",italic:false}],minecraft:custom_data={toybox:{anvil_proof:1b}}]
data modify storage toybox:runtime anvil_lore.cost set value 7
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] run item modify entity @s weapon.mainhand toybox:anvil_lore_insert
scoreboard players set $compat_anvil_lore ep_data 0
scoreboard players set $compat_anvil_lore_value ep_data 0
execute in minecraft:overworld store result score $compat_anvil_lore ep_data run data get entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"
execute in minecraft:overworld if data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"[{translate:"message.enchant_plus.anvil.cost_lore",with:[{text:"7"}]}] run scoreboard players set $compat_anvil_lore_value ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"[{translate:"message.enchant_plus.anvil.cost_lore",with:["7"]}] run scoreboard players set $compat_anvil_lore_value ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"[{translate:"message.enchant_plus.anvil.cost_lore",with:[{extra:[{text:"7"}]}]}] run scoreboard players set $compat_anvil_lore_value ep_data 1
execute in minecraft:overworld unless data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"[{text:"Preserved lore"}] run scoreboard players add $smoke_compat_fail ep_data 1
execute in minecraft:overworld unless data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:custom_data"{toybox:{anvil_proof:1b,anvil_lore:1b}} run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_anvil_lore ep_data matches 2 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_anvil_lore_value ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute in minecraft:overworld run data modify entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:repair_cost" set value 15
data modify storage toybox:runtime anvil_lore.cost set value 15
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] run item modify entity @s weapon.mainhand toybox:anvil_lore_replace
scoreboard players set $compat_anvil_lore ep_data 0
scoreboard players set $compat_anvil_lore_value ep_data 0
execute in minecraft:overworld store result score $compat_anvil_lore ep_data run data get entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"
execute in minecraft:overworld if data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"[{translate:"message.enchant_plus.anvil.cost_lore",with:[{text:"15"}]}] run scoreboard players set $compat_anvil_lore_value ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"[{translate:"message.enchant_plus.anvil.cost_lore",with:["15"]}] run scoreboard players set $compat_anvil_lore_value ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"[{translate:"message.enchant_plus.anvil.cost_lore",with:[{extra:[{text:"15"}]}]}] run scoreboard players set $compat_anvil_lore_value ep_data 1
execute in minecraft:overworld unless data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"[{text:"Preserved lore"}] run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_anvil_lore ep_data matches 2 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_anvil_lore_value ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] run item modify entity @s weapon.mainhand toybox:reset_repair_cost
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] run item modify entity @s weapon.mainhand toybox:anvil_lore_remove
scoreboard players set $compat_anvil_lore ep_data 0
scoreboard players set $compat_anvil_lore_value ep_data 0
execute in minecraft:overworld store result score $compat_anvil_lore ep_data run data get entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"
execute in minecraft:overworld unless data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"[{translate:"message.enchant_plus.anvil.cost_lore"}] if data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:lore"[{text:"Preserved lore"}] if data entity @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore,limit=1] equipment.mainhand.components."minecraft:custom_data"{toybox:{anvil_proof:1b,anvil_lore:0b}} run scoreboard players set $compat_anvil_lore_value ep_data 1
execute unless score $compat_anvil_lore ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_anvil_lore_value ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_lore]

# Physical ritual: a closer zero-cost decoy is skipped, one Nether Star is
# consumed, repair_cost is removed, and the managed +0 lore is not retained.
execute in minecraft:overworld run data remove block 16 100 16 Items
execute in minecraft:overworld run setblock 16 100 16 minecraft:anvil
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_scanner]
execute in minecraft:overworld run summon minecraft:armor_stand 16.5 101.1 16.5 {Tags:["toybox_debug_anvil_scanner"],Invisible:1b,NoGravity:1b}
execute in minecraft:overworld run summon minecraft:item 16.45 101.1 16.45 {Tags:["toybox_debug_anvil_star"],PickupDelay:32767s,Item:{id:"minecraft:nether_star",count:2}}
execute in minecraft:overworld run summon minecraft:item 16.50 101.1 16.50 {Tags:["toybox_debug_anvil_decoy"],PickupDelay:32767s,Item:{id:"minecraft:iron_sword",count:1}}
execute in minecraft:overworld run summon minecraft:item 16.70 101.1 16.70 {Tags:["toybox_debug_anvil_target"],PickupDelay:32767s,Item:{id:"minecraft:netherite_sword",count:1,components:{"minecraft:repair_cost":31,"minecraft:damage":5,"minecraft:enchantments":{"minecraft:unbreaking":3},"minecraft:custom_name":{text:"Anvil Proof"},"minecraft:lore":[{translate:"message.enchant_plus.anvil.cost_lore",fallback:"Prior-work penalty: +31 levels",with:["31"],color:"dark_gray",italic:false},{text:"Preserved lore",color:"gold",italic:false}],"minecraft:custom_data":{toybox:{anvil_proof:1b,anvil_lore:1b}}}}}
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_scanner,limit=1] at @s run function toybox:anvil_reset/scan_player
scoreboard players set $compat_repair_cost ep_data 0
scoreboard players set $compat_anvil_keep ep_data 0
scoreboard players set $compat_anvil_ritual ep_data 0
scoreboard players set $compat_star_count ep_data 0
scoreboard players set $compat_anvil_lore ep_data 0
scoreboard players set $compat_anvil_lore_value ep_data 0
scoreboard players set $compat_anvil_decoy ep_data 0
execute in minecraft:overworld if data entity @e[type=minecraft:item,tag=toybox_debug_anvil_target,limit=1] Item.components."minecraft:repair_cost" run scoreboard players set $compat_repair_cost ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:item,tag=toybox_debug_anvil_target,limit=1] Item.components{"minecraft:damage":5} run scoreboard players add $compat_anvil_keep ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:item,tag=toybox_debug_anvil_target,limit=1] Item.components."minecraft:enchantments"."minecraft:unbreaking" run scoreboard players add $compat_anvil_keep ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:item,tag=toybox_debug_anvil_target,limit=1] Item.components."minecraft:custom_name" run scoreboard players add $compat_anvil_keep ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:item,tag=toybox_debug_anvil_target,limit=1] Item.components."minecraft:custom_data"{toybox:{anvil_proof:1b,anvil_lore:0b}} run scoreboard players add $compat_anvil_keep ep_data 1
execute in minecraft:overworld store result score $compat_anvil_lore ep_data run data get entity @e[type=minecraft:item,tag=toybox_debug_anvil_target,limit=1] Item.components."minecraft:lore"
execute in minecraft:overworld unless data entity @e[type=minecraft:item,tag=toybox_debug_anvil_target,limit=1] Item.components."minecraft:lore"[{translate:"message.enchant_plus.anvil.cost_lore"}] run scoreboard players set $compat_anvil_lore_value ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:item,tag=toybox_debug_anvil_target,limit=1] Item.components."minecraft:lore"[{text:"Preserved lore"}] run scoreboard players set $compat_anvil_ritual ep_data 1
execute in minecraft:overworld if entity @e[type=minecraft:item,tag=toybox_debug_anvil_decoy,limit=1] unless data entity @e[type=minecraft:item,tag=toybox_debug_anvil_decoy,limit=1] Item.components."minecraft:lore" run scoreboard players set $compat_anvil_decoy ep_data 1
execute in minecraft:overworld store result score $compat_star_count ep_data run data get entity @e[type=minecraft:item,tag=toybox_debug_anvil_star,limit=1] Item.count
execute unless score $compat_repair_cost ep_data matches 0 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_anvil_keep ep_data matches 4 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_anvil_ritual ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_star_count ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_anvil_lore ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_anvil_lore_value ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_anvil_decoy ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1

# Grindstone separation: remove only pack-added Wingbound components, return
# exactly one elytra, preserve item state, and remain idempotent on a rescan.
execute in minecraft:overworld run setblock 20 100 16 minecraft:grindstone
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox_debug_wing_scanner]
execute in minecraft:overworld run summon minecraft:armor_stand 20.5 101.1 16.5 {Tags:["toybox_debug_wing_scanner"],Invisible:1b,NoGravity:1b}
execute in minecraft:overworld run summon minecraft:item 20.5 101.1 16.5 {Tags:["toybox_debug_wing_target"],PickupDelay:32767s,Item:{id:"minecraft:diamond_chestplate",count:1,components:{"minecraft:glider":{},"minecraft:item_name":{translate:"item.enchant_plus.winged_diamond_chestplate",fallback:"날개 결속 다이아몬드 흉갑"},"minecraft:rarity":"rare","minecraft:enchantment_glint_override":1b,"minecraft:damage":5,"minecraft:repair_cost":9,"minecraft:enchantments":{"minecraft:unbreaking":3},"minecraft:custom_name":{text:"Preserved Wing Name"},"minecraft:lore":[{text:"Preserved wing lore"}],"minecraft:custom_data":{toybox:{wing_test:1b}}}}}
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox_debug_wing_scanner,limit=1] at @s run function toybox:wingbound/scan_player
execute in minecraft:overworld as @e[type=minecraft:armor_stand,tag=toybox_debug_wing_scanner,limit=1] at @s run function toybox:wingbound/scan_player
scoreboard players set $compat_wing_keep ep_data 0
scoreboard players set $compat_wing_removed ep_data 0
scoreboard players set $compat_wing_elytra ep_data 0
execute in minecraft:overworld unless data entity @e[type=minecraft:item,tag=toybox_debug_wing_target,limit=1] Item.components."minecraft:glider" unless data entity @e[type=minecraft:item,tag=toybox_debug_wing_target,limit=1] Item.components."minecraft:item_name" unless data entity @e[type=minecraft:item,tag=toybox_debug_wing_target,limit=1] Item.components."minecraft:rarity" unless data entity @e[type=minecraft:item,tag=toybox_debug_wing_target,limit=1] Item.components."minecraft:enchantment_glint_override" run scoreboard players set $compat_wing_removed ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:item,tag=toybox_debug_wing_target,limit=1] Item.components{"minecraft:damage":5,"minecraft:repair_cost":9} run scoreboard players add $compat_wing_keep ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:item,tag=toybox_debug_wing_target,limit=1] Item.components."minecraft:enchantments"."minecraft:unbreaking" run scoreboard players add $compat_wing_keep ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:item,tag=toybox_debug_wing_target,limit=1] Item.components."minecraft:custom_name" if data entity @e[type=minecraft:item,tag=toybox_debug_wing_target,limit=1] Item.components."minecraft:lore" run scoreboard players add $compat_wing_keep ep_data 1
execute in minecraft:overworld if data entity @e[type=minecraft:item,tag=toybox_debug_wing_target,limit=1] Item.components."minecraft:custom_data"{toybox:{wing_test:1b}} run scoreboard players add $compat_wing_keep ep_data 1
execute in minecraft:overworld positioned 20.5 101.1 16.5 as @e[type=minecraft:item,distance=..2] if items entity @s contents minecraft:elytra run scoreboard players add $compat_wing_elytra ep_data 1
execute unless score $compat_wing_removed ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_wing_keep ep_data matches 4 run scoreboard players add $smoke_compat_fail ep_data 1
execute unless score $compat_wing_elytra ep_data matches 1 run scoreboard players add $smoke_compat_fail ep_data 1

execute in minecraft:overworld run setblock 16 100 16 minecraft:air
execute in minecraft:overworld run setblock 20 100 16 minecraft:air
execute in minecraft:overworld run kill @e[type=minecraft:item,x=15,y=99,z=15,dx=7,dy=3,dz=3]
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox_debug_anvil_scanner]
execute in minecraft:overworld run kill @e[type=minecraft:armor_stand,tag=toybox_debug_wing_scanner]
execute in minecraft:overworld run forceload remove 16 16
