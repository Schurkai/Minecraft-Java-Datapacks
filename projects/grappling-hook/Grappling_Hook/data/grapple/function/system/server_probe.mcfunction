# Headless official-server probe. It proves load state and command parsing, not player input.
scoreboard players set $probe gh_tmp 1
execute unless data storage grapple:runtime {data_version:2} run scoreboard players set $probe gh_tmp 99
