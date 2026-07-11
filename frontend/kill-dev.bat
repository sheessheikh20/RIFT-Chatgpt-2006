@echo off
echo Killing processes on port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do (
    echo Killing PID %%a
    taskkill /F /PID %%a 2>nul
)
echo Killing processes on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 "') do (
    echo Killing PID %%a
    taskkill /F /PID %%a 2>nul
)
echo Killing electron, java and node...
taskkill /F /IM electron.exe /T 2>nul
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo All cleared.
timeout /t 2 /nobreak >nul
