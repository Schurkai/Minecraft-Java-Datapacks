# Require five clear air-like blocks above the pressure plate.
execute if block ~ ~1 ~ #toybox:jump_pad_clearance if block ~ ~2 ~ #toybox:jump_pad_clearance if block ~ ~3 ~ #toybox:jump_pad_clearance if block ~ ~4 ~ #toybox:jump_pad_clearance if block ~ ~5 ~ #toybox:jump_pad_clearance run function toybox:building/jump_pad/activate
execute if score @s tb_padlock matches 0 run function toybox:building/jump_pad/blocked
