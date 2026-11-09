# Event-only entry point; all scratch data is created and removed synchronously.
advancement revoke @s only toybox:interaction/brewing_stand
execute if items entity @s weapon.mainhand #toybox:alchemy_bottles if items entity @s weapon.offhand #toybox:alchemy_bottles run function toybox:alchemy/prepare
