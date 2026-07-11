@echo off
call npm run build
if errorlevel 1 exit /b 1
call npm run build:electron
if errorlevel 1 exit /b 1
call node_modules\.bin\electron-builder --dir --config electron-builder.yml
