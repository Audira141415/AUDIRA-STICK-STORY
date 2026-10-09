# ARCHITECTURE — AUDIRA STORY (AUDIRA-STICK-STORY)

> Dokumen Arsitektur Teknis Sistem Produksi Video Cerita YouTube Berbasis AI (Desktop Electron + React + FFmpeg).  
> **Pencipta & Pemegang HAKI:** AUDIRA (Agus Dwi R) | Hak Cipta Dilindungi Undang-Undang.  
> **Versi Proyek:** v1.0.0  
> **Terakhir Diperbarui:** 2026-10-09  

---

## 1. Ringkasan Sistem (System Overview)

**Audira Story** adalah aplikasi desktop modern yang mentransformasikan ide cerita tertulis menjadi video YouTube/media sosial siap tonton. Sistem mengorkestrasikan kecerdasan buatan multi-tier (LLM naskah & visual, Higgsfield gambar & video AI, Gemini & ElevenLabs text-to-speech), pengenal suara lokal berakurasi tinggi (whisper.cpp dengan Dynamic Time Warping), editor timeline non-linear magnetis, serta mesin ekspor video broadcast MP4 berbasis FFmpeg.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANTARMUKA PENGGUNA (RENDERER)                   │
│                                                                        │
│   +------------------+  +------------------+  +-------------------+    │
│   │     IdeaStep     │  │    ScriptStep    │  │   StoryboardStep  │    │
│   │ (Sinopsis/Durasi)│  │ (Adegan & Narasi)│  │(Visual/Higgsfield)│    │
│   +------------------+  +------------------+  +-------------------+    │
│             │                     │                     │              │
│             └─────────────────────┼─────────────────────┘              │
│                                   v                                    │
│   +----------------------------------------------------------------+   │
│   │                        EditorStep                              │   │
│   │  +--------------------------+  +----------------------------+  │   │
│   │  │    Player (Pratinjau)    │  │  Inspector & Overlays      │  │   │
│   │  │  - 3-Clip Isolate Engine │  │  - Kamera & Transisi       │  │   │
│   │  │  - Gerak Kamera (CSS)    │  │  - Gaya Caption & Font     │  │   │
│   │  │  - Caption Real-time DOM │  │  - Audio & Musik Balance   │  │   │
│   │  +--------------------------+  +----------------------------+  │   │
│   │  +----------------------------------------------------------+  │   │
│   │  │             Timeline Magnetis Non-Linear                 │  │   │
│   │  │  - Klip Gambar/Video | Suara Tertaut | Caption | Musik   │  │   │
│   │  +----------------------------------------------------------+  │   │
│   +----------------------------------------------------------------+   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                     (IPC: contextBridge / window.api)
                                    v
┌────────────────────────────────────────────────────────────────────────┐
│                       PROSES UTAMA (MAIN PROCESS)                      │
│                                                                        │
│   +----------------------------------------------------------------+   │
│   │                      IPC Router (src/main/ipc.ts)              │   │
│   +----------------------------------------------------------------+   │
│             │                      │                     │             │
│             v                      v                     v             │
│   +-------------------+  +-------------------+  +------------------+   │
│   │ Repository SQLite │  │  Antrean Job      │  │  Protokol Kustom │   │
│   │ (better-sqlite3)  │  │  (Concurrency)    │  │  (studio://)     │   │
│   │ - studio.db       │  │  - Higgsfield (3) │  │  - Aset Proyek   │   │
│   │ - Migrations      │  │  - TTS (2)        │  │  - Font TTF      │   │
│   │ - Secrets (DPAPI) │  │  - Whisper (1)    │  │  - HTTP Range    │   │
│   │ - Snapshot Save   │  │  - Export (1)     │  │    Seeking       │   │
│   +-------------------+  +-------------------+  +------------------+   │
│             │                      │                     │             │
│             └──────────────────────┼─────────────────────┘             │
│                                    v                                   │
│   +----------------------------------------------------------------+   │
│   │                MESIN EKSEKUSI & LAYANAN EKSTERNAL              │   │
│   │                                                                │   │
│   │  - AI Services: Higgsfield AI (Image/Video), Gemini,           │   │
│   │                 ElevenLabs, OpenAI-Compatible (OpenRouter/Groq)│   │
│   │  - Whisper Engine: whisper.cpp CLI (-nfa -dtw small)           │   │
│   │  - Audio Aligner & Cut Planner: align.ts & cuts.ts             │   │
│   │  - Exporter FFmpeg: libass, perspective filter, xfade frames   │   │
│   +----------------------------------------------------------------+   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Lapisan Arsitektur (Architectural Layers)

### 1. Presentation Layer (Renderer / React 19)
- **Teknologi**: React 19, Tailwind CSS v4 (design token di `@theme`), Zustand (`project.ts`, `app.ts`).
- **Sandbox Security**: Berjalan di lingkungan terisolasi (`sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`).
- **Pratinjau Multi-Klip Terisolasi (`Player.tsx` + `engine.ts`)**:
  - Mengelola pipeline 3-klip (klip sebelum, saat ini, dan sesudah) dalam wadah `isolate` untuk mencegah frame flash saat perpindahan video.
  - Simulasi gerak kamera real-time melalui transform CSS (`cameraCss`) dan transisi halus (`transitionStyles`).
  - Rendering caption real-time di DOM dengan font TTF yang identik dengan hasil ekspor.

### 2. Shared Domain & Computation Layer (`src/shared/`)
> **PRINSIP EMAS:** Semua logika matematika visual, audio, caption, dan timeline wajib berada di `src/shared/` dan digunakan bersama oleh Renderer (pratinjau) dan Main (ekspor).
- **`motion.ts`**: Perhitungan gerak kamera pan/zoom (`cameraAt`, `cameraCss`, `cameraPerspective`), jenis transisi, dan durasi transisi.
- **`captions.ts`**: Konfigurasi 15 font caption, metrik lebar `cell`, pemecahan baris (`layoutCaptionLines`), dan kalkulasi kotak rounded ASS.
- **`timeline.ts`**: Kalkulasi rentang suara (`voiceSpan`), kata caption aktif (`clipCaptionWords`), rentang musik (`musicSpan`), dan pemotongan narasi (`splitNarration`).
- **`overlays.ts`**: Format posisi teks/logo berbasis keypad 9-arah (anchor numpad 1–9) dan styling overlay.
- **`higgsfield.ts`**: Payload builder untuk Higgsfield AI, normalisasi rasio aspek, durasi video, dan resolusi.

### 3. Desktop Core & Service Layer (`src/main/`)
- **Database & Penyimpanan (`repo.ts`, `db/index.ts`)**:
  - SQLite lokal berkecepatan tinggi via `better-sqlite3`.
  - Migrasi skema versi inkremental berurutan (`PRAGMA user_version`).
  - Snapshot autosave proyek yang konsisten dan atomik.
- **Job Orchestration (`jobs.ts`)**:
  - Antrean latar belakang berbatas konkurensi (Higgsfield: 3, TTS: 2, Whisper: 1, Ekspor: 1).
  - Setiap job dikendalikan oleh `AbortController` sehingga dapat dibatalkan secara bersih.
- **Secure Vault (`secrets.ts`)**:
  - Kunci API pengguna (BYOK) dienkripsi menggunakan Electron `safeStorage` (Windows DPAPI terikat akun pengguna).
- **Audio Alignment & Cut Detection (`align.ts`, `cuts.ts`)**:
  - Menyelaraskan teks naskah dengan output waktu kata Whisper lokal.
  - Menentukan titik potong adegan pada jeda suara alami antar kata tanpa memotong suku kata.
- **FFmpeg Broadcast Exporter (`exporter.ts`)**:
  - Merender komposisi video, transisi xfade ber-buffer frame, efek kamera gerak pecahan piksel (`perspective`), mixing audio narasi & musik, serta subtitle ASS bergaya rounded box.

---

## 3. Struktur Direktori Proyek

```text
src/
  ├── main/                     # Backend desktop Node.js Electron
  │   ├── db/                   # Skema SQLite, migrasi (PRAGMA user_version)
  │   ├── services/             # Integrasi HTTP AI: Gemini, ElevenLabs, Higgsfield, LLM
  │   ├── align.ts & cuts.ts    # Penyelaras kata naskah & kalkulator titik potong adegan
  │   ├── editing.ts            # Operasi split klip dan pelepasan audio di timeline
  │   ├── events.ts             # Pengirim event IPC dari main ke renderer
  │   ├── exporter.ts           # Mesin render video FFmpeg MP4
  │   ├── fontMetrics.ts        # Ekstraksi metrik lebar glyph font TTF untuk ASS
  │   ├── generation.ts         # Pipeline pembuatan aset gambar/video Higgsfield
  │   ├── jobs.ts               # Antrean job latar belakang dengan konkurensi
  │   ├── narration.ts          # Pipeline narasi utuh satu rekaman + pemotongan
  │   ├── paths.ts & protocol.ts# Resolver path dan protokol kustom studio://
  │   ├── repo.ts               # Akses database SQLite
  │   ├── secrets.ts            # Enkripsi DPAPI untuk kunci API
  │   └── whisper.ts            # Wrapper lokal whisper.cpp CLI
  ├── preload/                  # Jembatan aman contextBridge (window.api)
  ├── shared/                   # Domain logic bersama (Pratinjau = Ekspor)
  │   ├── api.ts                # Kontrak tipe IPC request/response
  │   ├── captions.ts           # Gaya, font, pemenggalan caption
  │   ├── motion.ts             # Transformasi gerak kamera & transisi
  │   ├── timeline.ts           # Perhitungan matematika klip, audio, musik
  │   └── types.ts              # Model data inti (Project, Clip, Asset, Job)
  └── renderer/src/             # UI React 19 + Tailwind v4 + Zustand
      ├── components/           # Komponen modular (Select, Popover, ModelPicker, dll)
      ├── pages/project/        # 4 langkah alur produksi (Idea, Script, Storyboard, Editor)
      └── store/                # Zustand global state (project.ts, app.ts)
resources/                      # Aset biner bawaan (whisper-cli.exe, DLLs, font TTF)
```

---

## 4. Model Data & Entitas Utama

### Entitas `Clip` (Klip Timeline)
Setiap klip adalah satu adegan di timeline yang menghubungkan visual, suara, teks narasi, dan arahan kamera:
```typescript
interface Clip {
  id: string
  projectId: string
  sortOrder: number
  title: string
  story: string
  narration: string
  needsVisual: boolean
  visualPrompt: string
  camera: CameraMotion
  strength: MotionStrength
  transition: TransitionType
  transitionSec: number
  videoPrompt: string
  imageId?: string
  videoId?: string
  voiceId?: string
  mediaInMs: number
  durationMs: number
  voiceInMs: number
  voiceStartMs: number
  voiceOutMs: number
  voiceVolume: number
  videoCamera?: CameraMotion
  videoStrength?: MotionStrength
  videoSpeed?: number
}
```

### Entitas `Project`
```typescript
interface Project {
  id: string
  title: string
  synopsis: string
  step: 'idea' | 'script' | 'storyboard' | 'editor'
  targetDuration: number
  language: string
  musicTrack?: string
  musicVolume: number
  captionFont: string
  captionStyle: CaptionStyle
  videoResolution: '1080p' | '720p'
  // ... metadata lainnya
}
```

---

## 5. Keputusan Arsitektur Kunci (Key Architectural Decisions)

1. **Kenapa Rekaman Narasi Utuh Satu Kali (`narration.ts`)?**
   - TTS yang dipanggil terpisah per adegan menghasilkan karakter suara, timbre, dan intonasi yang tidak konsisten. Merekam naskah utuh dalam satu take menghasilkan narasi alami seperti penyiar profesional, yang kemudian dipotong presisi per adegan berdasarkan analisis Whisper.
2. **Kenapa Whisper Lokal Tanpa `--prompt` dengan Dynamic Time Warping (DTW)?**
   - Memberikan naskah sebagai prompt ke Whisper sering menyebabkan halusinasi loop pengulangan kata. Menggunakan whisper.cpp dengan flag `-nfa -dtw small` tanpa prompt memberikan akurasi penandaan waktu kata terbaik (~0.1-0.2 detik). Ejaan kata tetap diambil dari naskah asli (`align.ts`).
3. **Kenapa Filter `perspective` FFmpeg dan Bukan `zoompan`?**
   - Filter bawaan `zoompan` membulatkan koordinat crop ke piksel integer setiap frame, menyebabkan micro-jitter (getaran 0.6–0.7 px) pada adegan lambat. Filter `perspective` beroperasi pada pecahan piksel sub-pixel (jitter hanya 0.02–0.16 px) sehingga gerakan kamera sangat mulus.
4. **Kenapa Protokol Kustom `studio://`?**
   - Mencegah kelemahan keamanan `file://` di Chromium serta menyediakan dukungan penuh HTTP Range Request (status 206 Partial Content) agar pemutar video dan audio di renderer dapat melakukan seeking instan tanpa lagging.

---

## 6. Batasan & Aturan Wajib Sistem (System Constraints)

1. **Pratinjau Wajib Identik dengan Ekspor**: Dilarang membuat rumus gerak kamera, pemotongan kata caption, atau kalkulasi durasi yang hanya bekerja di satu sisi.
2. **Kepatuhan Aturan 6-Tempat Kolom Klip**: Setiap penambahan field baru pada klip harus diperbarui di: `shared/types.ts`, migrasi database, `toClip`, `saveSnapshot`, `duplicateProject`, dan `addClip`.
3. **Kepatuhan Aturan 3-Tempat IPC**: Setiap IPC baru harus didaftarkan di `main/ipc.ts`, `shared/api.ts`, dan `preload/index.ts`.
4. **Keamanan Kunci API (BYOK)**: Kunci API tidak boleh dicatat dalam berkas log, pesan kesalahan antarmuka, atau diekspos ke proses renderer.
