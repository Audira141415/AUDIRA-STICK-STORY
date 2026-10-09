#!/bin/bash
cd "$(dirname "$0")" || exit 1

echo "======================================================================"
echo "   MENGHENTIKAN AUDIRA STORY & SEMUA KOMPONEN"
echo "======================================================================"
echo

echo "[*] Menghentikan proses Electron..."
pkill -f "Electron" 2>/dev/null || true

echo "[*] Menghentikan proses latar belakang FFmpeg & Whisper (jika ada)..."
pkill -f "ffmpeg" 2>/dev/null || true
pkill -f "whisper-cli" 2>/dev/null || true

echo
echo "======================================================================"
echo "   [OK] Semua komponen Audira Story telah dihentikan dengan bersih."
echo "======================================================================"
echo
sleep 2
