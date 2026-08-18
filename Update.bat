@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

REM ============================================================
REM Crane RL Dashboard - safe updater (Windows, native git)
REM Double-click to pull the latest version from GitHub.
REM
REM Safety design:
REM   * Local edits are NEVER discarded - they are backed up to
REM     "git stash" before updating, and the script tells you so.
REM   * Failures are diagnosed accurately (no internet / git
REM     missing / not a repo / diverged history) instead of always
REM     blaming the internet.
REM ============================================================

cd /d "%~dp0"

echo.
echo ================================================
echo   Crane RL Dashboard - Update from GitHub
echo ================================================
echo.

REM --- 0) Is git installed? -----------------------------------
where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git is not installed or not on PATH.
  echo         Install Git for Windows: https://git-scm.com/download/win
  echo.
  pause
  exit /b 1
)

REM --- 1) Are we inside a git repo? ---------------------------
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo [ERROR] This folder is not a git repository.
  echo         Make sure Update.bat sits in the project folder.
  echo.
  pause
  exit /b 1
)

REM --- 2) Fetch latest (this is the real network check) -------
echo [INFO] Contacting GitHub and fetching latest version...
git fetch origin main
if errorlevel 1 (
  echo.
  echo [ERROR] Could not reach GitHub. This is usually a network
  echo         problem or a sign-in issue. Check your internet
  echo         connection and try again.
  echo.
  pause
  exit /b 1
)

REM --- 3) Back up any local edits before touching files ------
REM `cmd & set X=%errorlevel%` captures the PREVIOUS errorlevel (it expands at
REM parse time), so detect dirtiness with `if errorlevel 1` right after each
REM command instead — that reads the real exit code.
set "STASHED="
git diff --quiet
if errorlevel 1 set "STASHED=1"
git diff --cached --quiet
if errorlevel 1 set "STASHED=1"
if defined STASHED (
  echo [INFO] You have local edits - backing them up safely...
  for /f "tokens=2-4 delims=/ " %%a in ("%date%") do set "DSTAMP=%%c%%a%%b"
  for /f "tokens=1-2 delims=:." %%a in ("%time%") do set "TSTAMP=%%a%%b"
  git stash push -u -m "Update.bat auto-backup !DSTAMP!-!TSTAMP!"
  if errorlevel 1 (
    echo [ERROR] Could not back up your local edits. Update aborted
    echo         so nothing is lost. Nothing was changed.
    echo.
    pause
    exit /b 1
  )
  echo [OK] Local edits saved to "git stash" (a safe backup).
)

REM --- 4) Apply update - fast-forward only -------------------
echo [INFO] Updating to the latest version...
git merge --ff-only origin/main
if errorlevel 1 (
  echo.
  echo [WARN] Your local history has diverged from GitHub - you have
  echo        commits that are not on GitHub, so this cannot be a
  echo        simple update.
  echo        Nothing was changed or deleted. Please ask for help to
  echo        merge or reset; your work is intact.
  if defined STASHED echo        Your latest edits are still saved in "git stash".
  echo.
  pause
  exit /b 1
)

echo [OK] Update complete - you are on the latest version.
if defined STASHED (
  echo.
  echo [NOTE] Your earlier local edits were NOT re-applied; they are
  echo        kept as a backup. To see them:   git stash list
  echo        To restore them:                 git stash pop
)
echo.

REM --- 5) Restart the server, then launch -------------------
echo [INFO] Stopping old server on port 8765 (if running)...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8765 " ^| findstr "LISTENING"') do (
  taskkill /PID %%p /F >nul 2>nul
)
echo [INFO] Launching the dashboard...
echo.

call "%~dp0Start.bat"
