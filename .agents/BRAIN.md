# BRAIN.md — AUDIRA STORY Master Cognitive Memory & System Brain

> **Single Source of Truth & Living Memory Bank** untuk Audira Story (`AUDIRA-STICK-STORY`).  
> Pusat Pengetahuan Sentral, Topologi Arsitektur, Indeks Modul Sumber, dan Buku Besar Fitur.  
> **Pencipta & Pemegang HAKI:** AUDIRA (Agus Dwi R) | Hak Cipta Dilindungi Undang-Undang.  
> **Aplikasi:** Desktop AI Video Production Studio (Electron + React 19 + TypeScript + FFmpeg + whisper.cpp).  

---

## 0. MANDATORY DIRECTIVE: PROTOKOL PEMBARUAN OTOMATIS (LIVING MEMORY PROTOCOL)

> [!IMPORTANT]
> **PERINGATAN UNTUK SEMUA AI AGENT (Antigravity, Claude Code, Cursor, Copilot, Gemini CLI):**
> File `BRAIN.md` ini adalah **otak hidup (living brain)** dari proyek Audira Story.
> 
> 1. **Wajib Membaca File Ini:** Sebelum memulai pekerjaan arsitektur, perbaikan bug, atau penambahan fitur, kamu wajib membaca file ini dan dokumen di [`.agents/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/.agents/) serta [`docs/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/docs/README.md).
> 2. **Wajib Memperbarui File Ini:** Setiap kali kamu:
>    - Menambahkan IPC handler / method API baru,
>    - Menambahkan kolom baru pada entitas `Clip` atau `Project`,
>    - Mengubah alur render FFmpeg atau pratinjau Player,
>    - Menyelesaikan tugas atau mengubah status fitur pada Feature Ledger,  
>    **kamu WAJIB memperbarui `BRAIN.md`** pada bagian terkait agar dokumentasi selalu sinkron dengan kenyataan kode.
> 3. **Hukum Mutlak Proyek (Non-Negotiable Laws):**
>    - **Radius Perubahan Minimal (Minimal Blast Radius):** HANYA sentuh file yang diperintahkan. Dilarang refactoring liar, dilarang merapikan file di luar instruksi, dilarang over-engineering.
>    - **Pratinjau = Ekspor:** Semua aturan visual, kamera, transisi, potongan audio, dan caption wajib berada di [`src/shared/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/) dan dipakai dua sisi (Player & FFmpeg). Jangan menghitung rumus di satu sisi saja.
>    - **Kunci API Milik Pengguna (BYOK):** Kunci disimpan terenkripsi dengan Electron `safeStorage` (DPAPI Windows) di tabel `secrets`. Dilarang mencetak kunci ke log, file, atau error toast.
>    - **Migrasi SQLite Inkremental:** Migrasi HANYA boleh ditambahkan di akhir array `MIGRATIONS` di [`src/main/db/index.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/db/index.ts). Jangan mengubah migrasi lama.
>    - **Aturan 6-Tempat Kolom Klip:** Menambah kolom `Clip` wajib di: `src/shared/types.ts`, migrasi `src/main/db/index.ts`, `toClip` di `src/main/repo.ts`, `saveSnapshot` di `src/main/repo.ts`, `duplicateProject` di `src/main/repo.ts`, dan nilai awal `addClip` di `src/renderer/src/store/project.ts`.
>    - **Aturan 3-Tempat IPC:** IPC baru wajib di: handler `src/main/ipc.ts`, tipe `src/shared/api.ts`, dan jembatan `src/preload/index.ts`.
>    - **Bahasa Antarmuka:** Teks UI berbahasa Indonesia santai menyapa dengan "kamu". Komentar dan nama kode berbahasa Inggris teknis.
>    - **UI Tanpa `<select>` Native:** Wajib memakai komponen kustom `Select` atau `Popover`. Pilihan gaya visual berupa grid thumbnail 1:1.

---

## 1. ATLAS ARSITEKTUR SISTEM (SYSTEM TOPOLOGY)

```mermaid
graph TD
    subgraph Renderer [Renderer Process (React 19 + Tailwind v4 + Zustand)]
        UI[Halaman Alur: Idea -> Script -> Storyboard -> Editor]
        Player[Player.tsx: 3-Clip Isolate Engine]
        TimelineUI[Timeline.tsx: Magnetic Clips & Attached Voice]
        ZustandStore[store/project.ts & store/app.ts]
        DOMCaptions[layoutCaptionLines: DOM Subtitle Renderer]
    end

    subgraph Preload [Preload Bridge (src/preload/index.ts)]
        Bridge[contextBridge: window.api]
    end

    subgraph MainProcess [Main Process (Electron Node.js)]
        IPCRouter[IPC Router: src/main/ipc.ts]
        JobQueue[Jobs Engine: jobs.ts - Concurrency Controller]
        Repo[Repository SQLite: better-sqlite3]
        Protocol[Protokol Kustom: studio:// HTTP Range Seeking]
        AlignEngine[Aligner & Cuts: align.ts & cuts.ts]
        FFmpegExp[FFmpeg Exporter: exporter.ts + libass]
        WhisperEngine[Whisper Local: whisper.ts -nfa -dtw small]
        SecretsVault[Secrets Manager: safeStorage / DPAPI]
    end

    subgraph ExternalServices [Layanan Eksternal & Cloud]
        Higgsfield[Higgsfield AI: Text-to-Image & Image-to-Video]
        Gemini[Google Gemini: LLM Script/Visuals & Gemini TTS]
        ElevenLabs[ElevenLabs: Word-timestamped TTS]
        OpenAICompat[OpenRouter / Groq / Custom LLM]
    end

    UI --> ZustandStore
    Player --> DOMCaptions
    Renderer <==> Bridge <==> IPCRouter
    IPCRouter --> Repo
    IPCRouter --> JobQueue
    JobQueue --> Higgsfield
    JobQueue --> Gemini
    JobQueue --> ElevenLabs
    JobQueue --> WhisperEngine
    JobQueue --> FFmpegExp
    IPCRouter --> AlignEngine
    Repo --> SecretsVault
    Renderer -.-> |studio://asset/ & studio://fonts/| Protocol
```

---

## 2. REGISTER DIREKTORI & INDEKS MODUL SUMBER

### A. Shared Domain Logic ([`src/shared/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/))
| Berkas | Peran & Tanggung Jawab Utama |
| :--- | :--- |
| [`types.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/types.ts) | Definisi tipe data global: `Project`, `Clip`, `Character`, `Asset`, `Job`, `Settings`, enum transisi & kamera. |
| [`api.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/api.ts) | Kontrak tipe komunikasi IPC: `StudioApi`, parameter request, tipe payload return, dan event listeners. |
| [`motion.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/motion.ts) | Kalkulasi gerak kamera 2D/3D (`cameraAt`, `cameraCss`, `cameraPerspective`), orientasi pan/zoom, durasi transisi. |
| [`captions.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/captions.ts) | 15 font caption resmi, metrik `cell` TTF, pemecah baris teks (`layoutCaptionLines`), dan generator kotak rounded ASS. |
| [`timeline.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/timeline.ts) | Perhitungan rentang suara (`voiceSpan`), kata per klip (`clipCaptionWords`), rentang musik (`musicSpan`), dan logika pemecahan suara (`splitNarration`). |
| [`overlays.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/overlays.ts) | Posisi overlay anchor keypad 9-arah (1–9), styling teks overlay, kalkulasi lane overlay multi-tumpuk. |
| [`higgsfield.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/higgsfield.ts) | Parameter generator Higgsfield, resolusi frame video, kecocokan durasi video klip (`fitDuration`). |
| [`models.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/models.ts) | Registri model LLM, suara bawaan Gemini TTS, pemetaan provider audio & LLM. |
| [`script.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/script.ts) | Estimasi durasi narasi per kata (`estimateNarrationMs`), pembagian jumlah adegan per target durasi (`clipCountFor`). |
| [`speech.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/speech.ts) | Tag jeda & ekspresi suara (`<short pause>`, `<long pause>`, `<chuckles>`, dll) serta parser ElevenLabs. |
| [`styles.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/styles.ts) | Pustaka gaya seni visual (Cinematic, Anime, Comic, Watercolor, 3D Render, Cyberpunk, dll) dengan prompt bawaan. |
| [`higgsfield-catalog.json`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/higgsfield-catalog.json) | Katalog 48 model Higgsfield (14 text-to-image, 34 image-to-video) dengan metadata kapabilitas dan resolusi. |

### B. Electron Main Process ([`src/main/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/))
| Berkas | Peran & Tanggung Jawab Utama |
| :--- | :--- |
| [`index.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/index.ts) | Entry point aplikasi Electron, window lifecycle, Chromium flags hardening, switch DirectComposition. |
| [`ipc.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/ipc.ts) | Pendaftaran semua handler IPC (`window.api`), validasi payload, formatting error ramah pengguna. |
| [`repo.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/repo.ts) | Akses data SQLite: CRUD proyek, snapshot save, duplikasi proyek, penghapusan cascading file. |
| [`db/index.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/db/index.ts) | Inisialisasi SQLite (`studio.db`), migrasi skema inkremental `MIGRATIONS` via `PRAGMA user_version`. |
| [`story.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/story.ts) | Orkestrasi LLM: Pembuatan naskah (`generateScript`), rencana visual (`generateVisuals`), dan prompt musik. |
| [`generation.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/generation.ts) | Pembuatan aset Higgsfield: Gambar klip, lembar karakter tampak multi-arah, video AI, estimasi kredit. |
| [`narration.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/narration.ts) | Pembuatan narasi satu rekaman utuh (Gemini/ElevenLabs), sinkronisasi Whisper, pemotongan file WAV per adegan. |
| [`whisper.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/whisper.ts) | Eksekusi whisper.cpp lokal via CLI (`resources/whisper/whisper-cli.exe`), pengunduhan model `ggml-small.bin`. |
| [`align.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/align.ts) | Pencocokan kata naskah ke timestamp hasil Whisper menggunakan algoritma alignment toleran. |
| [`cuts.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/cuts.ts) | Penentuan titik potong audio adegan berdasarkan celah jeda antar kata (`cutsFromWords`). |
| [`editing.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/editing.ts) | Operasi pemotongan klip di timeline (`splitClip`) dan pemisahan file audio narasi. |
| [`exporter.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/exporter.ts) | Mesin render video FFmpeg: filter graph, transisi xfade, gerak kamera `perspective`, ASS subtitle muxing. |
| [`fontMetrics.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/fontMetrics.ts) | Pengukuran metrik bounding box glyph TTF langsung dari file font untuk penentuan lebar kotak ASS. |
| [`jobs.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/jobs.ts) | Antrean job berlatar belakang dengan pembatasan konkurensi dan dukungan pembatalan `AbortController`. |
| [`secrets.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/secrets.ts) | Enkripsi DPAPI Windows via `safeStorage` untuk penyimpanan aman kunci API pengguna (BYOK). |
| [`protocol.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/protocol.ts) | Skema protokol kustom `studio://` dengan dukungan HTTP Range Request untuk audio/video seeking instan. |
| [`services/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/services/) | Klien HTTP API pihak ketiga: `gemini.ts`, `elevenlabs.ts`, `higgsfield.ts`, `llm.ts`, `audio.ts`. |

### C. Preload Bridge ([`src/preload/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/preload/))
| Berkas | Peran & Tanggung Jawab Utama |
| :--- | :--- |
| [`index.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/preload/index.ts) | Mengekspos objek `window.api` secara aman ke renderer via `contextBridge.exposeInMainWorld`. |
| [`index.d.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/preload/index.d.ts) | Deklarasi tipe TypeScript global untuk objek `window.api`. |

### D. Renderer Application ([`src/renderer/src/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/))
| Berkas / Direktori | Peran & Tanggung Jawab Utama |
| :--- | :--- |
| [`pages/project/IdeaStep.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/IdeaStep.tsx) | Langkah 1: Input sinopsis cerita, pemilihan target durasi, bahasa naskah, dan pemicu pembuatan naskah LLM. |
| [`pages/project/ScriptStep.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/ScriptStep.tsx) | Langkah 2: Editor naskah beradegan, penyesuaian teks narasi, reordering adegan, pemicu rencana visual. |
| [`pages/project/StoryboardStep.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/StoryboardStep.tsx) | Langkah 3: Grid visualisasi storyboard, pembuatan lembar karakter, generate gambar klip & video AI. |
| [`pages/project/EditorStep.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/EditorStep.tsx) | Langkah 4: Pusat kerja utama editor; memadukan Player, Timeline, dan Inspector ke satu layar kerja. |
| [`pages/project/editor/Player.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/editor/Player.tsx) | Viewport pratinjau real-time 16:9/9:16, simulasi transform CSS kamera, render caption subtitle DOM. |
| [`pages/project/editor/engine.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/editor/engine.ts) | State pemutaran audio/video: sinkronisasi elemen `<audio>`, penanganan playhead `requestAnimationFrame`. |
| [`pages/project/editor/Timeline.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/editor/Timeline.tsx) | Timeline magnetis multi-track: track klip, track kata caption, track audio narasi tertaut, track musik. |
| [`pages/project/editor/Inspector.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/editor/Inspector.tsx) | Panel inspektur sisi kanan: pengaturan gerak kamera klip, transisi, audio volume, dan regenerasi aset. |
| [`pages/project/ExportDialog.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/ExportDialog.tsx) | Dialog konfigurasi ekspor MP4: resolusi (1080p/720p), pemilihan folder tujuan, progress rendering. |
| [`store/project.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/store/project.ts) | Zustand store proyek: state klip, autosave debounce, seleksi aktif, history undo/redo. |

---

## 3. PETA ALUR PRODUKSI (PRODUCTION LIFECYCLE)

```
[LANGKAH 1: IDE]
    Sinopsis + Target Durasi + Bahasa
              │  generateScript (LLM)
              v
[LANGKAH 2: NASKAH]
    Adegan 1..N (Judul, Cerita, Narasi dengan Voice Tags)
              │  generateVisuals (LLM)
              v
[LANGKAH 3: STORYBOARD]
    1. Lembar Karakter Pemeran (Higgsfield Text-to-Image)
    2. Gambar Klip Adegan (Higgsfield Text-to-Image + Karakter sebagai Referensi)
    3. Video AI Opsional (Higgsfield Image-to-Video tanpa audio)
    4. Narasi Utuh Satu Take (Gemini TTS / ElevenLabs with-timestamps)
    5. Analisis Kata & Pemotongan Adegan (whisper.cpp lokal -nfa -dtw small + align.ts + cuts.ts)
              │
              v
[LANGKAH 4: EDITOR & TIMELINE]
    - Penataan Klip Magnetis, Pemotongan (Split 'S'), Penggeseran Rentang Suara Tertaut
    - Pemilihan Gerak Kamera Klip (Pan/Zoom/Static/Tilt) & Transisi (Dissolve/Wipe/Slide)
    - Pemilihan Gaya & Font Subtitle Caption (15 font kurasi)
    - Penambahan Trek Musik Latar & Sound Effect dengan Penyeimbang Desibel (dB)
              │
              v
[EKSPOR MP4 BROADCAST]
    FFmpeg Filter Graph:
    Input Video/Gambar -> Perspective Camera Filter -> xfade Transition Buffer ->
    libass Subtitle Renderer (Rounded Box Drawing) -> Audio Mixing (Narasi + Musik) -> MP4 H.264/AAC
```

---

## 4. BUKU BESAR FITUR & STATUS (FEATURE LEDGER)

| Modul / Fitur | Status | File Implementasi Utama | Catatan Kestabilan |
| :--- | :--- | :--- | :--- |
| **LLM Naskah & Visual** | STABLE | [`src/main/story.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/story.ts) | Mendukung Gemini, OpenRouter, Groq, custom OpenAI base URL. |
| **Higgsfield Image/Video** | STABLE | [`src/main/generation.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/generation.ts) | 48 model katalog, caching estimasi kredit 24 jam, retry backoff. |
| **TTS Narasi Utuh** | STABLE | [`src/main/narration.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/narration.ts) | Rekaman 1x utuh menjamin konsistensi timbre suara. |
| **Whisper DTW Alignment** | STABLE | [`src/main/whisper.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/whisper.ts) | whisper-cli.exe `-nfa -dtw small` tanpa prompt. Akurasi 0.1-0.2s. |
| **Timeline Non-Linear** | STABLE | [`src/renderer/src/pages/project/editor/Timeline.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/editor/Timeline.tsx) | Klip magnetis, snap playhead 8px, audio tertaut per klip. |
| **Player Pratinjau** | STABLE | [`src/renderer/src/pages/project/editor/Player.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/editor/Player.tsx) | Arsitektur 3-klip isolate, CSS camera transform, caption DOM. |
| **Mesin Ekspor FFmpeg** | STABLE | [`src/main/exporter.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/exporter.ts) | Perspective filter (bukan zoompan), safety frames xfade, libass ASS. |
| **Enkripsi Kunci DPAPI** | STABLE | [`src/main/secrets.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/secrets.ts) | Electron safeStorage terikat akun OS Windows. Tidak pernah dicetak ke log. |
| **Protokol `studio://`** | STABLE | [`src/main/protocol.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/protocol.ts) | HTTP Range 206 Partial Content untuk audio/video fast seeking. |
