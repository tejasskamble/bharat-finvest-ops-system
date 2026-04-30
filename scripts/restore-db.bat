@echo off
setlocal EnableExtensions

cd /d "%~dp0\.."

set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set "DB_NAME=bharat_finvest_ops"

if not exist "%MYSQL_EXE%" (
  echo [ERROR] mysql.exe not found at:
  echo %MYSQL_EXE%
  exit /b 1
)

echo.
echo Enter SQL backup file path (you can drag and drop the file here):
set /p BACKUP_FILE=Backup file: 
set "BACKUP_FILE=%BACKUP_FILE:"=%"

if "%BACKUP_FILE%"=="" (
  echo [ERROR] No file path provided.
  exit /b 1
)

if not exist "%BACKUP_FILE%" (
  echo [ERROR] File not found:
  echo %BACKUP_FILE%
  exit /b 1
)

echo Restoring database %DB_NAME% from:
echo %BACKUP_FILE%
"%MYSQL_EXE%" -u root -p %DB_NAME% < "%BACKUP_FILE%"

if errorlevel 1 (
  echo [ERROR] Restore failed.
  exit /b 1
)

echo [OK] Restore completed successfully.
exit /b 0

