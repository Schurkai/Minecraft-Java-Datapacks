param([string]$Version = 'v1.1.4-java-26.2')
$ErrorActionPreference = 'Stop'
try { $Host.UI.RawUI.WindowTitle = 'Enchant_Plus.resource_package' } catch { }
$root = (Resolve-Path $PSScriptRoot).Path
$project = (Resolve-Path (Join-Path $root '..')).Path
$release = Join-Path $project 'release'
New-Item -ItemType Directory -Force $release | Out-Null
$zip = Join-Path $release "Enchant_Plus_Resources_$Version.zip"
$sha = "$zip.sha256"
$tempZip = "$zip.tmp-$PID"
$tempSha = "$sha.tmp-$PID"
if (Test-Path -LiteralPath $tempZip) { Remove-Item -LiteralPath $tempZip -Force }
if (Test-Path -LiteralPath $tempSha) { Remove-Item -LiteralPath $tempSha -Force }

& node (Join-Path $project 'Enchant_Plus\tools\validate_compat.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Static validation failed; resource package was not replaced.' }

function Install-Artifact([string]$Source, [string]$Destination) {
  if (-not (Test-Path -LiteralPath $Destination)) {
    [IO.File]::Move($Source, $Destination)
    return
  }

  $backup = "$Destination.bak-$PID"
  if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Force }
  try {
    [IO.File]::Replace($Source, $Destination, $backup, $true)
  } finally {
    if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Force }
  }
}
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$files = Get-ChildItem -LiteralPath $root -Recurse -File -Force |
  Where-Object { $_.FullName -ne (Join-Path $root 'package.ps1') } |
  Sort-Object FullName
$zipStream = [IO.File]::Open($tempZip, [IO.FileMode]::CreateNew)
$writer = [IO.Compression.ZipArchive]::new($zipStream, [IO.Compression.ZipArchiveMode]::Create, $false)
try {
  foreach ($file in $files) {
    $relative = $file.FullName.Substring($root.Length).TrimStart([char[]]@('\', '/')).Replace('\', '/')
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
  if (-not ($archive.Entries.FullName -like 'assets/*')) { throw 'ZIP has no assets/ entries.' }
} finally { $archive.Dispose() }
$hash = (Get-FileHash -Algorithm SHA256 $tempZip).Hash.ToLowerInvariant()
"$hash  $([IO.Path]::GetFileName($zip))" | Set-Content -Encoding ascii -NoNewline $tempSha
Install-Artifact $tempZip $zip
Install-Artifact $tempSha $sha
Write-Host "Resource pack: $zip"
Write-Host "SHA-256: $hash"
