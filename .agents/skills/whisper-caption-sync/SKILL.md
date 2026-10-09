---
name: whisper-caption-sync
description: >-
  Use this skill when managing the local whisper.cpp speech recognition engine, Gemini and ElevenLabs TTS audio narration pipelines, word-level alignment, pause-based cut points, or subtitle caption typography with rounded boxes.
---

# Whisper & Audio Caption Synchronization Runbook

Panduan tata kelola dan SOP operasional model offline whisper.cpp, sintesis suara TTS (Gemini & ElevenLabs), penyelarasan waktu kata (*word-level alignment*), deteksi titik potong adegan, dan rendering subtitle berkotak rounded pada [Audira Story](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/AGENTS.md).

---

## 1. Komponen & Berkas Terkait

- **Eksekutor Whisper Lokal**: [`src/main/whisper.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/whisper.ts)  
  Manajemen eksekusi `resources/whisper/whisper-cli.exe`, auto-deteksi instruksi CPU (AVX, AVX2, SSE4.2), dan pengunduhan model `ggml-small.bin`.
- **Pipeline Narasi Suara Utuh**: [`src/main/narration.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/narration.ts)  
  Pengambilan audio rekaman utuh dari TTS, pengiriman ke Whisper, dan pemotongan file audio WAV per adegan.
- **Penyelarasan Kata Naskah**: [`src/main/align.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/align.ts)  
  Algoritma toleran yang mencocokkan ejaan kata asli dari naskah penulis dengan penanda waktu (*timestamp*) hasil Whisper.
- **Kalkulator Titik Potong Adegan**: [`src/main/cuts.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/cuts.ts)  
  Menghitung titik potong antar adegan berdasarkan jeda hening alami di antara kata terakhir adegan sebelumnya dan kata pertama adegan berikutnya (`cutsFromWords`).
- **Gaya & Format Caption Subtitle**: [`src/shared/captions.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/captions.ts) & [`src/main/fontMetrics.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/fontMetrics.ts)  
  Katalog 15 font TTF caption, ekstraksi metrik bounding box glyph, dan generator gambar kotak rounded untuk ASS libass.

---

## 2. Fitur Inti Arsitektur & Keputusan Teknis Penting

### A. Whisper Tanpa `--prompt` dengan Dynamic Time Warping (DTW)
- **Masalah Halusinasi Naskah:** Dalam pengujian nyata, mengirimkan teks naskah sebagai argumen `--prompt` ke Whisper menyebabkan model mengalami halusinasi loop parah (misal: mengulang kata "tidak tidak tidak..." berpuluh kali) dan merusak penanda waktu.
- **Solusi Baku:** Whisper dijalankan **tanpa prompt** menggunakan parameter:
  ```bash
  whisper-cli.exe -m ggml-small.bin -f audio.wav -nfa -dtw small -oj
  ```
- **Akurasi Sub-Detik:** Pendekatan ini menghasilkan akurasi waktu kata sangat tinggi (deviasi hanya 0.1–0.2 detik). Ejaan kata yang ditampilkan di layar tetap diambil 100% dari naskah asli melalui [`align.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/align.ts).

### B. Pemotongan Adegan Mengikuti Jeda Alami Kata
- Suara narasi dibuat satu kali utuh untuk banyak adegan sekaligus agar intonasi dan warna vokal narator konsisten.
- File audio kemudian dipotong per adegan menggunakan titik potong yang dihitung oleh `cutsFromWords()`.
- Potongan selalu jatuh pada keheningan di antara kata terakhir adegan $N$ dan kata pertama adegan $N+1$, sehingga tidak ada suku kata yang terpotong secara kasar.

### C. Sorotan Kata Caption Bertahan di Jeda
- Pada saat narator berhenti sejenak di antara dua kata, sorotan (*highlight*) tetap bertahan pada kata terakhir yang telah diucapkan (`captionAt` di [`captions.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/captions.ts)).
- Hal ini mencegah efek berkedip (*flickering*) di mana sorotan sempat melompat ke akhir baris lalu kembali lagi.

### D. Konversi Metrik `cell` Font TTF untuk Subtitle ASS
- libass mengukur ukuran font berdasarkan metrik `winAscent + winDescent`, sedangkan CSS browser menggunakan metrik `em`.
- Tanpa konversi khusus, ukuran subtitle di hasil ekspor video hanya sekitar 57% dari ukuran pratinjau editor.
- Setiap font di `CAPTION_FONTS` memiliki nilai metrik `cell` yang diukur langsung dari berkas fisik TTF-nya oleh [`fontMetrics.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/fontMetrics.ts).

---

## 3. Standard Operating Procedures (SOP)

### A. Pengunduhan & Validasi Model Whisper
1. Pengguna dapat mengunduh model Whisper Small langsung dari tab **Pengaturan › Model Whisper**.
2. Berkas model disimpan di direktori `%APPDATA%\Audira Story\models\whisper\ggml-small.bin`.
3. Handler `whisper:status` di [`src/main/ipc.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/ipc.ts) memeriksa keberadaan dan ukuran berkas model sebelum memicu job transkripsi.
4. Untuk pengujian lokal tanpa unduhan lambat, arahkan `STUDIO_WHISPER_URL` ke server lokal.

### B. Menguji Integrasi ElevenLabs with-timestamps
1. Pastikan kunci API ElevenLabs valid di Pengaturan.
2. Saat meminta narasi, gunakan endpoint yang mengembalikan data waktu per kata (`with-timestamps`).
3. Tag jeda wicara dikonversi otomatis oleh `toElevenLabsText`:
   - Untuk model ElevenLabs v3: diubah menjadi format `[tag]`.
   - Untuk model terdahulu: dikonversi menjadi jeda `<break time="...">`.

### C. Menambahkan Font Caption Baru
1. Letakkan berkas font baru berformat `.ttf` di direktori [`resources/fonts/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/resources/fonts/).
2. Cantumkan berkas lisensi OFL/commercial di [`resources/licenses/fonts/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/resources/licenses/fonts/).
3. Buka [`src/shared/captions.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/captions.ts) dan tambahkan entri font pada `CAPTION_FONTS` lengkap dengan metrik `cell` hasil kalibrasi.
4. Daftarkan definisi `@font-face` baru di [`src/renderer/src/styles.css`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/styles.css) menggunakan skema `studio://fonts/<nama-file>.ttf`.
5. Jalankan `npm run typecheck` untuk memverifikasi tipe font.
