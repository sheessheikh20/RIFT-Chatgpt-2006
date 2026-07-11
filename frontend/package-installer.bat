@echo off
echo ===================================================
echo [1/6] Cleaning up running dev processes...
echo ===================================================
call kill-dev.bat

echo ===================================================
echo [2/6] Cleaning previous build folders...
echo ===================================================
if exist release rmdir /s /q release

echo ===================================================
echo [3/6] Building React frontend and Electron main...
echo ===================================================
call npm run build
if errorlevel 1 exit /b 1
call npm run build:electron
if errorlevel 1 exit /b 1

echo ===================================================
echo [4/6] Extracting Electron framework zip...
echo ===================================================
mkdir release\1.0.0\win-unpacked
powershell -Command "Expand-Archive -Path '.eb-cache\electron\a791fa12f2db1c58c084ec41c5caf1ac518de84788ba857a6bebef2fe9349ed3\electron-v43.1.0-win32-x64.zip' -DestinationPath 'release\1.0.0\win-unpacked' -Force"
if errorlevel 1 exit /b 1

echo ===================================================
echo [5/6] Copying app assets into prepackaged folder...
echo ===================================================
mkdir release\1.0.0\win-unpacked\resources\app
xcopy /s /e /i /y dist release\1.0.0\win-unpacked\resources\app\dist
xcopy /s /e /i /y dist-electron release\1.0.0\win-unpacked\resources\app\dist-electron
copy package.json release\1.0.0\win-unpacked\resources\app\package.json
copy ..\backend\target\chat2006-1.0.0-SNAPSHOT.jar release\1.0.0\win-unpacked\resources\backend.jar

echo ===================================================
echo [6/6] Generating NSIS installer package...
echo ===================================================
call node_modules\.bin\electron-builder --prepackaged release\1.0.0\win-unpacked --config electron-builder.yml
if errorlevel 1 exit /b 1

echo ===================================================
echo Build and Packaging Complete!
echo ===================================================
