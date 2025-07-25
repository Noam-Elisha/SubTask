@echo off
REM Start Python HTTP server in the background
start /B python -m http.server 8000

REM Wait a moment for the server to start
timeout /t 2 >nul

REM Open index.html in Chrome
start chrome http://localhost:8000/index.html