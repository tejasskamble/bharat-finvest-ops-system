@echo off
setlocal EnableExtensions

cd /d "%~dp0\.."

set "MYSQLDUMP_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
set "DB_NAME=bharat_finvest_ops"
set "BACKUP_DIR=%CD%\backups"

if not exist "%MYSQLDUMP_EXE%" (
  echo [ERROR] mysqldump not found at:
  echo %MYSQLDUMP_EXE%
  exit /b 1
)

if not exist "%BACKUP_DIR%" (
  mkdir "%BACKUP_DIR%"
)

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "TS=%%i"
set "BACKUP_FILE=%BACKUP_DIR%\bharat_finvest_backup_%TS%.sql"

echo Creating database backup...
echo Output file: %BACKUP_FILE%
"%MYSQLDUMP_EXE%" -u root -p --databases %DB_NAME% > "%BACKUP_FILE%"

if errorlevel 1 (
  echo [ERROR] Backup failed.
  exit /b 1
)

echo [OK] Backup completed successfully.
echo %BACKUP_FILE%
exit /b 0

