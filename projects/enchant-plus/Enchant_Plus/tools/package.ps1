param([string]$Version = 'v1.1.4-java-26.2')
$ErrorActionPreference = 'Stop'
try { $Host.UI.RawUI.WindowTitle = 'Enchant_Plus.package' } catch { }
$packRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$projectRoot = (Resolve-Path (Join-Path $packRoot '..')).Path
$releaseDir = Join-Path $projectRoot 'release'
New-Item -ItemType Directory -Force $releaseDir | Out-Null
$zip = Join-Path $releaseDir "Enchant_Plus_$Version.zip"
$sha = "$zip.sha256"
$tempZip = "$zip.tmp-$PID"
$tempSha = "$sha.tmp-$PID"
if (Test-Path -LiteralPath $tempZip) { Remove-Item -LiteralPath $tempZip -Force }
if (Test-Path -LiteralPath $tempSha) { Remove-Item -LiteralPath $tempSha -Force }

function Install-Artifact([string]$Source, [string]$Destination) {
  if (-not (Test-Path -LiteralPath $Destination)) {
    [IO.File]::Move($Source, $Destination)
    return
  }

  # Windows PowerShell 5.1/.NET Framework rejects a null backup path for
  # File.Replace. A sibling backup keeps replacement atomic and is removed
  # only after the replacement call has returned.
  $backup = "$Destination.bak-$PID"
  if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Force }
  try {
    [IO.File]::Replace($Source, $Destination, $backup, $true)
  } finally {
    if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Force }
  }
}

& node (Join-Path $PSScriptRoot 'validate_compat.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Static validation failed; package was not replaced.' }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

# Compress-Archive writes backslashes into entry names on Windows. Java ZIP
# consumers require portable forward-slash paths such as data/toybox/..., so
# create every entry explicitly and normalize its relative path.
$toolsPrefix = (Join-Path $packRoot 'tools') + [IO.Path]::DirectorySeparatorChar
$testReport = Join-Path $packRoot 'TEST_REPORT.md'
$files = Get-ChildItem -LiteralPath $packRoot -Recurse -File -Force |
  Where-Object {
    -not $_.FullName.StartsWith($toolsPrefix, [StringComparison]::OrdinalIgnoreCase) -and
    -not $_.FullName.Equals($testReport, [StringComparison]::OrdinalIgnoreCase)
  } |
  Sort-Object FullName
$zipStream = [IO.File]::Open($tempZip, [IO.FileMode]::CreateNew)
$writer = [IO.Compression.ZipArchive]::new($zipStream, [IO.Compression.ZipArchiveMode]::Create, $false)
try {
  foreach ($file in $files) {
    $relative = $file.FullName.Substring($packRoot.Length).TrimStart([char[]]@('\', '/')).Replace('\', '/')
    $entry = $writer.CreateEntry($relative, [IO.Compression.CompressionLevel]::Optimal)
    $entry.LastWriteTime = [DateTimeOffset]::new(1980, 1, 1, 0, 0, 0, [TimeSpan]::Zero)
    $input = $file.OpenRead()
    $output = $entry.Open()
    try { $input.CopyTo($output) } finally { $output.Dispose(); $input.Dispose() }
  }
} finally {
  $writer.Dispose()
  $zipStream.Dispose()
}

$archive = [IO.Compression.ZipFile]::OpenRead($tempZip)
try {
  if (-not ($archive.Entries.FullName -contains 'pack.mcmeta')) { throw 'pack.mcmeta is missing at the ZIP root.' }
  if ($archive.Entries.FullName -match '\\') { throw 'ZIP contains non-portable backslash entry names.' }
  if (-not ($archive.Entries.FullName -like 'data/*')) { throw 'ZIP has no data/ entries.' }
  if ($archive.Entries.FullName -match '^data/[^/]+/enchantment/') { throw 'ZIP contains a dynamic enchantment registry entry.' }
  if ($archive.Entries.FullName -match '^data/toybox/(?:function|item_modifier)/dev/') { throw 'ZIP contains test-only dev resources.' }
  if ($archive.Entries.FullName -contains 'TEST_REPORT.md') { throw 'Mutable test report must stay outside the tested release artifact.' }
} finally { $archive.Dispose() }
$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $tempZip).Hash.ToLowerInvariant()
"$hash  $([IO.Path]::GetFileName($zip))" | Set-Content -Encoding ascii -NoNewline $tempSha
Install-Artifact $tempZip $zip
Install-Artifact $tempSha $sha
Write-Host "Package complete: $zip"
Write-Host "SHA-256: $hash"
