param(
  [Parameter(Mandatory=$true)][string]$ServerJar,
  [Parameter(Mandatory=$true)][string]$PackArtifact,
  [string]$Java = 'java',
  [int]$MaxBootSeconds = 180,
  [string]$ExpectedServerSha1 = '823e2250d24b3ddac457a60c92a6a941943fcd6a'
)
$ErrorActionPreference = 'Stop'
try { $Host.UI.RawUI.WindowTitle = 'Realm_Toybox.server_test' } catch { }
$utf8NoBom = [Text.UTF8Encoding]::new($false)
$rconPasswordBytes = New-Object byte[] 24
$rconRng = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $rconRng.GetBytes($rconPasswordBytes) } finally { $rconRng.Dispose() }
$rconPassword = ([BitConverter]::ToString($rconPasswordBytes)).Replace('-', '')
$packRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$projectRoot = (Resolve-Path (Join-Path $packRoot '..')).Path
$jar = (Resolve-Path -LiteralPath $ServerJar).Path
$packInput = (Resolve-Path -LiteralPath $PackArtifact).Path
$testRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot '.test_server'))
$jobId = 'Realm_Toybox.server_test'
$runId = [Guid]::NewGuid().ToString('N')
$pidFile = Join-Path $projectRoot '.realm-toybox-server-test.pid.json'
$lockFile = Join-Path $projectRoot '.realm-toybox-server-test.lock'
$logPath = Join-Path $testRoot 'toybox-test.log'
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
    if (-not $probe.WaitForExit(15000)) { Stop-Process -Id $probe.Id -Force -ErrorAction SilentlyContinue; throw 'Java path probe timed out.' }
    if (-not $stdoutTask.Wait(5000) -or -not $stderrTask.Wait(5000)) { throw 'Java path probe output did not close.' }
    $settings = $stdoutTask.Result + "`n" + $stderrTask.Result
    $match = [regex]::Match($settings, '(?m)^\s*java\.home\s*=\s*(.+?)\s*$')
    if (-not $match.Success) { throw 'Could not resolve java.home from the selected Java command.' }
    $candidate = Join-Path $match.Groups[1].Value 'bin\java.exe'
    return (Resolve-Path -LiteralPath $candidate).Path
  } finally {
    $probe.Dispose()
  }
}

$javaExecutable = Resolve-JavaExecutable $Java
$jcmdExecutable = Join-Path (Split-Path -Parent $javaExecutable) 'jcmd.exe'

function Test-ProcessCommandMarker($ProcessInfo, [string]$Job, [string]$Run) {
  if (-not $ProcessInfo -or -not $ProcessInfo.CommandLine) { return $false }
  return $ProcessInfo.CommandLine.Contains("-Dtoybox.job=$Job") -and
    ([string]::IsNullOrWhiteSpace($Run) -or $ProcessInfo.CommandLine.Contains("-Dtoybox.run=$Run"))
}

function Test-JvmSystemPropertyMarker([int]$ProcessId, [string]$Job, [string]$Run) {
  if (-not (Test-Path -LiteralPath $jcmdExecutable)) { return $false }
  try {
    $properties = & $jcmdExecutable $ProcessId 'VM.system_properties' 2>$null | Out-String
    return $properties -match "(?m)^toybox\.job=$([regex]::Escape($Job))$" -and
      ([string]::IsNullOrWhiteSpace($Run) -or $properties -match "(?m)^toybox\.run=$([regex]::Escape($Run))$")
  } catch { return $false }
}

function Read-Exact([IO.Stream]$Stream, [int]$Count) {
  $buffer = New-Object byte[] $Count
  $offset = 0
  while ($offset -lt $Count) {
    $read = $Stream.Read($buffer, $offset, $Count - $offset)
    if ($read -le 0) { throw 'RCON connection closed unexpectedly.' }
    $offset += $read
  }
  return ,$buffer
}

function Send-RconPacket([IO.Stream]$Stream, [int]$RequestId, [int]$Type, [string]$Payload) {
  $payloadBytes = $utf8NoBom.GetBytes($Payload)
  $body = [IO.MemoryStream]::new()
  $writer = [IO.BinaryWriter]::new($body, $utf8NoBom, $true)
  try {
    $writer.Write($RequestId)
    $writer.Write($Type)
    $writer.Write($payloadBytes)
    $writer.Write([byte]0)
    $writer.Write([byte]0)
    $writer.Flush()
    $bytes = $body.ToArray()
    $length = [BitConverter]::GetBytes([int]$bytes.Length)
    # The 26.2 RconClient assumes one socket read contains exactly one whole
    # packet. Emit length+body in a single write to avoid TCP splitting them.
    $packet = New-Object byte[] ($length.Length + $bytes.Length)
    [Array]::Copy($length, 0, $packet, 0, $length.Length)
    [Array]::Copy($bytes, 0, $packet, $length.Length, $bytes.Length)
    $Stream.Write($packet, 0, $packet.Length)
    $Stream.Flush()
  } finally {
    $writer.Dispose()
    $body.Dispose()
  }
}

function Read-RconPacket([IO.Stream]$Stream) {
  [byte[]]$lengthBytes = Read-Exact $Stream 4
  $length = [BitConverter]::ToInt32($lengthBytes, 0)
  if ($length -lt 10 -or $length -gt 1048576) { throw "Invalid RCON packet length: $length" }
  [byte[]]$body = Read-Exact $Stream $length
  $requestId = [BitConverter]::ToInt32($body, 0)
  $type = [BitConverter]::ToInt32($body, 4)
  $payload = $utf8NoBom.GetString($body, 8, $length - 10)
  return [pscustomobject]@{ RequestId=$requestId; Type=$type; Payload=$payload }
}

function Open-Rcon {
  $client = [Net.Sockets.TcpClient]::new()
  try {
    $client.Connect('127.0.0.1', 25576)
    $stream = $client.GetStream()
    # The aggregate in-game smoke function can take longer than ten seconds on
    # a cold CI/server boot. Keep the timeout finite, but long enough that a
    # valid response is not mistaken for a hung server.
    $stream.ReadTimeout = 60000
    $stream.WriteTimeout = 10000
    Send-RconPacket $stream 1001 3 $rconPassword
    $response = Read-RconPacket $stream
    if ($response.RequestId -ne 1001) { throw 'RCON authentication failed.' }
    return $client
  } catch {
    $client.Dispose()
    throw
  }
}

function Open-RconWithRetry {
  $lastError = $null
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    try { return Open-Rcon } catch { $lastError = $_; Start-Sleep -Milliseconds 250 }
  }
  throw "RCON did not become ready: $($lastError.Exception.Message)"
}

function Invoke-RconCommand([Net.Sockets.TcpClient]$Client, [int]$RequestId, [string]$Command, [bool]$ExpectResponse = $true) {
  $stream = $Client.GetStream()
  Send-RconPacket $stream $RequestId 2 $Command
  if (-not $ExpectResponse) { return '' }
  $response = Read-RconPacket $stream
  if ($response.RequestId -ne $RequestId) { throw "Unexpected RCON response id for: $Command" }
  return $response.Payload
}

function Write-LogLine([IO.StreamWriter]$Writer, [string]$Line) {
  [void]$Writer.WriteLine($Line)
  $Writer.Flush()
  Write-Host $Line
}

function Stop-OwnedProcess([Diagnostics.Process]$Process) {
  if (-not $Process -or $Process.HasExited) { return $true }
  try {
    $cleanupRcon = Open-Rcon
    try { [void](Invoke-RconCommand $cleanupRcon 1999 'stop' $false) } finally { $cleanupRcon.Dispose() }
  } catch { }
  try { if ($Process.WaitForExit(10000)) { return $true } } catch { }
  try { Stop-Process -Id $Process.Id -Force -ErrorAction Stop } catch { return $false }
  try { return $Process.WaitForExit(10000) } catch { return $false }
}

try {
  # An unlocked stale file is reusable; a live harness holds an exclusive lock.
  try {
    $lockStream = [IO.File]::Open($lockFile, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
  } catch {
    throw "Another Realm Toybox server test is active (lock: $lockFile)."
  }
  $lockInfo = [ordered]@{ job=$jobId; run_id=$runId; harness_pid=$PID; started_at=(Get-Date).ToString('o') } | ConvertTo-Json
  $lockBytes = $utf8NoBom.GetBytes($lockInfo)
  $lockStream.SetLength(0)
  [void]$lockStream.Write($lockBytes, 0, $lockBytes.Length)
  $lockStream.Flush()

  # Only an orphan from a no-longer-running harness can reach this block.
  if (Test-Path -LiteralPath $pidFile) {
    $stale = $null
    try { $stale = Get-Content -Raw -Encoding UTF8 $pidFile | ConvertFrom-Json } catch { }
    if ($stale -and $stale.pid) {
      $staleInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$($stale.pid)" -ErrorAction SilentlyContinue
      if ((Test-ProcessCommandMarker $staleInfo $stale.job $stale.run_id) -or (Test-JvmSystemPropertyMarker $stale.pid $stale.job $stale.run_id)) {
        Stop-Process -Id $stale.pid -Force -ErrorAction Stop
        Wait-Process -Id $stale.pid -Timeout 10 -ErrorAction SilentlyContinue
        if (Get-Process -Id $stale.pid -ErrorAction SilentlyContinue) {
          throw "Could not stop orphaned $jobId PID $($stale.pid); PID metadata was retained."
        }
        Write-Host "Stopped orphaned $jobId PID $($stale.pid)"
      }
    }
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  }

  $actualSha1 = (Get-FileHash -Algorithm SHA1 -LiteralPath $jar).Hash.ToLowerInvariant()
  if ($actualSha1 -ne $ExpectedServerSha1.ToLowerInvariant()) {
    throw "Server JAR SHA-1 mismatch: expected $ExpectedServerSha1, got $actualSha1"
  }
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $jarArchive = [IO.Compression.ZipFile]::OpenRead($jar)
  try {
    $versionEntry = $jarArchive.GetEntry('version.json')
    if (-not $versionEntry) { throw 'Server JAR has no version.json.' }
    $versionReader = [IO.StreamReader]::new($versionEntry.Open(), [Text.Encoding]::UTF8)
    try { $serverVersion = $versionReader.ReadToEnd() | ConvertFrom-Json } finally { $versionReader.Dispose() }
  } finally { $jarArchive.Dispose() }
  if ($serverVersion.id -ne '26.2' -or $serverVersion.stable -ne $true -or
      $serverVersion.pack_version.data_major -ne 107 -or $serverVersion.pack_version.data_minor -ne 1) {
    throw 'Server JAR is not stable Java 26.2 with data pack format 107.1.'
  }

  $projectBoundary = $projectRoot.TrimEnd([char[]]@('\', '/')) + [IO.Path]::DirectorySeparatorChar
  if (-not $testRoot.StartsWith($projectBoundary, [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe test path.' }
  if (Test-Path -LiteralPath $testRoot) {
    $testItem = Get-Item -LiteralPath $testRoot -Force
    if (($testItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Refusing to delete a reparse-point test directory.' }
    Remove-Item -LiteralPath $testRoot -Recurse -Force
  }

  $datapacks = Join-Path $testRoot 'world\datapacks'
  New-Item -ItemType Directory -Force $datapacks | Out-Null
  if (Test-Path -LiteralPath $packInput -PathType Container) {
    $installedPack = Join-Path $datapacks 'Realm_Toybox'
    New-Item -ItemType Directory -Force $installedPack | Out-Null
    Copy-Item -Recurse -Force (Join-Path $packInput '*') $installedPack
    $artifactLabel = 'source directory'
  } elseif ([IO.Path]::GetExtension($packInput) -ieq '.zip') {
    $archive = [IO.Compression.ZipFile]::OpenRead($packInput)
    try {
      if (-not ($archive.Entries.FullName -contains 'pack.mcmeta')) { throw 'Pack artifact has no root pack.mcmeta.' }
      if ($archive.Entries.FullName -match '\\') { throw 'Pack artifact contains non-portable backslash entry names.' }
      if (-not ($archive.Entries.FullName -like 'data/*')) { throw 'Pack artifact has no data/ entries.' }
    } finally { $archive.Dispose() }
    Copy-Item -LiteralPath $packInput -Destination (Join-Path $datapacks 'Realm_Toybox.zip')
    $artifactLabel = 'release ZIP'
  } else {
    throw "Pack artifact must be a directory or ZIP: $packInput"
  }

  'eula=true' | Set-Content -Encoding ascii (Join-Path $testRoot 'eula.txt')
  @('online-mode=false','server-port=25575','level-name=world','level-type=minecraft:flat','generator-settings={"biome":"minecraft:plains","layers":[{"block":"minecraft:bedrock","height":1},{"block":"minecraft:dirt","height":2},{"block":"minecraft:grass_block","height":1}]}','generate-structures=false','level-seed=RealmToyboxDeterministicTest','gamemode=creative','difficulty=peaceful','spawn-protection=0','view-distance=4','simulation-distance=4','enable-query=false','enable-rcon=true','rcon.port=25576',"rcon.password=$rconPassword",'broadcast-rcon-to-ops=false','pause-when-empty-seconds=-1','motd=Realm Toybox automated test') |
    Set-Content -Encoding ascii (Join-Path $testRoot 'server.properties')
  New-Item -ItemType Directory -Force (Join-Path $testRoot 'tmp'), (Join-Path $testRoot 'jna') | Out-Null
  [IO.File]::WriteAllText($logPath, "Realm Toybox official server test`r`nartifact=$packInput`r`nsha1=$actualSha1`r`n", $utf8NoBom)

  $listenerBefore = Get-NetTCPConnection -LocalPort 25575,25576 -State Listen -ErrorAction SilentlyContinue
  if ($listenerBefore) { throw "Test port 25575 is already occupied by PID $($listenerBefore.OwningProcess)." }

  function Invoke-Boot([bool]$Reload, [string]$Label) {
    $writer = [IO.StreamWriter]::new($logPath, $true, $utf8NoBom)
    $p = [Diagnostics.Process]::new()
    $started = $false
    $sent = $false
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
      $psi.Arguments = "-Dtoybox.job=$jobId -Dtoybox.run=$runId -Dtoybox.project=Realm_Toybox -Djava.io.tmpdir=`"$bootTmp`" -Djna.tmpdir=`"$bootJna`" -Xms512M -Xmx1G -jar `"$jar`" nogui"
      $psi.WorkingDirectory = $testRoot
      $psi.UseShellExecute = $false
      # Keep stdin open so the dedicated server does not interpret EOF as a
      # stop request. Commands are sent only through local test RCON.
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
        project = 'Realm_Toybox'
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
          if ($Reload) { $phase = 'await_rcon_reload' } else { $phase = 'await_rcon_smoke' }
        }
        if (($phase -eq 'await_rcon_reload' -or $phase -eq 'await_rcon_smoke') -and $line -match 'RCON running on') {
          if ($phase -eq 'await_rcon_reload') {
            Write-LogLine $writer '> reload'
            $reloadRcon = Open-RconWithRetry
            # Reload may intentionally close the issuing RCON connection
            # before its textual response is flushed; completion is proven by
            # the subsequent recipes/advancements log pair instead.
            try { [void](Invoke-RconCommand $reloadRcon 1100 'reload' $false) } finally { $reloadRcon.Dispose() }
            $phase = 'reload'
          } else {
            $phase = 'smoke'
          }
        }
        if ($phase -eq 'reload' -and $line -match 'Loaded \d+ advancements') {
          $reloadCompleted = $true
          # Let the reload future close/restart its RCON client state before
          # issuing assertions on fresh one-command connections.
          Start-Sleep -Seconds 1
          $phase = 'smoke'
        }
        if ($phase -eq 'smoke' -and -not $sent) {
          $commands = @(
            'scoreboard players set $smoke_fail tb_gid 99',
            'function toybox:dev/server_smoke',
            'scoreboard players get $smoke_adv_fail tb_gid',
            'scoreboard players get $smoke_level tb_gid',
            'scoreboard players get $smoke_other_enchant tb_gid',
            'scoreboard players get $smoke_adv_custom tb_gid',
            'scoreboard players get $smoke_adv_repair tb_gid',
            'scoreboard players get $smoke_count tb_gid',
            'scoreboard players get $smoke_shelves tb_gid',
            'scoreboard players get $smoke_blocked_shelves tb_gid',
            'scoreboard players get $smoke_alchemy_fail tb_gid',
            'scoreboard players get $smoke_alchemy_builtin_amp tb_gid',
            'scoreboard players get $smoke_alchemy_builtin_duration tb_gid',
            'scoreboard players get $smoke_alchemy_level tb_gid',
            'scoreboard players get $smoke_alchemy_cap tb_gid',
            'scoreboard players get $smoke_alchemy_reject tb_gid',
            'scoreboard players get $smoke_alchemy_forms tb_gid',
            'scoreboard players get $smoke_alchemy_item_amp tb_gid',
            'scoreboard players get $smoke_alchemy_item_duration tb_gid',
            'scoreboard players get $smoke_union_count tb_gid',
            'scoreboard players get $smoke_six_reason tb_gid',
            'scoreboard players get $smoke_alchemy_marker tb_gid',
            'scoreboard players get $smoke_alchemy_name tb_gid',
            'scoreboard players get $smoke_client_kit_fail tb_gid',
            'scoreboard players get $smoke_client_rig_shelves tb_gid',
            'scoreboard players get $smoke_client_cleanup_shelves tb_gid',
            'scoreboard players get $smoke_client_cleanup_called tb_gid',
            'scoreboard players get $smoke_building_fail tb_gid',
            'scoreboard players get $smoke_pad_fail tb_gid',
            'scoreboard players get $smoke_soup_fail tb_gid',
            'scoreboard players get $smoke_soup_structure tb_gid',
            'scoreboard players get $smoke_soup_marker tb_gid',
            'scoreboard players get $smoke_soup_type tb_gid',
            'scoreboard players get $smoke_soup_left tb_gid',
            'scoreboard players get $smoke_soup_total tb_gid',
            'scoreboard players get $smoke_soup_after tb_gid',
            'scoreboard players get $smoke_soup_summon tb_gid',
            'scoreboard players get $smoke_soup_maintenance tb_gid',
            'scoreboard players get $smoke_survey_fail tb_gid',
            'scoreboard players get $smoke_survey_geometry tb_gid',
            'scoreboard players get $smoke_survey_compass_forms tb_gid',
            'scoreboard players get $smoke_survey_compass_meta tb_gid',
            'scoreboard players get $smoke_survey_stack tb_gid',
            'scoreboard players get $smoke_survey_apply tb_gid',
            'scoreboard players get $smoke_survey_copy tb_gid',
            'scoreboard players get $smoke_sickle_fail tb_gid',
            'scoreboard players get $smoke_sickle_raycast tb_gid',
            'scoreboard players get $smoke_sickle_grid tb_gid',
            'scoreboard players get $smoke_sickle_damage tb_gid',
            'scoreboard players get $smoke_sickle_break tb_gid',
            'scoreboard players get $smoke_sickle_setup tb_gid',
            'scoreboard players get $smoke_sickle_ray_step tb_gid',
            'scoreboard players get $smoke_sickle_ray_count tb_gid',
            'scoreboard players get $smoke_sickle_plants tb_gid',
            'scoreboard players get $smoke_sickle_grid_count tb_gid',
            'scoreboard players get $sickle_damage_value tb_gid',
            'scoreboard players get $smoke_fail tb_gid',
            'datapack list enabled',
            'save-all',
            'stop'
          )
          $requestId = 1200
          $commandRcon = Open-RconWithRetry
          try {
            foreach ($command in $commands) {
              Write-LogLine $writer "> $command"
              if ($command -eq 'stop') {
                [void](Invoke-RconCommand $commandRcon $requestId $command $false)
              } else {
                $response = Invoke-RconCommand $commandRcon $requestId $command
                if ($response) { $lines.Add($response); Write-LogLine $writer "< $response" }
              }
              $requestId++
            }
          } finally { $commandRcon.Dispose() }
          $sent = $true
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
        foreach ($stderrLine in ($stderr -split "`r?`n")) { if ($stderrLine) { Write-LogLine $writer $stderrLine } }
      }
      $joined = $lines -join "`n"
      if (-not $sent -or $p.ExitCode -ne 0) { throw "Server $Label boot/stop failed (exit $($p.ExitCode))." }
      if (-not $reloadCompleted) { throw 'Reload command did not complete before smoke commands.' }
      # The offline harness may fail to fetch Mojang's public-key cache; that
      # external authentication error is unrelated to datapack parsing.
      if ($joined -match '(?im)Failed to load|Parsing error|Unknown or incomplete command|Unknown (?:function|item|registry)|Couldn.t parse|UUID of added entity already exists|\[(?!Yggdrasil Key Fetcher/ERROR\])[^\]\r\n]*ERROR\]') {
        throw 'Datapack or command error found in server log.'
      }
      if ($joined -notmatch '(?im)smoke_fail has 0') { throw 'Headless datapack smoke assertion failed or produced no result.' }
      if ($joined -notmatch '(?im)There are 2 data pack\(s\) enabled:.*Realm_Toybox') { throw 'Enabled datapack list did not contain Realm_Toybox.' }
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
          foreach ($stderrLine in ($lateStderr -split "`r?`n")) { if ($stderrLine) { Write-LogLine $writer $stderrLine } }
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

  $first = Invoke-Boot $true 'boot_reload'
  $second = Invoke-Boot $false 'restart'
  $listenerAfter = Get-NetTCPConnection -LocalPort 25575,25576 -State Listen -ErrorAction SilentlyContinue
  if ($listenerAfter) { throw "A test port is still listening on PID $($listenerAfter.OwningProcess)." }
  Write-Host "Server test passed: official 26.2, $artifactLabel, boot, reload, smoke, stop, restart"
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
