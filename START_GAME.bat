@echo off
title Escape Room Game Launcher
echo ==================================================
echo   Starting Escape Room Game...
echo ==================================================
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Node.js detected. Launching local web server...
    node server.js
) else (
    echo [NOTICE] Node.js is not installed or not in PATH.
    echo [INFO] Launching game directly in your default web browser...
    echo.
    start "" "index.html"
)

pause
