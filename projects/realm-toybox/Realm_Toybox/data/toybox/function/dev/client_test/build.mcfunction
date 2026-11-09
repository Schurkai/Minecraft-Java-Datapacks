# Explicit developer command. Builds in empty space eight blocks ahead without replacing occupied blocks.
execute rotated ~ 0 positioned ^ ^ ^8 align xyz run function toybox:dev/client_test/build_here
