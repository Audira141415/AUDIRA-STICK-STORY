# TESTING — AUDIRA STORY (AUDIRA-STICK-STORY)

> Strategi Verifikasi Kualitas, Pengujian Dev Harness Otomatis, dan Pencegahan Regresi.  
> **Pencipta & Pemegang HAKI:** AUDIRA (Agus Dwi R) | Hak Cipta Dilindungi Undang-Undang.  
> **Versi:** v1.0.0  
> **Terakhir Diperbarui:** 2026-10-09  

---

## 1. Ikhtisar Strategi Pengujian (Testing Strategy Overview)

Audira Story tidak menggunakan unit test mock tradisional, melainkan mengandalkan **Tiga Pilar Pengujian Konkret**:
1. **Pemeriksaan Tipe Statis Ketat (Strict Static Typecheck):** Memastikan seluruh kode proses utama, preload, modul bersama (`shared/`), dan antarmuka renderer bebas dari error kompilasi TypeScript melalui `npm run typecheck`.
2. **Validasi Build Produksi (Production Bundle Verification):** Memastikan bundling `electron-vite` berhasil memaketkan kode tanpa kesalahan resolusi modul atau kegagalan linking dependensi bawaan melalui `npm run build`.
3. **Pengujian Dev Harness Otomatis (End-to-End Automation):** Mengendalikan aplikasi Electron sungguhan secara otomatis menggunakan rencana skrip JSON berbasis environment variable `STUDIO_CAPTURE_PLAN` untuk menguji alur pembuatan cerita, pengeditan timeline, dan ekspor FFmpeg.

---

## 2. Perintah Verifikasi Wajib (Mandatory Commands)

Setiap perubahan kode **WAJIB** lulus dua perintah utama ini sebelum tugas dinyatakan selesai:

### A. Verifikasi TypeScript
```bash
npm run typecheck
```
*Kriteria Lulus:* Exit code 0, nol error pada `tsconfig.node.json` (main, preload, shared) dan `tsconfig.web.json` (renderer, shared). Tidak ada variabel atau impor yang tidak terpakai (`noUnusedLocals`, `noUnusedParameters`).

### B. Validasi Build Produksi
```bash
npm run build
```
*Kriteria Lulus:* Berkas keluaran terkompilasi sempurna di folder `out/`:
- `out/main/index.js`
- `out/preload/index.js`
- `out/renderer/index.html` dan aset terkait.

---

## 3. Pengujian Dev Harness Otomatis (`src/main/devharness.ts`)

Aplikasi menyediakan dev harness bawaan untuk mengotomatisasi pengujian alur kompleks tanpa intervensi klik manual:

### A. Menjalankan Uji dengan Isolasi Data Pengguna
Gunakan folder data sementara agar database dan kunci API asli pengguna tidak terganggu:
```powershell
$env:STUDIO_USER_DATA = "C:\temp\audirastory-dev"
$env:STUDIO_CAPTURE_PLAN = "test_plan.json"
npm run dev
```

### B. Skenario Uji Ekspor Proyek Demo (Seed & Export)
Buat berkas rencana uji JSON sederhana, contoh `export_test.json`:
```json
[
  { "main": "seed" },
  { "main": "export", "timeoutMs": 60000 }
]
```
Jalankan pengujian ekspor:
```powershell
$env:STUDIO_USER_DATA = "C:\temp\audirastory-dev"
$env:STUDIO_CAPTURE_PLAN = "export_test.json"
npm run build
node node_modules/electron/dist/electron.exe .
```

### C. Verifikasi Integritas Video Ekspor Menggunakan FFmpeg
Periksa kesesuaian durasi video dan audio hasil ekspor:
```powershell
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 out_video.mp4
```
*Kriteria Lulus:* Durasi aliran video (`v:0`) dan aliran audio (`a:0`) harus seimbang tanpa pemotongan dini gambar di sambungan klip.

---

## 4. Matriks Kriteria Penerimaan (Acceptance Criteria Matrix)

| Modul / Alur | Kriteria Pengujian | Status Target |
| :--- | :--- | :--- |
| **Langkah Ide** | LLM menghasilkan naskah beradegan sesuai target durasi dan estimasi kata (~2,6 kata/detik) | PASS |
| **Langkah Naskah** | Pengguna dapat mengedit narasi, menambahkan voice tags, dan menyusun rencana visual terperinci | PASS |
| **Langkah Storyboard** | Lembar karakter tampak multi-arah ter-generate; gambar klip konsisten; estimasi kredit akurat | PASS |
| **Narasi & Whisper** | Narasi terekam utuh satu take; whisper-cli mendeteksi waktu kata tanpa halusinasi; pemotongan audio presisi di jeda alami | PASS |
| **Editor Timeline** | Klip magnetis saling menempel; audio tertaut dapat digeser/dipotong; split adegan (`S`) membelah naskah dan suara | PASS |
| **Player Pratinjau** | Pipeline 3-klip isolate memutar video tanpa jeda/kedip hitam; gerak kamera CSS dan transisi berjalan mulus | PASS |
| **Ekspor FFmpeg** | Render MP4 menghasilkan video 1080p/720p dengan filter `perspective`, transisi xfade buffer frame, dan subtitle rounded box libass | PASS |
| **Keamanan BYOK** | Kunci API tersimpan terenkripsi DPAPI di SQLite; tidak ada kunci yang bocor ke log atau tampilan layar | PASS |
| **Protokol `studio://`** | Aset gambar/video termuat dengan lancar; scrubbing/seeking audio video instan via status HTTP 206 | PASS |
