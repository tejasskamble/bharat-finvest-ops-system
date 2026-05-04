@echo off
setlocal EnableExtensions

title Bharat Finvest Ops System - Auto Start

REM ------------------------------------------------------------
REM Bharat Finvest Ops System - Safe Demo Startup
REM Works from PowerShell, CMD, and double-click.
REM ------------------------------------------------------------

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "APP_URL=http://localhost:5173"

echo ===============================================
echo Bharat Finvest Ops System - Auto Start
echo Project Root: %PROJECT_ROOT%
echo ===============================================
echo.

pushd "%PROJECT_ROOT%" >nul 2>nul
if errorlevel 1 goto ROOT_ERROR

echo Checking Node.js...
where node >nul 2>nul
if errorlevel 1 goto NODE_MISSING

echo Checking npm...
where npm >nul 2>nul
if errorlevel 1 goto NPM_MISSING

if not exist "%BACKEND_DIR%\" goto BACKEND_MISSING
if not exist "%FRONTEND_DIR%\" goto FRONTEND_MISSING

echo.
echo Checking MySQL Docker service...
where docker >nul 2>nul
if errorlevel 1 goto DOCKER_NOT_FOUND

docker compose up -d mysql >nul 2>nul
if errorlevel 1 goto DOCKER_MYSQL_FAILED

echo [OK] Docker MySQL service is running or already up.
goto DOCKER_DONE

:DOCKER_NOT_FOUND
echo [WARN] Docker not found. Skipping Docker MySQL auto start.
echo [INFO] Make sure local MySQL is running before backend starts.
goto DOCKER_DONE

:DOCKER_MYSQL_FAILED
echo [WARN] Could not start Docker MySQL service.
echo [INFO] Backend will continue using database settings from backend\.env.
goto DOCKER_DONE

:DOCKER_DONE
echo.
echo Checking backend dependencies...
if exist "%BACKEND_DIR%\node_modules\" goto BACKEND_DEPS_OK

echo Installing backend dependencies...
pushd "%BACKEND_DIR%" >nul 2>nul
if errorlevel 1 goto BACKEND_ENTER_FAILED

call npm install
if errorlevel 1 goto BACKEND_INSTALL_FAILED

popd >nul 2>nul
goto BACKEND_DEPS_DONE

:BACKEND_DEPS_OK
echo [OK] backend\node_modules found. Skipping backend install.

:BACKEND_DEPS_DONE
echo.
echo Checking frontend dependencies...
if exist "%FRONTEND_DIR%\node_modules\" goto FRONTEND_DEPS_OK

echo Installing frontend dependencies...
pushd "%FRONTEND_DIR%" >nul 2>nul
if errorlevel 1 goto FRONTEND_ENTER_FAILED

call npm install
if errorlevel 1 goto FRONTEND_INSTALL_FAILED

popd >nul 2>nul
goto FRONTEND_DEPS_DONE

:FRONTEND_DEPS_OK
echo [OK] frontend\node_modules found. Skipping frontend install.

:FRONTEND_DEPS_DONE
echo.
echo Starting backend server...
start "BFOS Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && npm run dev"

echo Waiting for backend window to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting frontend server...
start "BFOS Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run dev"

echo Waiting for frontend window to initialize...
timeout /t 6 /nobreak >nul

echo.
echo Opening browser...
start "" "%APP_URL%"

echo.
echo Done. Backend and frontend are starting in separate windows.
echo Keep both windows open during demo.
echo.

popd >nul 2>nul
endlocal
exit /b 0

:ROOT_ERROR
echo [ERROR] Could not open project root.
echo Project root was: %PROJECT_ROOT%
goto FAIL

:NODE_MISSING
echo [ERROR] Node.js is not installed or not added to PATH.
echo Install Node.js 18 or above, restart terminal, and run again.
goto FAIL_WITH_POPD

:NPM_MISSING
echo [ERROR] npm is not installed or not added to PATH.
echo Reinstall Node.js with npm enabled, restart terminal, and run again.
goto FAIL_WITH_POPD

:BACKEND_MISSING
echo [ERROR] Backend folder not found.
echo Expected path: %BACKEND_DIR%
goto FAIL_WITH_POPD

:FRONTEND_MISSING
echo [ERROR] Frontend folder not found.
echo Expected path: %FRONTEND_DIR%
goto FAIL_WITH_POPD

:BACKEND_ENTER_FAILED
echo [ERROR] Could not enter backend folder.
echo Path: %BACKEND_DIR%
goto FAIL_WITH_POPD

:BACKEND_INSTALL_FAILED
echo [ERROR] Backend npm install failed.
echo Check the error above in this window.
goto FAIL_WITH_POPD

:FRONTEND_ENTER_FAILED
echo [ERROR] Could not enter frontend folder.
echo Path: %FRONTEND_DIR%
goto FAIL_WITH_POPD

:FRONTEND_INSTALL_FAILED
echo [ERROR] Frontend npm install failed.
echo Check the error above in this window.
goto FAIL_WITH_POPD

:FAIL_WITH_POPD
popd >nul 2>nul

:FAIL
echo.
echo Startup failed. Please fix the issue shown above.
pause
endlocal
exit /b 1
