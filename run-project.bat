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

:: 2. Launch Spring Boot backend
echo [Step 2] Launching Spring Boot backend...
cd /d "%~dp0backend"
if not exist "target\chat2006-1.0.0-SNAPSHOT.jar" (
    echo [Backend] Compiled JAR not found. Building backend - requires Java and Maven...
    call mvn clean package -DskipTests
)
start "RIFT Backend Server" cmd /k "java -jar target\chat2006-1.0.0-SNAPSHOT.jar"

:: 3. Launch Vite / Electron frontend
echo [Step 3] Booting Electron Workspace Client...
cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo [Frontend] Dependencies not found. Installing node packages...
    call npm install
)
start "RIFT Electron Client" cmd /k "npm run dev:electron"

echo.
echo ===================================================
echo   Launcher complete! Both processes have started.
echo   Keep the console windows open to view logs/errors.
echo ===================================================
pause
