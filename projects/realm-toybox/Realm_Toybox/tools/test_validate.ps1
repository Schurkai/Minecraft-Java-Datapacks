$ErrorActionPreference = 'Stop'
try { $Host.UI.RawUI.WindowTitle = 'Realm_Toybox.validator_self_test' } catch { }
$packRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$projectRoot = (Resolve-Path (Join-Path $packRoot '..')).Path
$resourceRoot = Join-Path $projectRoot 'Realm_Toybox_Resources'
$utf8NoBom = [Text.UTF8Encoding]::new($false)

function Invoke-Validator([string]$Root) {
  $previousPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    $output = & node (Join-Path $Root 'Realm_Toybox\tools\validate.mjs') 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousPreference
  }
  return [pscustomobject]@{ ExitCode=$exitCode; Output=$output }
}

function Assert-FailedWith($Result, [string]$Pattern, [string]$FailureMessage) {
  if ($Result.ExitCode -eq 0) { throw $FailureMessage }
  if ($Result.Output -notmatch $Pattern) {
    throw "Expected validation error was not found: $Pattern`n$($Result.Output)"
  }
}

$clean = Invoke-Validator $projectRoot
if ($clean.ExitCode -ne 0) { throw "Current source validation failed:`n$($clean.Output)" }

$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$fixtureRoot = Join-Path $tempBase ("Realm_Toybox.ValidatorTest." + [Guid]::NewGuid().ToString('N'))
$resolvedFixture = [IO.Path]::GetFullPath($fixtureRoot)
if (-not $resolvedFixture.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Validator test path is outside the system temporary directory.'
}

try {
  New-Item -ItemType Directory -Force $fixtureRoot | Out-Null
  Copy-Item -LiteralPath $packRoot -Destination (Join-Path $fixtureRoot 'Realm_Toybox') -Recurse
  if (Test-Path -LiteralPath $resourceRoot) {
    Copy-Item -LiteralPath $resourceRoot -Destination (Join-Path $fixtureRoot 'Realm_Toybox_Resources') -Recurse
  }

  $macroPath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\dev\invalid_macro.mcfunction'
  [IO.File]::WriteAllText($macroPath, "tellraw @a {`"text`":`"`$(missing_prefix)`"}`n", $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) 'invalid_macro\.mcfunction:1' 'Invalid function macro was accepted.'
  Remove-Item -LiteralPath $macroPath -Force

  $storagePath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\dev\invalid_storage_item.mcfunction'
  [IO.File]::WriteAllText($storagePath, "item replace entity @s weapon.mainhand from storage toybox:scratch result`n", $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) 'item replace \.\.\. from storage' 'Unsupported storage-based item replace was accepted.'
  Remove-Item -LiteralPath $storagePath -Force

  $modifierPath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\item_modifier\advanced_enchant\sharpness\11.json'
  $invalidModifier = [ordered]@{
    function = 'minecraft:set_enchantments'
    enchantments = [ordered]@{
      'minecraft:sharpness' = 11
      'minecraft:smite' = 1
    }
    add = $true
  } | ConvertTo-Json -Depth 10
  [IO.File]::WriteAllText($modifierPath, "$invalidModifier`n", $utf8NoBom)
  $modifierResult = Invoke-Validator $fixtureRoot
  Assert-FailedWith $modifierResult '\[ADV_MODIFIER_SINGLE\]' 'Multi-enchantment generated modifier was accepted.'
  Assert-FailedWith $modifierResult '\[ADV_MODIFIER_ADD\]' 'Generated modifier with add:true was accepted.'
  Assert-FailedWith $modifierResult '\[ADV_MODIFIER_LEVEL\]' 'Generated modifier above level 10 was accepted.'
  Remove-Item -LiteralPath $modifierPath -Force

  $translationPath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\dev\missing_translation.mcfunction'
  [IO.File]::WriteAllText($translationPath, "tellraw @a {`"translate`":`"message.toybox.validator_fixture_missing`"}`n", $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) '\[MCFUNCTION_TRANSLATION\].*message\.toybox\.validator_fixture_missing' 'Missing mcfunction translation was accepted.'
  Remove-Item -LiteralPath $translationPath -Force

  $clientRigPath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\dev\client_test\build_here.mcfunction'
  $validClientRig = [IO.File]::ReadAllText($clientRigPath)
  $invalidClientRig = $validClientRig.Replace(
    'setblock ~-2 ~0 ~-2 minecraft:bookshelf keep',
    'setblock ~-2 ~0 ~-2 minecraft:bookshelf'
  )
  if ($invalidClientRig -eq $validClientRig) { throw 'Client-kit fixture could not remove the keep guard.' }
  [IO.File]::WriteAllText($clientRigPath, $invalidClientRig, $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) '\[CLIENT_KIT_RIG\]' 'Unsafe or incomplete client-test rig was accepted.'
  [IO.File]::WriteAllText($clientRigPath, $validClientRig, $utf8NoBom)

  $advancementPath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\advancement\interaction\enchanting_table.json'
  $callbackPath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\advanced_enchant\interact.mcfunction'
  New-Item -ItemType Directory -Force (Split-Path -Parent $advancementPath), (Split-Path -Parent $callbackPath) | Out-Null
  $advancement = [ordered]@{
    criteria = [ordered]@{
      use = [ordered]@{
        trigger = 'minecraft:tick'
        conditions = [ordered]@{ location = [ordered]@{ block = [ordered]@{ blocks = 'minecraft:enchanting_table' } } }
      }
    }
    rewards = [ordered]@{ function = 'toybox:advanced_enchant/interact' }
  } | ConvertTo-Json -Depth 10
  [IO.File]::WriteAllText($advancementPath, "$advancement`n", $utf8NoBom)
  [IO.File]::WriteAllText($callbackPath, "advancement revoke @s only toybox:interaction/enchanting_table`n", $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) 'minecraft:default_block_use' 'Tick-based advanced-enchant entry point was accepted.'

  $sqrtPath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\building\measure\sqrt_step.mcfunction'
  $validSqrt = [IO.File]::ReadAllText($sqrtPath)
  $invalidSqrt = $validSqrt.Replace('matches ..15', 'matches ..14')
  if ($invalidSqrt -eq $validSqrt) { throw 'Building fixture could not shorten the square-root guard.' }
  [IO.File]::WriteAllText($sqrtPath, $invalidSqrt, $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) '\[BUILDING_MEASURE\]' 'Shortened measuring square-root search was accepted.'
  [IO.File]::WriteAllText($sqrtPath, $validSqrt, $utf8NoBom)

  $geometryPath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\building\measure\geometry.mcfunction'
  $validGeometry = [IO.File]::ReadAllText($geometryPath)
  $invalidGeometry = $validGeometry.Replace(
    'scoreboard players operation $volume_limit tb_data /= $span_z tb_data',
    '# volume overflow guard removed'
  )
  if ($invalidGeometry -eq $validGeometry) { throw 'Survey fixture could not remove the volume overflow guard.' }
  [IO.File]::WriteAllText($geometryPath, $invalidGeometry, $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) '\[SURVEY_GEOMETRY\]' 'Unsafe survey volume multiplication was accepted.'
  [IO.File]::WriteAllText($geometryPath, $validGeometry, $utf8NoBom)

  $compassApplyPath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\building\compass\apply\overworld.mcfunction'
  $validCompassApply = [IO.File]::ReadAllText($compassApplyPath)
  $invalidCompassApply = $validCompassApply.Replace('tracked:false', 'tracked:true')
  if ($invalidCompassApply -eq $validCompassApply) { throw 'Survey fixture could not enable destructive lodestone tracking.' }
  [IO.File]::WriteAllText($compassApplyPath, $invalidCompassApply, $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) '\[SURVEY_COMPASS\]' 'Tracked chalk compass was accepted.'
  [IO.File]::WriteAllText($compassApplyPath, $validCompassApply, $utf8NoBom)

  $chalkParticlePath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\building\chalk\particle\1.mcfunction'
  $validChalkParticle = [IO.File]::ReadAllText($chalkParticlePath)
  $invalidChalkParticle = $validChalkParticle.Replace('data remove storage toybox:runtime chalk_marker', '# cleanup removed')
  if ($invalidChalkParticle -eq $validChalkParticle) { throw 'Building fixture could not remove chalk scratch cleanup.' }
  [IO.File]::WriteAllText($chalkParticlePath, $invalidChalkParticle, $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) '\[BUILDING_CHALK\]' 'Chalk macro scratch leak was accepted.'
  [IO.File]::WriteAllText($chalkParticlePath, $validChalkParticle, $utf8NoBom)

  $padCheckPath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\building\jump_pad\check.mcfunction'
  $validPadCheck = [IO.File]::ReadAllText($padCheckPath)
  $invalidPadCheck = $validPadCheck.Replace(
    'if block ~ ~5 ~ #toybox:jump_pad_clearance',
    'if block ~ ~5 ~ minecraft:air'
  )
  if ($invalidPadCheck -eq $validPadCheck) { throw 'Building fixture could not remove the fifth jump-pad clearance tag check.' }
  [IO.File]::WriteAllText($padCheckPath, $invalidPadCheck, $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) '\[BUILDING_PAD\]' 'Unsafe jump-pad clearance was accepted.'
  [IO.File]::WriteAllText($padCheckPath, $validPadCheck, $utf8NoBom)

  $soupFinalizePath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\function\soup\load\finalize.mcfunction'
  $validSoupFinalize = [IO.File]::ReadAllText($soupFinalizePath)
  $invalidSoupFinalize = $validSoupFinalize.Replace(
    'clear @s minecraft:mushroom_stew 4',
    'clear @s minecraft:mushroom_stew 3'
  )
  if ($invalidSoupFinalize -eq $validSoupFinalize) { throw 'Soup fixture could not weaken the four-item transaction.' }
  [IO.File]::WriteAllText($soupFinalizePath, $invalidSoupFinalize, $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) '\[SOUP_TRANSACTION\]' 'Three-item Soup Pot transaction was accepted.'
  [IO.File]::WriteAllText($soupFinalizePath, $validSoupFinalize, $utf8NoBom)


  $sickleRecipePath = Join-Path $fixtureRoot 'Realm_Toybox\data\toybox\recipe\harvest_sickle.json'
  $validSickleRecipe = [IO.File]::ReadAllText($sickleRecipePath)
  $invalidSickleRecipe = $validSickleRecipe.Replace('"minecraft:blocks_attacks": {', '"minecraft:blocks_attacks_removed": {')
  if ($invalidSickleRecipe -eq $validSickleRecipe) { throw 'Sickle fixture could not remove the non-consuming use action.' }
  [IO.File]::WriteAllText($sickleRecipePath, $invalidSickleRecipe, $utf8NoBom)
  Assert-FailedWith (Invoke-Validator $fixtureRoot) '\[SICKLE_ITEM\]' 'Sickle without a non-consuming use action was accepted.'
  [IO.File]::WriteAllText($sickleRecipePath, $validSickleRecipe, $utf8NoBom)

  Write-Host 'Validator self-test passed: clean source and 13 negative fixtures.'
} finally {
  if (Test-Path -LiteralPath $fixtureRoot) {
    Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
  }
}
