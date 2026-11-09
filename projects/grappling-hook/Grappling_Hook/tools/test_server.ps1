param(
  [Parameter(Mandatory=$true)][string]$ServerJar,
  [Parameter(Mandatory=$true)][string]$PackArtifact,
  [string]$Java = 'java',
  [int]$MaxBootSeconds = 180,
  [string]$ExpectedServerSha1 = '823e2250d24b3ddac457a60c92a6a941943fcd6a'
)
$ErrorActionPreference = 'Stop'
try { $Host.UI.RawUI.WindowTitle = 'Grappling_Hook.server_test' } catch { }
$utf8NoBom = [Text.UTF8Encoding]::new($false)
$packRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$projectRoot = (Resolve-Path (Join-Path $packRoot '..')).Path
$jar = (Resolve-Path -LiteralPath $ServerJar).Path
$packInput = (Resolve-Path -LiteralPath $PackArtifact).Path
$testRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot '.test_server_grappling_hook'))
$expectedTestRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot '.test_server_grappling_hook'))
$jobId = 'Grappling_Hook.server_test'
$runId = [Guid]::NewGuid().ToString('N')
$pidFile = Join-Path $projectRoot '.grappling-hook-server-test.pid.json'
$lockFile = Join-Path $projectRoot '.grappling-hook-server-test.lock'
$logPath = Join-Path $testRoot 'grappling-hook-test.log'
$lockStream = $null
$script:activeProcess = $null

function Resolve-JavaExecutable([string]$Command) {
  $probeInfo = [Diagnostics.ProcessStartInfo]::new()
  $probeInfo.FileName = $Command
  $probeInfo.Arguments = '-XshowSettings:properties -version'
  $probeInfo.UseShellExecute = $false
  $probeInfo.RedirectStandardOutput = $true
  $probeInfo.RedirectStandardError = $true
  $probe = [Diagnostics.Process]::new()
  $probe.StartInfo = $probeInfo
  try {
    [void]$probe.Start()
    $stdoutTask = $probe.StandardOutput.ReadToEndAsync()
    $stderrTask = $probe.StandardError.ReadToEndAsync()
    if (-not $probe.WaitForExit(15000)) {
      Stop-Process -Id $probe.Id -Force -ErrorAction SilentlyContinue
      throw 'Java path probe timed out.'
    }
    if (-not $stdoutTask.Wait(5000) -or -not $stderrTask.Wait(5000)) { throw 'Java path probe output did not close.' }
    $settings = $stdoutTask.Result + "`n" + $stderrTask.Result
    $match = [regex]::Match($settings, '(?m)^\s*java\.home\s*=\s*(.+?)\s*$')
    if (-not $match.Success) { throw 'Could not resolve java.home from the selected Java command.' }
    return (Resolve-Path -LiteralPath (Join-Path $match.Groups[1].Value 'bin\java.exe')).Path
  } finally {
    $probe.Dispose()
  }
}

function Get-ProcessCommandLine([int]$ProcessId) {
  try {
    return (Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction Stop).CommandLine
  } catch {
    return $null
  }
}

function Stop-OwnedProcess([Diagnostics.Process]$Process) {
  if ($Process.HasExited) { return $true }
  try {
    $Process.StandardInput.WriteLine('stop')
    $Process.StandardInput.Flush()
  } catch { }
  try { if ($Process.WaitForExit(10000)) { return $true } } catch { }
  try { Stop-Process -Id $Process.Id -Force -ErrorAction Stop } catch { }
  try { return $Process.WaitForExit(10000) } catch { return $false }
}

function Write-LogLine([IO.StreamWriter]$Writer, [string]$Line) {
  $Writer.WriteLine($Line)
  $Writer.Flush()
}

function Assert-SafeTestRoot {
  $projectPrefix = $projectRoot.TrimEnd([char[]]@('\', '/')) + [IO.Path]::DirectorySeparatorChar
  if (-not $testRoot.StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing recursive cleanup outside the project: $testRoot"
  }
  if (-not $testRoot.Equals($expectedTestRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing unexpected test root: $testRoot"
  }
}

function Remove-StaleOwnedProcess {
  if (-not (Test-Path -LiteralPath $pidFile)) { return }
  $stale = Get-Content -Raw -Encoding UTF8 $pidFile | ConvertFrom-Json
  $process = Get-Process -Id ([int]$stale.pid) -ErrorAction SilentlyContinue
  if (-not $process) {
    Remove-Item -LiteralPath $pidFile -Force
    return
  }
  $commandLine = Get-ProcessCommandLine ([int]$stale.pid)
  $jobMarker = "-Dgrappling_hook.job=$($stale.job)"
  $runMarker = "-Dgrappling_hook.run=$($stale.run_id)"
  if (-not $commandLine -or -not $commandLine.Contains($jobMarker) -or -not $commandLine.Contains($runMarker)) {
    throw "PID $($stale.pid) exists but cannot be proven to belong to $jobId; refusing to terminate it."
  }
  Stop-Process -Id ([int]$stale.pid) -Force
  $process.WaitForExit(10000)
  if (Get-Process -Id ([int]$stale.pid) -ErrorAction SilentlyContinue) {
    throw "Could not stop orphaned $jobId PID $($stale.pid); PID metadata was retained."
  }
  Remove-Item -LiteralPath $pidFile -Force
  Write-Host "Stopped orphaned $jobId PID $($stale.pid)"
}

function Install-PackArtifact([string]$Artifact, [string]$Datapacks) {
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  if (Test-Path -LiteralPath $Artifact -PathType Container) {
    if (-not (Test-Path -LiteralPath (Join-Path $Artifact 'pack.mcmeta') -PathType Leaf)) {
      throw 'Source pack has no root pack.mcmeta.'
    }
    if (-not (Test-Path -LiteralPath (Join-Path $Artifact 'data') -PathType Container)) {
      throw 'Source pack has no data directory.'
    }
    $destination = Join-Path $Datapacks 'Grappling_Hook'
    New-Item -ItemType Directory -Force $destination | Out-Null
    Copy-Item -LiteralPath (Join-Path $Artifact 'pack.mcmeta') -Destination $destination
    Copy-Item -LiteralPath (Join-Path $Artifact 'data') -Destination $destination -Recurse
    return 'source directory'
  }
  if ([IO.Path]::GetExtension($Artifact) -ieq '.zip') {
    $archive = [IO.Compression.ZipFile]::OpenRead($Artifact)
    try {
      if (-not ($archive.Entries.FullName -contains 'pack.mcmeta')) { throw 'Release ZIP has no root pack.mcmeta.' }
      if ($archive.Entries.FullName -match '\\') { throw 'Release ZIP contains backslash entry names.' }
      if (-not ($archive.Entries.FullName -like 'data/*')) { throw 'Release ZIP has no data entries.' }
    } finally {
      $archive.Dispose()
    }
    Copy-Item -LiteralPath $Artifact -Destination (Join-Path $Datapacks 'Grappling_Hook.zip')
    return 'release ZIP'
  }
  throw "Pack artifact must be a directory or ZIP: $Artifact"
}

$javaExecutable = Resolve-JavaExecutable $Java
$actualSha1 = (Get-FileHash -Algorithm SHA1 -LiteralPath $jar).Hash.ToLowerInvariant()
if ($actualSha1 -ne $ExpectedServerSha1.ToLowerInvariant()) {
  throw "Unexpected server JAR SHA-1: $actualSha1"
}

try {
  $lockStream = [IO.File]::Open($lockFile, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
  Remove-StaleOwnedProcess
  Assert-SafeTestRoot
  if (Test-Path -LiteralPath $testRoot) { Remove-Item -LiteralPath $testRoot -Recurse -Force }

  $datapacks = Join-Path $testRoot 'world\datapacks'
  New-Item -ItemType Directory -Force $datapacks | Out-Null
  $artifactLabel = Install-PackArtifact $packInput $datapacks
  'eula=true' | Set-Content -Encoding ascii (Join-Path $testRoot 'eula.txt')
  @(
    'online-mode=false',
    'server-port=25585',
    'level-name=world',
    'level-type=minecraft:flat',
    'generator-settings={"biome":"minecraft:plains","layers":[{"block":"minecraft:bedrock","height":1},{"block":"minecraft:dirt","height":2},{"block":"minecraft:grass_block","height":1}]}',
    'generate-structures=false',
    'level-seed=GrapplingHookDeterministicRC1',
    'gamemode=creative',
    'difficulty=peaceful',
    'spawn-protection=0',
    'view-distance=4',
    'simulation-distance=4',
    'enable-query=false',
    'enable-rcon=false',
    'pause-when-empty-seconds=-1',
    'motd=Grappling Hook RC1 automated test'
  ) | Set-Content -Encoding ascii (Join-Path $testRoot 'server.properties')
  New-Item -ItemType Directory -Force (Join-Path $testRoot 'tmp'), (Join-Path $testRoot 'jna') | Out-Null
  [IO.File]::WriteAllText($logPath, "Grappling Hook RC1 official server test`r`nartifact=$packInput`r`nsha1=$actualSha1`r`n", $utf8NoBom)

  $listenerBefore = Get-NetTCPConnection -LocalPort 25585 -State Listen -ErrorAction SilentlyContinue
  if ($listenerBefore) { throw "Test port 25585 is already occupied by PID $($listenerBefore.OwningProcess)." }

  function Invoke-Boot([bool]$Reload, [string]$Label) {
    $writer = [IO.StreamWriter]::new($logPath, $true, $utf8NoBom)
    $p = [Diagnostics.Process]::new()
    $started = $false
    $commandsSent = $false
    $reloadCompleted = -not $Reload
    $stderrTask = $null
    $stderrLogged = $false
    $lines = [Collections.Generic.List[string]]::new()
    try {
      Write-LogLine $writer "--- $Label ---"
      $bootTmp = Join-Path $testRoot "tmp\$Label"
      $bootJna = Join-Path $testRoot "jna\$Label"
      New-Item -ItemType Directory -Force $bootTmp, $bootJna | Out-Null
      $psi = [Diagnostics.ProcessStartInfo]::new()
      $psi.FileName = $javaExecutable
      $psi.Arguments = "-Dgrappling_hook.job=$jobId -Dgrappling_hook.run=$runId -Dgrappling_hook.project=Grappling_Hook -Djava.io.tmpdir=`"$bootTmp`" -Djna.tmpdir=`"$bootJna`" -Xms512M -Xmx1G -jar `"$jar`" nogui"
      $psi.WorkingDirectory = $testRoot
      $psi.UseShellExecute = $false
      $psi.RedirectStandardInput = $true
      $psi.RedirectStandardOutput = $true
      $psi.RedirectStandardError = $true
      $p.StartInfo = $psi
      [void]$p.Start()
      $started = $true
      $script:activeProcess = $p

      $metadata = [ordered]@{
        pid = $p.Id
        job = $jobId
        run_id = $runId
        project = 'Grappling_Hook'
        purpose = "Minecraft 26.2 $artifactLabel load/reload/restart test ($Label)"
        pack_artifact = $packInput
        started_at = (Get-Date).ToString('o')
        command = "$javaExecutable $($psi.Arguments)"
        log = $logPath
      } | ConvertTo-Json
      [IO.File]::WriteAllText($pidFile, $metadata, $utf8NoBom)
      Write-LogLine $writer "Started $jobId run=$runId PID $($p.Id)"

      $stderrTask = $p.StandardError.ReadToEndAsync()
      $stdoutTask = $p.StandardOutput.ReadLineAsync()
      $deadline = (Get-Date).AddSeconds($MaxBootSeconds)
      $phase = 'boot'

      while ($true) {
        if ((Get-Date) -gt $deadline) { throw "$jobId $Label exceeded ${MaxBootSeconds}s" }
        if (-not $stdoutTask.Wait(250)) {
          if ($p.HasExited) { continue }
          continue
        }
        $line = $stdoutTask.Result
        if ($null -eq $line) { break }
        $lines.Add($line)
        Write-LogLine $writer $line

        if ($phase -eq 'boot' -and $line -match 'Done \(') {
          if ($Reload) {
            Write-LogLine $writer '> reload'
            $p.StandardInput.WriteLine('reload')
            $p.StandardInput.Flush()
            $phase = 'reload'
          } else {
            $phase = 'smoke'
          }
        }

        if ($phase -eq 'reload' -and $line -match 'Loaded \d+ advancements') {
          $reloadCompleted = $true
          $phase = 'smoke'
        }

        if ($phase -eq 'smoke' -and -not $commandsSent) {
          $commands = @(
            'function grapple:system/server_probe',
            'scoreboard players get $probe gh_tmp',
            'datapack list enabled',
            'save-all',
            'stop'
          )
          foreach ($command in $commands) {
            Write-LogLine $writer "> $command"
            $p.StandardInput.WriteLine($command)
          }
          $p.StandardInput.Flush()
          $commandsSent = $true
          $phase = 'stopping'
        }

        $stdoutTask = $p.StandardOutput.ReadLineAsync()
      }

      if (-not $p.WaitForExit(10000)) { throw "$jobId $Label did not exit after stop." }
      if (-not $stderrTask.Wait(5000)) { throw "$jobId $Label stderr drain did not finish." }
      $stderr = $stderrTask.Result
      if ($stderr) {
        $stderrLogged = $true
        $lines.Add($stderr)
        foreach ($stderrLine in ($stderr -split "`r?`n")) {
          if ($stderrLine) { Write-LogLine $writer $stderrLine }
        }
      }

      $joined = $lines -join "`n"
      if (-not $commandsSent -or $p.ExitCode -ne 0) { throw "Server $Label boot/stop failed (exit $($p.ExitCode))." }
      if (-not $reloadCompleted) { throw 'Reload command did not complete before the probe.' }
      # OSHI can emit this Windows Perflib/JNA error when the sandbox denies
      # performance-counter registry access. It occurs before datapack load and
      # is unrelated to JSON, registries, functions, or commands.
      $errorScan = (($joined -split "`r?`n") | Where-Object {
        $_ -notmatch '\[ServerMain/ERROR\]: Unable to locate English counter names in registry Perflib 009'
      }) -join "`n"
      if ($errorScan -match '(?im)Failed to load|Failed to parse|Parsing error|Unknown or incomplete command|Unknown (?:function|item|registry)|Couldn.t parse|Couldn.t load|Unknown scoreboard objective|No objective was found|\[(?!Yggdrasil Key Fetcher/ERROR\])[^\]\r\n]*ERROR\]') {
        throw 'Datapack or command error found in the server log.'
      }
      if ($joined -notmatch '(?im)\$probe has 1') { throw 'Headless server probe failed or produced no result.' }
      if ($joined -notmatch '(?im)There are 2 data pack\(s\) enabled:') { throw 'Unexpected enabled datapack count.' }
      if ($joined -notmatch '(?im)Grappling_Hook') { throw 'Enabled datapack list did not contain Grappling_Hook.' }
      return $joined
    } catch {
      Write-LogLine $writer "TEST FAILURE: $($_.Exception.Message)"
      throw
    } finally {
      $stopped = $true
      if ($started -and -not $p.HasExited) { $stopped = Stop-OwnedProcess $p }
      if ($stderrTask -and -not $stderrLogged -and $stderrTask.Wait(5000)) {
        $lateStderr = $stderrTask.Result
        if ($lateStderr) {
          foreach ($stderrLine in ($lateStderr -split "`r?`n")) {
            if ($stderrLine) { Write-LogLine $writer $stderrLine }
          }
        }
      }
      if ($started -and $p.HasExited) {
        Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
        $script:activeProcess = $null
      }
      $writer.Dispose()
      if (-not $stopped -or ($started -and -not $p.HasExited)) {
        throw "$jobId PID $($p.Id) survived cleanup; PID metadata was retained at $pidFile"
      }
    }
  }

  [void](Invoke-Boot $true 'boot_reload')
  [void](Invoke-Boot $false 'restart')
  $listenerAfter = Get-NetTCPConnection -LocalPort 25585 -State Listen -ErrorAction SilentlyContinue
  if ($listenerAfter) { throw "Test port 25585 is still listening on PID $($listenerAfter.OwningProcess)." }
  Write-Host "Server test passed: official 26.2, Grappling Hook RC1 $artifactLabel, boot, reload, probe, stop, restart"
} finally {
  $cleanupError = $null
  if ($script:activeProcess -and -not $script:activeProcess.HasExited) {
    if (-not (Stop-OwnedProcess $script:activeProcess)) {
      $cleanupError = "$jobId PID $($script:activeProcess.Id) survived outer cleanup; see $pidFile"
    }
  }
  if ($script:activeProcess -and $script:activeProcess.HasExited) {
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  }
  if ($lockStream) { $lockStream.Dispose() }
  Remove-Item -LiteralPath $lockFile -Force -ErrorAction SilentlyContinue
  if ($cleanupError) { throw $cleanupError }
}
