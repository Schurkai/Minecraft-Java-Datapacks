param(
  [string]$ServerJar = (Join-Path $PSScriptRoot '..\..\server-26.2.jar'),
  [string]$Java = 'java'
)
$ErrorActionPreference = 'Stop'
try { $Host.UI.RawUI.WindowTitle = 'Grappling_Hook.test_all' } catch { }
$packRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$projectRoot = (Resolve-Path (Join-Path $packRoot '..')).Path
$artifact = Join-Path $projectRoot 'release\Grappling_Hook_v0.1.0-rc1-java-26.2.zip'

& node (Join-Path $PSScriptRoot 'generate_movement.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Movement generation failed.' }
& node (Join-Path $PSScriptRoot 'validate.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Static validation failed.' }

& (Join-Path $PSScriptRoot 'test_server.ps1') -ServerJar $ServerJar -PackArtifact $packRoot -Java $Java
if ($LASTEXITCODE -ne 0) { throw 'Source server test failed.' }

& (Join-Path $PSScriptRoot 'package.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Packaging failed.' }

& (Join-Path $PSScriptRoot 'test_server.ps1') -ServerJar $ServerJar -PackArtifact $artifact -Java $Java
if ($LASTEXITCODE -ne 0) { throw 'Release ZIP server test failed.' }

Write-Host 'Grappling Hook v0.1.0-rc1 automated test suite passed.'
