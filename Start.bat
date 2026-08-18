@echo off
setlocal EnableExtensions
chcp 65001 >nul

REM ============================================================
REM Crane RL Dashboard one-click launcher (Windows, native Python)
REM Double-click this Start.bat to:
REM   1) start the Python server in a new console window
REM   2) wait until the server is ready
REM   3) open the dashboard in your default browser
REM ============================================================

set "PORT=8765"
REM Use 127.0.0.1 (IPv4 loopback) instead of "localhost" because this machine's
REM hosts file has the localhost entries commented out, so Windows falls back to
REM DNS for "localhost" and each request takes ~5s — long enough to break the
REM readiness probe even though app.py is actually running fine.
set "HOST=127.0.0.1"
REM NOTE: Do NOT set CRANE_RESEARCH_ALLOW_DRAFT_CONSENT here.
REM That flag opens the research consent flow with a form that has not been
REM approved yet. Set it per-session in a terminal when you actually need to
REM verify that screen:
REM   set CRANE_RESEARCH_ALLOW_DRAFT_CONSENT=1 && python app.py
set "URL=http://%HOST%:%PORT%"
set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
set "READY_URL=%URL%/api/config"
set "PROJECT_PY=%PROJECT_DIR%\env\Scripts\python.exe"
if exist "%PROJECT_PY%" (
  set "PYTHON_EXE=%PROJECT_PY%"
) else (
  set "PYTHON_EXE="
)

if not exist "%PYTHON_EXE%" (
  where python >nul 2>nul
  if errorlevel 1 (
    echo [ERROR] Python was not found. Install Python 3 or fix PYTHON_EXE in this script.
    pause
    exit /b 1
  )
  set "PYTHON_EXE=python"
)

echo.
echo ================================================
echo   Crane RL Dashboard Launcher
echo ================================================
echo [INFO] Dashboard URL: %URL%
echo [INFO] Project dir:   %PROJECT_DIR%
echo [INFO] Python:        %PYTHON_EXE%
echo.

REM ------------------------------------------------------------
REM 1) If OUR server is already running, restart it so code edits are applied.
REM    Require the response body to contain "num_cranes" so an
REM    unrelated HTTP server on this port isn't mistaken for ours
REM    (we hit this in practice when a different project's server
REM    was already listening on 127.0.0.1:%PORT%).
REM ------------------------------------------------------------
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$url='%READY_URL%'; $ok=$false; for($i=1; $i -le 3; $i++){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 3; if($r.StatusCode -eq 200 -and $r.Content -match 'num_cranes'){ $ok=$true; break } } catch { Start-Sleep -Milliseconds 500 } }; if($ok){ exit 0 } else { exit 1 }" >nul 2>nul

if %ERRORLEVEL% EQU 0 (
  echo [INFO] Existing dashboard server detected. Restarting it to apply current code...
  call :StopDashboardOnPort
  if errorlevel 2 (
    echo.
    echo [ERROR] Port %PORT% responded like the dashboard, but the listener is not an app.py process.
    echo [ERROR] Listening processes:
    call :ListPortHolders
    echo.
    echo [ERROR] Stop that process manually, then try again.
    pause
    exit /b 1
  )
  if errorlevel 1 (
    echo.
    echo [ERROR] Existing dashboard server could not be stopped cleanly.
    echo [ERROR] Listening processes:
    call :ListPortHolders
    echo.
    echo [ERROR] Stop the server manually, then try again.
    pause
    exit /b 1
  )
) else (
  REM ----------------------------------------------------------
  REM Before spawning a new server, make sure port %PORT% isn't
  REM held by some unrelated process. Otherwise app.py would fail
  REM to bind silently in the new console and the readiness probe
  REM below would spend 60s talking to a stranger.
  REM
  REM Note: PowerShell calls below are intentionally on a single
  REM line. CMD's `^` line-continuation has been observed to break
  REM tokenization when it sits inside a nested `else (... if (...))`
  REM block, so we avoid it here.
  REM ----------------------------------------------------------
  call :CheckPortFree
  if errorlevel 2 (
    echo.
    echo [ERROR] Port %PORT% is already in use by another program ^(not the crane dashboard^).
    echo [ERROR] Listening processes:
    call :ListPortHolders
    echo.
    echo [ERROR] Stop that program, or change PORT in Start.bat, then try again.
    pause
    exit /b 1
  )
)

echo [INFO] Starting server in a new window...
echo [INFO] Keep the server window open while using the dashboard.
echo.

REM Use `start /D "<dir>"` to set the new window's working directory rather than
REM embedding `cd /d "..."` in the inner command. This avoids nested-quote parsing
REM around the Korean Desktop path ("바탕 화면" contains a space).
start "Crane RL Dashboard Server" /D "%PROJECT_DIR%" cmd /k call "%PYTHON_EXE%" app.py

echo [INFO] Waiting for server readiness...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$url='%READY_URL%'; $ok=$false; for($i=1; $i -le 60; $i++){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 3; if($r.StatusCode -eq 200 -and $r.Content -match 'num_cranes'){ $ok=$true; break } } catch { Start-Sleep -Milliseconds 1000 } }; if($ok){ exit 0 } else { exit 1 }"

if errorlevel 1 (
  echo.
  echo [ERROR] Server did not become ready within 60 seconds.
  echo [ERROR] Please check the "Crane RL Dashboard Server" window for errors.
  pause
  exit /b 1
)

echo [INFO] Opening dashboard in your default browser...
start "" "%URL%"

echo.
echo [OK] Server and dashboard are ready.
echo [OK] Browser URL: %URL%
echo.
echo To stop the server:
echo   1. Go to the "Crane RL Dashboard Server" window
echo   2. Press Ctrl+C, or close that window
echo.
pause
goto :eof

REM ============================================================
REM Subroutines
REM ============================================================

:CheckPortFree
REM Sets ERRORLEVEL=2 if something is listening on %PORT%, 0 otherwise.
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -State Listen -LocalPort %PORT% -ErrorAction SilentlyContinue) { exit 2 } else { exit 0 }"
goto :eof

:StopDashboardOnPort
REM Stops an existing dashboard listener on %PORT%. Returns 2 if the listener is not app.py.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$conns=Get-NetTCPConnection -State Listen -LocalPort %PORT% -ErrorAction SilentlyContinue; if(-not $conns){ exit 0 }; $foreign=$false; foreach($c in $conns){ $pid2=$c.OwningProcess; $proc=Get-CimInstance Win32_Process -Filter ('ProcessId=' + $pid2) -ErrorAction SilentlyContinue; $cmd=[string]$proc.CommandLine; if($cmd -notmatch 'app\.py'){ $foreign=$true; continue }; Stop-Process -Id $pid2 -Force -ErrorAction SilentlyContinue }; if($foreign){ exit 2 }; Start-Sleep -Milliseconds 800; if(Get-NetTCPConnection -State Listen -LocalPort %PORT% -ErrorAction SilentlyContinue){ exit 1 } else { exit 0 }"
goto :eof

:ListPortHolders
REM Prints "  PID <pid>  <name>  <cmdline>" for each listener on %PORT%.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -State Listen -LocalPort %PORT% -ErrorAction SilentlyContinue | ForEach-Object { $pid2 = $_.OwningProcess; $p = Get-Process -Id $pid2 -ErrorAction SilentlyContinue; $cmd = (Get-CimInstance Win32_Process -Filter ('ProcessId=' + $pid2) -ErrorAction SilentlyContinue).CommandLine; '  PID {0}  {1}  {2}' -f $pid2, $p.ProcessName, $cmd }"
goto :eof
