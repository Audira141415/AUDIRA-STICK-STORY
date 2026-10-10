# TASK_INSTRUCTION — AUDIRA STORY (AUDIRA-STICK-STORY)

> Dokumen Panduan Tugas Aktif, SOP Modifikasi Kode, dan Checklist Verifikasi Mandatori.  
> **Pencipta & Pemegang HAKI:** AUDIRA (Agus Dwi R) | Hak Cipta Dilindungi Undang-Undang.  
> Gunakan berkas ini sebagai panduan operasional agar AI Assistant dan pengembang tetap disiplin pada scope tugas dan tidak melanggar batasan arsitektur.  
> **Terakhir Diperbarui:** 2026-10-09  

---

## 0. Bacaan Wajib Sebelum Mengubah Kode (Prerequisite Reading)

Sebelum menambahkan modul baru atau mengubah kode yang ada, kamu **WAJIB** membaca dan memahami:
1. [`AGENTS.md`](file:///f:/AUDIRA-STICK-STORY/AGENTS.md) — Aturan batas ketat (Guardrails), prinsip *Minimal Blast Radius*, dan tech stack.
2. [`.agents/MEMORY.md`](file:///f:/AUDIRA-STICK-STORY/.agents/MEMORY.md) — Arsitektur sistem kognitif, fungsi utama memory, taksonomi, dan protokol operasional anti-amnesia.
3. [`.agents/BRAIN.md`](file:///f:/AUDIRA-STICK-STORY/.agents/BRAIN.md) — Single Source of Truth, hukum mutlak proyek, dan topologi arsitektur.
4. [`.agents/ARCHITECTURE.md`](file:///f:/AUDIRA-STICK-STORY/.agents/ARCHITECTURE.md) — Arsitektur multi-proses Electron, SQLite, dan FFmpeg.
5. [`docs/`](file:///f:/AUDIRA-STICK-STORY/docs/README.md) — Dokumentasi spesifik domain (`editor-dan-ekspor.md`, `alur-produksi.md`, `keputusan-teknis.md`).

---

## 1. SOP Alur Kerja Khusus Proyek

### A. Alur Menambahkan Kolom Klip Baru (Aturan 6-Tempat)
Jika menambahkan properti/kolom baru pada entitas adegan (`Clip`):
1. **Definisi Tipe:** Tambahkan di `interface Clip` pada [`src/shared/types.ts`](file:///f:/AUDIRA-STICK-STORY/src/shared/types.ts).
2. **Migrasi Database:** Tambahkan skrip `ALTER TABLE clips ADD COLUMN ...` baru di akhir array `MIGRATIONS` pada [`src/main/db/index.ts`](file:///f:/AUDIRA-STICK-STORY/src/main/db/index.ts). Dilarang mengubah nomor migrasi lama.
3. **Mapper Database:** Tambahkan pembacaan kolom pada fungsi `toClip()` di [`src/main/repo.ts`](file:///f:/AUDIRA-STICK-STORY/src/main/repo.ts).
4. **Penyimpanan Snapshot:** Tambahkan kolom pada kueri upsert `saveSnapshot()` di [`src/main/repo.ts`](file:///f:/AUDIRA-STICK-STORY/src/main/repo.ts).
5. **Duplikasi Proyek:** Tambahkan kolom pada fungsi `duplicateProject()` dan `insertClipAfter()` di [`src/main/repo.ts`](file:///f:/AUDIRA-STICK-STORY/src/main/repo.ts).
6. **State Renderer Awal:** Tambahkan nilai default kolom pada fungsi `addClip` di [`src/renderer/src/store/project.ts`](file:///f:/AUDIRA-STICK-STORY/src/renderer/src/store/project.ts).

### B. Alur Menambahkan Kanal IPC Baru (Aturan 3-Tempat)
1. **Handler Utama:** Daftarkan handler di [`src/main/ipc.ts`](file:///f:/AUDIRA-STICK-STORY/src/main/ipc.ts) menggunakan `handle('kanal:nama', ...)`.
2. **Kontrak Tipe:** Tambahkan method pada antarmuka `StudioApi` di [`src/shared/api.ts`](file:///f:/AUDIRA-STICK-STORY/src/shared/api.ts).
3. **Preload Wrapper:** Tambahkan fungsi pemanggil di [`src/preload/index.ts`](file:///f:/AUDIRA-STICK-STORY/src/preload/index.ts) menggunakan `call('kanal:nama', ...)`.

### C. Alur Mengubah Visual / Kamera / Transisi / Audio (Pratinjau = Ekspor)
1. Seluruh logika kalkulasi wajib ditulis di [`src/shared/`](file:///f:/AUDIRA-STICK-STORY/src/shared/) (`motion.ts`, `captions.ts`, `timeline.ts`).
2. Sisi pratinjau ([`Player.tsx`](file:///f:/AUDIRA-STICK-STORY/src/renderer/src/pages/project/editor/Player.tsx)) dan sisi ekspor ([`exporter.ts`](file:///f:/AUDIRA-STICK-STORY/src/main/exporter.ts)) wajib mengimpor dan memakai modul bersama tersebut.
3. Dilarang menghitung ulang offset atau durasi dengan rumus lokal di salah satu sisi saja.

---

## 2. Fokus Tugas Saat Ini (Active Focus)

- [x] **Tugas Utama:** Arsitektur Memori & Otak Kognitif Agen (`MEMORY.md` & `.agents/brain/`).
- **Target File:**
  - `.agents/MEMORY.md`
  - `.agents/BRAIN.md`
  - `.agents/brain/README.md`
  - `.agents/brain/incident_log.md`
  - `.agents/TASK_INSTRUCTION.md`
  - `AGENTS.md`
- **Tujuan Selesai:** Seluruh proyek memiliki sistem kognitif memori yang jelas sehingga setiap agen selalu mengingat apa fungsi memori dan bagaimana menggunakannya.

---

## 3. Checklist Verifikasi Mandatori Sebelum Tugas Selesai

- [x] **1. Strict TypeScript:** Jalankan `npm run typecheck` (wajib exit code 0 tanpa error).
- [x] **2. Bundling Produksi:** Jalankan `npm run build` (wajib sukses menghasilkan direktori `out/`).
- [x] **3. Radius Perubahan Minimal:** Pastikan tidak ada file di luar instruksi yang tersentuh atau terformat ulang tanpa izin.
- [x] **4. Tidak Ada Kunci API Bocor:** Pastikan tidak ada kredensial atau rahasia yang tercetak di kode atau file Markdown.
- [x] **5. Catat Pembaruan:** Perbarui seksi Riwayat Tugas dan status fitur di `.agents/BRAIN.md` serta `.agents/MEMORY.md`.

---

## 4. Riwayat Tugas (Task Log)

- [x] **Setup & Penguatan Guardrails AI**: Menambahkan batas ketat "Do Not" di `AGENTS.md` dan struktur awal `.agents/TASK_INSTRUCTION.md`.
- [x] **Adaptasi Sistem Customization .agents Master**: Mengadaptasi dan menyusun 8 pilar dokumentasi serta 3 skills operasional untuk Audira Story.
- [x] **Rebranding Menyeluruh ke Audira Story**: Menghapus seluruh kata nama lama dan merebrand semua berkas konfigurasi, shell scripts, dokumentasi, dan sistem agen menjadi milik resmi **AUDIRA (Agus Dwi R)**.
- [x] **Penerbitan Lisensi Komersial / Proprietary & README GitHub**: Menyusun lisensi resmi berbayar `LICENSE` atas nama **Agus Dwi R (AUDIRA)**, memperbarui `package.json`, `AboutSection.tsx`, dan membuat `README.md` berstandar showcase GitHub lengkap.
- [x] **Skrip Otomasi Deployment GitHub (save.bat)**: Membuat skrip `save.bat` untuk mempermudah inisialisasi Git, setup remote `https://github.com/Audira141415/AUDIRA-STICK-STORY.git`, commit bertanggal/kustom, dan push branch `main`.
- [x] **Pembangunan Sistem Memori Global & Otak Kognitif (.agents/MEMORY.md & .agents/brain/)**: Menyusun standar arsitektur memori komprehensif agar setiap AI agent selalu memahami fungsi memori, taksonomi memori (working, episodic, semantic, procedural), protokol baca-tulis, dan bank insiden masa lalu.

