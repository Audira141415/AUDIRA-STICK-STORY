@echo off
title Audira Story Web Studio - Starter
color 0b
cd /d "%~dp0"

echo ======================================================================
echo    AUDIRA STORY - AI VIDEO CREATOR & STORYBOARD (WEB STUDIO)
echo    Lisensi: AUDIRA (Agus Dwi R)
echo ======================================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js belum terpasang di komputer ini.
    echo Unduh versi LTS dari https://nodejs.org, pasang, lalu coba lagi.
    pause
    exit /b 1
)

:: 1. Periksa folder node_modules
if not exist "node_modules\" (
    echo [1/3] Direktori node_modules belum ditemukan. Menginstal dependensi...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Gagal memasang dependensi.
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependensi node_modules terverifikasi.
)

:: 2. Pastikan file build backend tersedia
if not exist "out\main\index.js" (
    echo [*] Menyusun backend & frontend awal...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Gagal melakukan build awal.
        pause
        exit /b 1
    )
)

:: Bersihkan port 5200 dan 5201 serta proses Electron lama jika ada yang masih menggantung
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5200,5201 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
taskkill /F /IM electron.exe >nul 2>&1

:: 3. Jalankan Backend Server (Port 5201)
echo [2/3] Menjalankan Backend API & Media Server (Port 5201)...
start "Audira Story Backend Server (5201)" cmd /k "title Audira Story Backend Server (5201) && npm run server"

:: 4. Jalankan Frontend Web Vite (Port 5200)
echo [3/3] Menjalankan Frontend Web Studio Vite (Port 5200)...
start "Audira Story Web Dev (5200)" cmd /k "title Audira Story Web Dev (5200) && npm run dev:web"

:: Tunggu sejenak agar server siap
timeout /t 3 /nobreak >nul

:: Buka di browser default
echo.
echo [*] Membuka Audira Story di browser: http://localhost:5200/ ...
start http://localhost:5200/

echo.
echo ======================================================================
echo    Semua komponen Audira Story Web telah berjalan!
echo    - Frontend Web Studio  : http://localhost:5200/
echo    - Backend API & Media  : http://localhost:5201/
echo.
echo    Untuk menghentikan semua komponen, cukup jalankan: stop.bat
echo ======================================================================
echo.
pause
