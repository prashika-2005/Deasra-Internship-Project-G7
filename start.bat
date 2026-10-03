@echo off
where node >nul 2>nul
if %errorlevel% equ 0 (
    node server.js
) else (
    start "" "index.html"
)
