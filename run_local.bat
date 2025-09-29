@echo off
setlocal

cd /d %~dp0

REM ===============================
REM  Greanium Boot Sequence Banner
REM ===============================
echo.
echo    ______                      _               
echo   / ____/_______  ____ _____  (_)_  ______ ___ 
echo  / / __/ ___/ _ \/ __ `/ __ \/ / / / / __ `__ \
echo / /_/ / /  /  __/ /_/ / / / / / /_/ / / / / / /
echo \____/_/   \___/\__,_/_/ /_/_/\__,_/_/ /_/ /_/ 
echo.
echo                  Greanium OS v1.0 - Initializing...
echo.

REM ===============================
REM  Virtual Environment Setup
REM ===============================
if not exist venv (
  echo Creating virtualenv...
  python -m venv venv
)

call venv\Scripts\activate

echo Installing/updating requirements...
pip install --upgrade pip >nul
pip install -r requirements.txt >nul

REM ===============================
REM  Boot Complete - Start Server
REM ===============================
echo.
echo Boot complete. Launching dashboard...
echo.

start "" "http://127.0.0.1:5000"
python -m backend.app
pause
