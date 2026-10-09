@echo off
title Audira Story - Stopper
color 0c
cd /d "%~dp0"

echo ======================================================================
echo    MENGHENTIKAN SEMUA KOMPONEN AUDIRA STORY WEB STUDIO
echo ======================================================================
echo.

echo [*] Menghentikan proses pada port 5200 (Vite) dan 5201 (Backend Server)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5200,5201 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"

echo [*] Menutup jendela konsol Audira Story...
taskkill /FI "WINDOWTITLE eq Audira Story Backend Server (5201)*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Audira Story Web Dev (5200)*" /F >nul 2>&1

echo [*] Menghentikan proses latar belakang (jika ada)...
taskkill /F /IM electron.exe >nul 2>&1
taskkill /F /IM ffmpeg.exe >nul 2>&1
taskkill /F /IM whisper-cli.exe >nul 2>&1

echo.
echo ======================================================================
echo    [OK] Semua layanan Audira Story berhasil dihentikan.
echo    Port 5200 dan Port 5201 telah bersih dan bebas digunakan.
echo ======================================================================
echo.
timeout /t 3 >nul
