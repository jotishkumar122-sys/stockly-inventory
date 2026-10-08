@echo off
cd /d "%~dp0"
title Stockly
node -v >nul 2>&1 || (echo Pehle Node.js install karo: https://nodejs.org & pause & exit /b)
if not exist .env.local (
  copy .env.example .env.local >nul
  echo .env.local ban gayi. Notepad me MONGODB_URI aur JWT_SECRET sahi karo, Save karo, phir Notepad band karo.
  notepad .env.local
)
if not exist node_modules call npm install
if exist .next rmdir /s /q .next
start "" cmd /c "timeout /t 10 >nul & start http://localhost:3000"
call npm run dev
pause
