@echo off
setlocal enabledelayedexpansion
title AUDIRA STORY - GitHub Deploy ^& Sync

echo ================================================================
echo               AUDIRA STORY - GITHUB DEPLOY / SYNC
echo                      by Agus Dwi R (AUDIRA)
echo ================================================================
echo Target Repository:
echo https://github.com/Audira141415/AUDIRA-STICK-STORY.git
echo ================================================================
echo.

:: 1. Verifikasi Git terpasang
where git >nul 2>nul
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Git tidak ditemukan di PATH system kamu!
    echo Silakan unduh dan install Git: https://git-scm.com/
    echo.
    pause
    exit /b 1
)

:: 2. Inisialisasi Git Repository jika belum ada
if not exist ".git" (
    echo [1/5] Inisialisasi repository Git lokal baru...
    git init
) else (
    echo [1/5] Repository Git lokal sudah aktif.
)

:: 3. Set atau perbarui Remote URL
echo [2/5] Mengatur Remote Repository origin...
git remote get-url origin >nul 2>nul
if !ERRORLEVEL! equ 0 (
    git remote set-url origin https://github.com/Audira141415/AUDIRA-STICK-STORY.git
) else (
    git remote add origin https://github.com/Audira141415/AUDIRA-STICK-STORY.git
)

:: 4. Pastikan branch utama bernama main
echo [3/5] Memastikan branch utama adalah 'main'...
git branch -M main

:: 5. Tentukan pesan commit
set "COMMIT_MSG=%~1"
if "!COMMIT_MSG!"=="" (
    echo.
    set /p "USER_INPUT=Masukkan pesan commit [tekan Enter untuk default]: "
    if "!USER_INPUT!"=="" (
        set "COMMIT_MSG=chore(release): update Audira Story - %date% %time%"
    ) else (
        set "COMMIT_MSG=!USER_INPUT!"
    )
)

echo.
echo [4/5] Menyiapkan berkas (git add .)...
git add .

:: Periksa apakah ada perubahan yang perlu di-commit
git diff --cached --quiet
set "HAS_DIFF=!ERRORLEVEL!"

if "!HAS_DIFF!"=="0" (
    echo [INFO] Tidak ada berkas baru atau perubahan untuk di-commit.
) else (
    echo [5/5] Menyimpan commit: "!COMMIT_MSG!"
    git commit -m "!COMMIT_MSG!"
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Gagal melakukan commit.
        echo.
        pause
        exit /b 1
    )
)

:: 6. Push ke remote GitHub
echo.
echo ----------------------------------------------------------------
echo Mengunggah ke GitHub (git push -u origin main)...
echo ----------------------------------------------------------------
git push -u origin main
if !ERRORLEVEL! neq 0 (
    echo.
    echo ================================================================
    echo [PERINGATAN / PUSH GAGAL]
    echo Push ke GitHub belum berhasil. Kemungkinan penyebab:
    echo 1. Kamu belum login ke akun GitHub (Git Credential Manager).
    echo 2. Repository 'AUDIRA-STICK-STORY' belum dibuat di GitHub kamu.
    echo    Buat repo di: https://github.com/new
    echo 3. Ada commit baru di GitHub yang belum ada di lokal.
    echo    Jalankan: git pull origin main --rebase
    echo ================================================================
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================================
echo [BERHASIL] Kode Audira Story berhasil di-deploy ke GitHub!
echo URL: https://github.com/Audira141415/AUDIRA-STICK-STORY
echo ================================================================
echo.
pause
