# Incident & Problem Resolution Log (Episodic Memory Bank)

> **Catatan Sejarah Insiden Teknis, Analisis Akar Masalah, dan Solusi Definitif**  
> Proyek: `AUDIRA-STICK-STORY` (Audira Story)  
> Pemilik: AUDIRA (Agus Dwi R)

Dokumen ini berfungsi sebagai **Episodic Memory** (Memori Pengalaman). Setiap AI Agent dilarang mengulang bug atau kesalahan yang sudah terdokumentasi di sini.

---

## Log Insiden Terdata

### [INC-001] Bug Jitter Mikro Kamera pada Ekspor FFmpeg
- **Tanggal:** 2026-09
- **Modul Terkait:** `src/main/exporter.ts`, `src/shared/motion.ts`
- **Gejala:** Hasil video MP4 yang diekspor mengalami patah-patah atau getaran mikro (micro-jitter) saat transisi pan atau zoom berlangsung, padahal pratinjau Player React terlihat halus.
- **Akar Masalah:** Filter bawaan `zoompan` FFmpeg bekerja dengan pembulatan integer frame dan subpixel snapping yang tidak sinkron dengan refresh rate 60fps, serta memiliki buffer internal yang menyebabkan drift.
- **Solusi Definitif (ADR):** Ganti implementasi kamera FFmpeg menggunakan formula filter kustom `perspective` yang menghitung koordinat quad 4-titik per frame secara presisi floating point, selaras dengan CSS 3D transform di `Player.tsx`.

---

### [INC-002] Halusinasi Repetisi Kata pada Transkripsi Whisper
- **Tanggal:** 2026-09
- **Modul Terkait:** `src/main/whisper.ts`, `src/main/align.ts`
- **Gejala:** Saat memproses adegan dengan narasi pendek atau jeda hening di awal, Whisper lokal kerap kali menghasilkan pengulangan kata tanpa henti (hallucination loop).
- **Akar Masalah:** Parameter prompt awal (`--prompt`) pada model kecil memicu bias autoregresif yang memperkuat token sebelumnya saat menghadapi sinyal audio dengan SNR rendah.
- **Solusi Definitif (ADR):** Eksekusi `whisper-cli.exe` menggunakan flag `-nfa -dtw small` tanpa prompt awal sama sekali. Gunakan modul `align.ts` berbasis dynamic time warping untuk mencocokkan kata naskah asli dengan timestamp audio.

---

### [INC-003] Video Playhead Latency & Audio Crackle saat Seeking
- **Tanggal:** 2026-09
- **Modul Terkait:** `src/main/protocol.ts`, `src/renderer/src/pages/project/editor/Timeline.tsx`
- **Gejala:** Menggeser scrubber/playhead di Timeline menyebabkan penundaan pemuatan video dan suara gemerisik/audio stuttering.
- **Akar Masalah:** Skema URL standar Chromium `file://` tidak mendukung header HTTP 206 (Partial Content / Byte Ranges), sehingga Chromium mencoba membaca ulang file dari offset awal setiap kali seeking dilakukan.
- **Solusi Definitif (ADR):** Daftarkan skema protokol kustom `studio://` di Electron main process (`protocol.registerStreamProtocol` / `protocol.handle`) yang mengurai header `Range: bytes=start-end` dan menyajikan chunk stream yang tepat.

---

### [INC-004] Rebuild Failure `better-sqlite3` pada Ekosistem Windows
- **Tanggal:** 2026-09
- **Modul Terkait:** `package.json`, `src/main/db/index.ts`
- **Gejala:** Saat menjalankan `npm run dev`, muncul error `NODE_MODULE_VERSION mismatch` pada modul native SQLite.
- **Akar Masalah:** Modul binary C++ `better-sqlite3` dikompilasi secara default untuk Node.js runtime host, bukan Electron runtime yang memiliki ABI berbeda.
- **Solusi Definitif (ADR):** Tambahkan skrip postinstall `electron-rebuild -f -w better-sqlite3` di `package.json` untuk otomatis mengompilasi ulang biner SQLite khusus Electron setelah instalasi paket.
