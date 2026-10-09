# DEPLOYMENT — AUDIRA STORY (AUDIRA-STICK-STORY)

> Panduan Kompilasi, Pemaketan Installer Desktop Windows, dan Distribusi Produksi.  
> **Pencipta & Pemegang HAKI:** AUDIRA (Agus Dwi R) | Hak Cipta Dilindungi Undang-Undang.  
> **Versi:** v1.0.0  
> **Terakhir Diperbarui:** 2026-10-09  

---

## 1. Arsitektur Distribusi & Packaging

Audira Story didistribusikan sebagai aplikasi desktop mandiri untuk sistem operasi **Windows (x64)** menggunakan Electron 44 dan `electron-builder`:

1. **Bundle Aplikasi Terkompilasi (`out/`):**
   - Dibangun menggunakan `electron-vite 5` dan `Vite 7`.
   - `out/main/`: Berkas proses utama ter-bundle (Node.js).
   - `out/preload/`: Jembatan konteks `contextBridge`.
   - `out/renderer/`: Antarmuka SPA teroptimasi (React 19 + Tailwind v4 + aset statis).
2. **Dependensi Biner Bawaan (Native Binaries & Resources):**
   - `better-sqlite3`: Modul C++ native yang dikompilasi khusus untuk arsitektur Node.js Electron.
   - `ffmpeg-static`: Biner FFmpeg resolusi otomatis yang dipaketkan langsung ke dalam instalasi.
   - `resources/whisper/`: Biner `whisper-cli.exe` beserta seluruh pustaka DLL pendukung CPU multi-arsitektur (AVX, AVX2, SSE4.2).
   - `resources/fonts/`: 15 koleksi font TTF caption untuk rendering ASS libass dan antarmuka.
3. **Paket Installer Windows (`dist/`):**
   - Menghasilkan installer instalasi mandiri NSIS: `dist/AudiraStory-Setup-<versi>.exe`.

---

## 2. Prasyarat Lingkungan (Environment Prerequisites)

- **Sistem Operasi:** Windows 10/11 x64 (diperlukan untuk dukungan penuh Whisper lokal dan FFmpeg static).
- **Runtime Node.js:** Node.js v20 LTS atau Node.js v22 (direkomendasikan v22).
- **Package Manager:** npm (v9.0.0+ atau v10+).
- **Koneksi Internet:** Diperlukan saat instalasi dependensi awal untuk mengunduh biner Electron dan FFmpeg static.

---

## 3. Tahapan Pembuatan Bundle & Installer (Build Steps)

### A. Memasang Dependensi & Membangun Modul Native
```bash
npm install
```
*Catatan Penting:* Skrip `postinstall` secara otomatis mengeksekusi `electron-builder install-app-deps` untuk menyusun ulang dependensi C++ native (`better-sqlite3`) agar cocok dengan versi ABI internal Electron.

### B. Menjalankan Mode Pengembangan (Hot Reload)
```bash
npm run dev
```
Mode ini mengaktifkan hot-module-replacement pada renderer, sementara perubahan pada `src/main` atau `src/preload` akan memicu kompilasi ulang otomatis.

### C. Validasi Tipe & Build Berkas Produksi
```bash
# 1. Pastikan tidak ada error kompilasi TypeScript
npm run typecheck

# 2. Kompilasi bundle produksi ke folder out/
npm run build

# 3. Uji pratinjau hasil kompilasi
npm run preview
```

### D. Membuat File Installer Windows NSIS
```bash
npm run dist
```
Perintah ini mengeksekusi `electron-builder` berdasarkan konfigurasi `electron-builder.yml`. File installer siap pakai akan berada di folder `dist/AudiraStory-Setup-<versi>.exe`.

---

## 4. Lokasi Penyimpanan Data Pengguna

Pada instalasi produksi di Windows, seluruh data pengguna tersimpan di direktori:
```
%APPDATA%\Audira Story\
  ├── studio.db                 # Database SQLite (proyek, klip, pemeran, job, setting)
  ├── projects\<project-id>\    # Folder media per proyek (images/, videos/, audio/)
  ├── models\whisper\           # Model offline Whisper (ggml-small.bin)
  └── tmp\                      # Berkas cache render sementara (dibersihkan otomatis)
```

---

## 5. Pemecahan Masalah Kompilasi & Rollback (Troubleshooting)

- **Eror "The module was compiled against a different Node.js version":**
  Terjadi jika `better-sqlite3` terkompilasi untuk Node.js host lokal alih-alih Electron. Solusi:
  ```powershell
  npx electron-builder install-app-deps
  ```
- **Folder `node_modules/electron/dist` Kosong:**
  Jika unduhan biner Electron terinterupsi saat `npm install`:
  ```powershell
  node node_modules/electron/install.js
  ```
- **Membersihkan Cache Build:**
  ```powershell
  Remove-Item -Recurse -Force out, dist
  npm run build
  ```

---

## 6. Sinkronisasi & Deployment Source Code ke GitHub (`save.bat`)

Untuk mengunggah dan menyinkronkan seluruh kode sumber Audira Story ke repository GitHub resmi (`https://github.com/Audira141415/AUDIRA-STICK-STORY.git`), gunakan skrip otomatisasi [`save.bat`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/save.bat):

1. **Jalankan via Terminal:**
   ```bat
   save.bat "feat: update fitur dan dokumentasi"
   ```
2. **Jalankan via Double Click:**
   - Cukup double-click `save.bat` di File Explorer.
   - Masukkan pesan commit saat diminta (atau tekan Enter untuk pesan otomatis dengan timestamp).
   - Skrip akan otomatis menginisialisasi Git (jika repo baru), menambahkan remote origin, mengatur branch `main`, melakukan commit, dan mengeksekusi `git push -u origin main`.

