param(
  [string]$ServerJar = '',
  [string]$Version = 'v1.1.4-java-26.2'
)
$ErrorActionPreference = 'Stop'
try { $Host.UI.RawUI.WindowTitle = 'Enchant_Plus.test_all' } catch { }

$packRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$projectRoot = (Resolve-Path (Join-Path $packRoot '..')).Path
$resourceRoot = Join-Path $projectRoot 'Enchant_Plus_Resources'
if ([string]::IsNullOrWhiteSpace($ServerJar)) { $ServerJar = Join-Path $projectRoot 'server-26.2.jar' }
$jar = (Resolve-Path -LiteralPath $ServerJar).Path
$dataZip = Join-Path $projectRoot "release\Enchant_Plus_$Version.zip"
$resourceZip = Join-Path $projectRoot "release\Enchant_Plus_Resources_$Version.zip"

& node (Join-Path $PSScriptRoot 'validate_compat.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Static validation failed.' }

& (Join-Path $PSScriptRoot 'test_server.ps1') -ServerJar $jar -PackArtifact $packRoot

& (Join-Path $PSScriptRoot 'package.ps1') -Version $Version
$dataHash1 = (Get-FileHash -Algorithm SHA256 -LiteralPath $dataZip).Hash
& (Join-Path $PSScriptRoot 'package.ps1') -Version $Version
$dataHash2 = (Get-FileHash -Algorithm SHA256 -LiteralPath $dataZip).Hash
if ($dataHash1 -ne $dataHash2) { throw 'Data-pack packaging is not deterministic.' }

& (Join-Path $resourceRoot 'package.ps1') -Version $Version
$resourceHash1 = (Get-FileHash -Algorithm SHA256 -LiteralPath $resourceZip).Hash
& (Join-Path $resourceRoot 'package.ps1') -Version $Version
$resourceHash2 = (Get-FileHash -Algorithm SHA256 -LiteralPath $resourceZip).Hash
if ($resourceHash1 -ne $resourceHash2) { throw 'Resource-pack packaging is not deterministic.' }

& (Join-Path $PSScriptRoot 'test_server.ps1') -ServerJar $jar -PackArtifact $dataZip

Write-Host 'Enchant Plus full verification passed.'
Write-Host "Data pack SHA-256: $($dataHash2.ToLowerInvariant())"
Write-Host "Resource pack SHA-256: $($resourceHash2.ToLowerInvariant())"
