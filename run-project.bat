@echo off
title ChatGPT Professional Enterprise Suite Launcher
echo ===================================================
echo   ChatGPT Professional Enterprise Suite Launcher
echo ===================================================
echo.

:: 1. Terminate any lingering port processes
echo [Step 1] Cleaning up lingering backend/frontend processes...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM node.exe 2>nul

:: 2. Launch Spring Boot backend from JAR
echo [Step 2] Launching Spring Boot backend from compiled JAR...
cd /d "%~dp0backend"
start /B java -jar target\chat2006-1.0.0-SNAPSHOT.jar

:: 3. Launch Vite / Electron frontend
echo [Step 3] Booting Electron Workspace Client...
cd /d "%~dp0frontend"
start npm run dev:electron

echo.
echo ===================================================
echo   Launcher complete! App window will open shortly.
echo ===================================================
exit
