# MEMORY.md — AUDIRA Global Agent Memory Architecture & Cognitive Persistence Engine

> **Single Source of Truth untuk Arsitektur Memori AI Agent & Pengembang**  
> **Pencipta & Pemegang HAKI:** AUDIRA (Agus Dwi R) | Hak Cipta Dilindungi Undang-Undang.  
> **Tujuan Dokumen:** Memastikan seluruh AI Agent (Antigravity, Cursor, Claude Code, Gemini CLI, Windsurf, Copilot) dan pengembang selalu memahami **APA itu fungsi memori**, **MENGAPA memori wajib ada**, **BAGAIMANA memori bekerja**, serta **KAPAN memori harus dibaca dan diperbarui** di setiap proyek.

---

## 0. EXECUTIVE SUMMARY: APA ITU MEMORY & MENGAPA WAJIB ADA?

### Masalah Fundamental AI: Amnesia Sesi (Stateless AI Problem)
Model Kecerdasan Buatan (LLM) secara alamiah bersifat **stateless**. Setiap kali jendela percakapan (session/turn) baru dimulai, model kehilangan ingatan tentang:
- Siapa pemilik dan arsitek proyek,
- Mengapa sebuah keputusan teknis diambil (Architectural Decision Records / ADR),
- Bug apa yang pernah terjadi dan bagaimana cara memperbaikinya,
- File mana yang sangat sensitif dan dilarang disentuh (Guardrails),
- Status tugas terakhir yang sedang dikerjakan.

Tanpa memori persisten, AI agent akan:
1. **Mengulangi bug masa lalu** yang sudah susah payah diperbaiki.
2. **Melakukan halusinasi arsitektur** (menggunakan library acak yang bertentangan dengan desain inti).
3. **Melanggar prinsip Minimal Blast Radius** (merombak kode yang sudah stabil karena tidak tahu konteksnya).
4. **Menghabiskan token dan waktu** untuk memindai ulang seluruh codebase dari nol di setiap sesi.

### Solusi: Memori Persisten Berbasis Berkas (Externalized Cognitive Memory)
`MEMORY.md` dan sistem memori di folder [`.agents/`](file:///f:/AUDIRA-STICK-STORY/.agents/) adalah **otak persisten eksternal** proyek. Sistem ini menjamin bahwa pengetahuan, keputusan, dan batasan proyek tidak pernah hilang meskipun AI agent berganti, sesi direstart, atau pengembang baru bergabung.

---

## 1. FUNGSI UTAMA MEMORY DI SETIAP PROYEK (THE 5 CORE FUNCTIONS)

Setiap proyek dalam ekosistem AUDIRA mengandalkan sistem memori untuk 5 fungsi vital berikut:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   5 FUNGSI UTAMA MEMORY BAGI AGENT                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. ANTI-AMNESIA            Menjaga kontinuitas kerja antar sesi        │
│ 2. ARSITEKTUR & ADR        Menyimpan alasan "KENAPA" kode demikian     │
│ 3. PENCEGAHAN BUG (REGRESI)Menghindari pengulangan kesalahan lama      │
│ 4. HARMONISASI MULTI-AGENT Antigravity, Cursor, Claude berjalan searah │
│ 5. BUKU BESAR STATUS       Melacak progres nyata vs tugas tertunda     │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Anti-Amnesia (Session Continuity)
- **Fungsi:** Menyediakan titik mulai instan (*instant boot*) bagi AI agent tanpa perlu instruksi berulang dari pengguna.
- **Dampak:** Pengguna cukup memberikan tugas inti, dan agent langsung tahu standar penulisan kode, arsitektur folder, serta batasan file yang relevan.

### 2. Preservasi Keputusan Arsitektur (Architectural Decision Records / ADR)
- **Fungsi:** Menyimpan alasan mengapa suatu solusi dipilih dan alternatif lain ditolak.
- **Contoh Nyata Proyek Ini:**
  - *Kenapa FFmpeg memakai filter `perspective` dan bukan `zoompan`?* (Karena `zoompan` FFmpeg memiliki bug temporal jitter mikro dan rounding frame rate).
  - *Kenapa model whisper lokal memakai `-nfa -dtw small` tanpa prompt?* (Untuk akurasi perataan kata 0.1s dan mencegah loop halusinasi).
  - *Kenapa kunci API disimpan di SQLite dengan Electron `safeStorage` (DPAPI)?* (Untuk keamanan Windows lokal BYOK tanpa menyimpan plaintext di `.env`).

### 3. Pencegahan Regresi Bug (Bug Repetition Shield)
- **Fungsi:** Mendokumentasikan akar masalah (*root cause*) dan solusi definitif dari setiap insiden kritis yang telah diselesaikan.
- **Aturan:** Sebelum AI agent memodifikasi kode di area sensitif, agent wajib mengecek memori insiden agar tidak membangkitkan bug lama.

### 4. Harmonisasi Multi-Agent & Multi-Tool
- **Fungsi:** Proyek sering kali dikerjakan bergantian oleh berbagai alat bantu AI (Antigravity IDE, Cursor, Claude Code, Gemini CLI, Copilot).
- **Standarisasi:** Sistem memori di `.agents/` adalah lingua franca yang dipatuhi oleh seluruh agent sehingga tidak ada agen yang merusak konvensi agen lainnya.

### 5. Buku Besar Status Nyata (State & Ledger Verification)
- **Fungsi:** Memisahkan antara fitur yang **sudah stabil (STABLE)**, fitur yang **dalam pengerjaan (IN PROGRESS)**, dan rencana masa depan.
- **Tujuan:** Mencegah AI membuat klaim palsu bahwa suatu fitur sudah berjalan padahal belum diuji atau belum diimplementasikan.

---

## 2. TAKSONOMI MEMORY (4 LAPISAN KOGNITIF SISTEM)

Arsitektur memori Audira dibagi ke dalam 4 lapisan yang saling melengkapi:

```mermaid
graph TD
    subgraph L1 [Layer 1: Working Memory (Jangka Pendek)]
        WM[TASK_INSTRUCTION.md & Context Window Saat Ini]
    end

    subgraph L2 [Layer 2: Episodic Memory (Pengalaman & Riwayat)]
        EM[Riwayat Perubahan, Log Insiden, Catatan Rilis]
    end

    subgraph L3 [Layer 3: Semantic Memory (Pengetahuan Abadi)]
        SM[BRAIN.md, ARCHITECTURE.md, PRD.md, docs/]
    end

    subgraph L4 [Layer 4: Procedural Memory (Keterampilan & SOP)]
        PM[skills/, Aturan 6-Tempat Klip, Aturan 3-Tempat IPC]
    end

    WM --> |Selesai Tugas| EM
    EM --> |Penyulingan Pengetahuan| SM
    SM --> |Standarisasi Alur Kerja| PM
    PM -.-> |Memandu Eksekusi| WM
```

| Lapisan Memory | Jenis Memori | Lokasi Berkas | Deskripsi & Isi Utama | Masa Hidup |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 1** | **Working Memory** (Konteks Aktif) | [`.agents/TASK_INSTRUCTION.md`](file:///f:/AUDIRA-STICK-STORY/.agents/TASK_INSTRUCTION.md) | Tugas yang sedang berjalan saat ini, file target, checklist verifikasi instan. | Per sesi / per tugas aktif |
| **Layer 2** | **Episodic Memory** (Pengalaman) | [`.agents/brain/` / Riwayat `BRAIN.md`](file:///f:/AUDIRA-STICK-STORY/.agents/BRAIN.md) | Log kejadian penting, insiden & resolusi bug, catatan migrasi database. | Kumulatif & permanen |
| **Layer 3** | **Semantic Memory** (Pengetahuan Abadi) | [`.agents/BRAIN.md`](file:///f:/AUDIRA-STICK-STORY/.agents/BRAIN.md), [`.agents/ARCHITECTURE.md`](file:///f:/AUDIRA-STICK-STORY/.agents/ARCHITECTURE.md) | Topologi sistem, indeks modul sumber, register tipe data, model eksternal, hukum mutlak proyek. | Permanen (diperbarui jika arsitektur berubah) |
| **Layer 4** | **Procedural Memory** (SOP / Tata Cara) | [`.agents/skills/`](file:///f:/AUDIRA-STICK-STORY/.agents/skills/), [`AGENTS.md`](file:///f:/AUDIRA-STICK-STORY/AGENTS.md) | Prosedur langkah demi langkah: Cara menambah kolom klip, cara membuat IPC baru, cara build, cara rilis. | Prosedural standar |

---

## 3. PROTOKOL OPERASIONAL AI AGENT (SOP BACA & TULIS)

Setiap AI agent yang berinteraksi dengan proyek **WAJIB** menjalankan protokol berikut secara disiplin:

```
[FASE 1: READ-ON-BOOT]  ──> [FASE 2: MINIMAL BLAST] ──> [FASE 3: WRITE-ON-FINISH]
  Baca AGENTS.md               Hanya sentuh file target    Verifikasi typecheck & build
  Baca .agents/MEMORY.md       Patuhi SOP & guardrails     Perbarui TASK_INSTRUCTION & BRAIN
  Baca .agents/BRAIN.md
```

### Fase 1: Protokol Membaca (Read-on-Boot)
Saat menerima instruksi baru dari pengguna, sebelum menulis atau menyunting satu baris kode pun:
1. **Langkah 1:** Baca [`AGENTS.md`](file:///f:/AUDIRA-STICK-STORY/AGENTS.md) untuk memahami guardrails, larangan keras, dan perintah verifikasi.
2. **Langkah 2:** Baca [`.agents/MEMORY.md`](file:///f:/AUDIRA-STICK-STORY/.agents/MEMORY.md) (dokumen ini) untuk mengingat fungsi memori dan batasan arsitektural.
3. **Langkah 3:** Baca [`.agents/BRAIN.md`](file:///f:/AUDIRA-STICK-STORY/.agents/BRAIN.md) untuk memahami topologi modul, status fitur, dan hukum mutlak.
4. **Langkah 4:** Baca [`.agents/TASK_INSTRUCTION.md`](file:///f:/AUDIRA-STICK-STORY/.agents/TASK_INSTRUCTION.md) untuk memeriksa fokus tugas aktif.

### Fase 2: Protokol Eksekusi (In-Task Guardrails)
1. **Minimal Blast Radius:** HANYA ubah file yang ditugaskan. Dilarang refactoring liar atau mengubah konfigurasi global (`tsconfig`, `vite.config`, skema DB lama).
2. **Pratinjau = Ekspor:** Logika visual/audio wajib di `src/shared/` dan digunakan simetris di renderer dan FFmpeg.
3. **Strict Typing:** Dilarang menggunakan tipe `any`. Wajib nol peringatan `noUnusedLocals` / `noUnusedParameters`.

### Fase 3: Protokol Menulis / Memperbarui Memori (Write-on-Finish)
Agent **WAJIB** memperbarui berkas memori setelah menyelesaikan tugas jika terjadi hal berikut:
1. **Menambah Kolom Klip / Entitas Baru:** Perbarui `BRAIN.md` dan `types.ts`.
2. **Menambah Endpoint IPC Baru:** Perbarui register IPC di `BRAIN.md` dan kontrak tipe.
3. **Menyelesaikan Masalah / Bug Sulit:** Catat akar masalah dan solusinya di Episodic Memory (`BRAIN.md` atau `.agents/brain/`).
4. **Menyelesaikan Fitur:** Tandai checklist di `TASK_INSTRUCTION.md` dan perbarui status di Feature Ledger `BRAIN.md`.

---

## 4. TEMPLATE STANDAR MEMORY UNTUK SETIAP PROYEK AUDIRA

Bila kamu membuat atau membuka proyek baru dalam ekosistem AUDIRA (misalnya `AUDIRA-NetOps-AI`, `AUDIRA-CRM`, dsb.), selalu terapkan struktur direktori `.agents/` standar ini:

```
<project-root>/
├── AGENTS.md                  # Pintu gerbang utama guardrails & panduan agen
└── .agents/
    ├── MEMORY.md              # [DOKUMEN INI] Filosofi, fungsi, dan arsitektur memori
    ├── BRAIN.md               # Master Single Source of Truth & peta sistem proyek
    ├── TASK_INSTRUCTION.md    # Fokus tugas aktif & SOP spesifik proyek
    ├── ARCHITECTURE.md        # Desain arsitektur teknis mendalam
    ├── brain/                 # Direktori catatan kognitif episodik
    │   ├── README.md          # Panduan catatan episodik & indeks memori
    │   └── incident_log.md    # Riwayat penanganan bug dan catatan keputusan
    └── skills/                # Prosedur otomatisasi & skill khusus proyek
```

### Checklist Penerapan di Proyek Baru:
- [ ] Buat file `AGENTS.md` di root dengan prinsip Minimal Blast Radius.
- [ ] Buat `.agents/MEMORY.md` untuk mengingatkan fungsi memori.
- [ ] Buat `.agents/BRAIN.md` dengan System Topology, Register Modul, dan Feature Ledger.
- [ ] Buat `.agents/TASK_INSTRUCTION.md` untuk melacak tugas aktif.
- [ ] Sinkronkan seluruh tautan berkas menggunakan path relatif atau path absolut workspace aktif.

---

## 5. BUKU CATATAN EPISODIK AUDIA STORY (INSIDENT & RESOLUTION LOG)

Berikut adalah memori hidup dari insiden kritis yang telah diselesaikan di proyek `AUDIRA-STICK-STORY`. Catatan ini **wajib diingat selamanya** agar kesalahan yang sama tidak pernah berulang:

| Tanggal | Area / Modul | Gejala Masalah (Symptom) | Akar Masalah (Root Cause) | Solusi Definitif yang Diadopsi (ADR) |
| :--- | :--- | :--- | :--- | :--- |
| **2026-10-09** | **Rebranding** | Masih ada referensi nama lama di metadata dan strings | Inkonsistensi teks nama lama di `electron-builder.yml`, `package.json`, dan dokumen docs | Rebranding total ke **Audira Story** / **AUDIRA (Agus Dwi R)** di seluruh codebase dan docs. |
| **2026-09** | **FFmpeg Exporter** | Video hasil ekspor bergetar mikro (jittering) saat pan/zoom | Filter bawaan `zoompan` FFmpeg melakukan pembulatan frame rate dan subpixel snapping | Ganti dengan formula filter `perspective` kustom di `exporter.ts` yang selaras dengan matrix CSS renderer. |
| **2026-09** | **Whisper Engine** | Transkripsi kata melompat atau mengalami halusinasi repetisi | Parameter prompt whisper memicu loop kata pada file audio pendek | Jalankan `whisper-cli.exe` dengan opsi `-nfa -dtw small` tanpa prompt awal, dipadukan dengan algoritma alignment di `align.ts`. |
| **2026-09** | **SQLite Windows** | `better-sqlite3` gagal di-load di Electron renderer | Modul C++ native membutuhkan rebuild sesuai ABI Electron versi aktif | Konfigurasi `postinstall` dengan `electron-rebuild` khusus Electron Node environment. |
| **2026-09** | **Video Seeking** | Audio/video lag saat digeser di Timeline | Protokol `file://` Chromium tidak mendukung HTTP 206 Partial Content Range | Implementasikan protokol kustom `studio://` di `src/main/protocol.ts` yang melayani HTTP 206 Partial Content Range. |
| **2026-09** | **API Security** | Potensi kebocoran API Key di file konfigurasi | Penyimpanan plaintext di `.env` atau JSON biasa berisiko terbaca | Wajib enkripsi DPAPI Windows menggunakan Electron `safeStorage` di `secrets.ts` (BYOK mode). |

---

## 6. KESIMPULAN & IKRAR AGENT (AGENT COMMITMENT)

> *"Sebagai AI Agent yang bekerja pada ekosistem AUDIRA, saya berjanji untuk tidak pernah bertindak dalam kondisi amnesia. Saya akan selalu membaca `MEMORY.md` dan `BRAIN.md` sebelum bertindak, menjaga batas perubahan minimal, menghormati hak cipta AUDIRA (Agus Dwi R), dan selalu memperbarui memori sistem setelah menyelesaikan tugas."*

---
*Dokumen ini adalah standar resmi sistem memori agen AUDIRA. Hak Cipta © AUDIRA (Agus Dwi R).*
