@echo off
setlocal EnableExtensions

REM ------------------------------------------------------------
REM Bharat Finvest Ops System - One Click Startup
REM Double-click this file to run backend + frontend automatically
REM ------------------------------------------------------------

REM 1) Always run from project root (folder of this .bat file)
cd /d "%~dp0"
set "PROJECT_ROOT=%~dp0"

echo ===============================================
echo Bharat Finvest Ops System - Auto Start
echo Project Root: %PROJECT_ROOT%
echo ===============================================
echo.

REM Basic command checks
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo Please install Node.js, then run this file again.
  timeout /t 8 /nobreak >nul
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not available in PATH.
  echo Please fix Node.js/npm installation, then run this file again.
  timeout /t 8 /nobreak >nul
  exit /b 1
)

REM 2) Install backend dependencies only if missing
if exist "%PROJECT_ROOT%backend\node_modules" (
  echo [OK] backend\node_modules found - skipping backend install.
) else (
  echo Starting backend dependency install...
  cd /d "%PROJECT_ROOT%backend"
  call npm install
  if errorlevel 1 (
    echo [ERROR] Backend npm install failed.
    timeout /t 10 /nobreak >nul
    exit /b 1
  )
  cd /d "%PROJECT_ROOT%"
)

echo.
echo Starting backend...
start "BFOS Backend" cmd /k "cd /d ""%PROJECT_ROOT%backend"" && npm run dev"

REM 7) Delay so backend gets time to initialize before frontend
timeout /t 5 /nobreak >nul

REM 4) Install frontend dependencies only if missing
if exist "%PROJECT_ROOT%frontend\node_modules" (
  echo [OK] frontend\node_modules found - skipping frontend install.
) else (
  echo Starting frontend dependency install...
  cd /d "%PROJECT_ROOT%frontend"
  call npm install
  if errorlevel 1 (
    echo [ERROR] Frontend npm install failed.
    timeout /t 10 /nobreak >nul
    exit /b 1
  )
  cd /d "%PROJECT_ROOT%"
)

echo.
echo Starting frontend...
start "BFOS Frontend" cmd /k "cd /d ""%PROJECT_ROOT%frontend"" && npm run dev"

REM Delay before opening browser
timeout /t 6 /nobreak >nul

echo.
echo Opening browser...
start "" "http://localhost:5173"

echo.
echo All done. Backend and frontend are launching in separate windows.
echo You can close this launcher window now.
timeout /t 4 /nobreak >nul
exit /b 0

