---
name: story-production-pipeline
description: >-
  Use this skill when developing, refactoring, or debugging the Audira Story AI generation pipeline: LLM scriptwriting, visual plan generation, character sheet creation, Higgsfield image and video generation, credit estimation, or model catalog management.
---

# Story Production & AI Generation Pipeline Runbook

Panduan tata kelola dan SOP operasional pipeline pembuatan cerita, naskah LLM, lembar karakter, aset gambar, dan animasi video Higgsfield pada [Audira Story](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/AGENTS.md).

---

## 1. Komponen & Berkas Terkait

- **Orkestrasi Naskah & Visual LLM**: [`src/main/story.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/story.ts)  
  Eksekusi prompt naskah (`generateScript`), pembuatan rencana visual beradegan (`generateVisuals`), dan prompt musik (`generateMusicPrompt`).
- **Pipeline Generasi Higgsfield**: [`src/main/generation.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/generation.ts)  
  Pembuatan lembar karakter (`characterSheet`), gambar klip (`clipImage`), animasi video AI (`clipVideo`), serta kalkulasi estimasi biaya kredit.
- **Klien Higgsfield HTTP**: [`src/main/services/higgsfield.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/services/higgsfield.ts)  
  Komunikasi API dengan `https://api.higgsfield.ai`, penanganan polling task, pengunggahan gambar referensi, dan caching estimasi biaya.
- **Katalog Model Higgsfield**: [`src/shared/higgsfield-catalog.json`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/higgsfield-catalog.json) & [`src/shared/higgsfield.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/higgsfield.ts)  
  Daftar 48 model terpilih (14 text-to-image dan 34 image-to-video), penentuan durasi klip (`fitDuration`), dan resolusi.
- **Pustaka Gaya Visual**: [`src/shared/styles.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/styles.ts)  
  Daftar preset gaya seni visual dengan prompt pendukung (Cinematic, Comic, Anime, 3D Render, Watercolor, Cyberpunk, dll).

---

## 2. Fitur Inti Arsitektur Pipeline

### A. Alur Pembuatan Naskah (`generateScript`)
1. **Perhitungan Jumlah Adegan (`clipCountFor`)**:
   - Berdasarkan kecepatan wicara standar manusia (~2,6 kata per detik atau ~5,5 detik per adegan).
   - Minimal 3 adegan untuk cerita berdurasi pendek.
2. **Keluaran Terstruktur (JSON Schema)**:
   - Wajib menghasilkan schema: `{ title: string, scenes: Array<{ title: string, story: string, narration: string }> }`.
   - Panjang narasi tiap adegan dijaga antara 10–18 kata untuk ritme video yang dinamis.
   - Mengizinkan penambahan Voice Tags ekspresif (`<short pause>`, `<long pause>`, `<chuckles>`, `<sigh>`, `<gasp>`, `<whispers>`).

### B. Alur Rencana Visual (`generateVisuals`)
Prompt sistem menerapkan aturan ketat untuk mencegah gambar melenceng:
1. **Dunia Cerita Mandiri (`world`)**: Setiap deskripsi visual adegan menyertakan setting dunia/era, karena model difusi gambar tidak membaca teks narasi.
2. **Karakter Tanpa Pakaian Tetap (`characters`)**: Lembar karakter mendefinisikan bentuk tubuh dan wajah polos (`identity`), sedangkan pakaian di adegan didefinisikan lewat array `wardrobe` (`source: 'reference'` atau `'custom'`).
3. **Format Prompt Berlabel**:
   - `Setting:` ...
   - `Action:` ...
   - `Wardrobe:` ...
   - `Framing:` ...
   - `Avoid:` Must not appear ...

### C. Konsistensi Karakter via Lembar Karakter (Character Sheet)
- Untuk model gambar yang mendukung gambar referensi (`maxRefs(model) > 0`), lembar karakter di-generate lebih dulu.
- Lembar karakter menampilkan karakter tampak depan, samping, dan 3/4 dengan latar studio polos.
- Berkas lembar karakter diunggah ke Higgsfield dan ID-nya disertakan sebagai `reference_image` saat men-generate gambar adegan.

### D. Animasi Video AI (`clipVideo`)
- Gambar klip adegan dikirim sebagai input frame pertama ke model image-to-video.
- Prompt video selalu ditambahkan akhiran `NO_MUSIC` ("Silent clip: no background music...") dan parameter suara dimatikan (`sound: off`, `generate_audio: false`) agar trek audio tidak bertabrakan dengan narasi suara.
- Durasi video dipilih otomatis yang paling mendekati dan menutup durasi suara klip (`fitDuration`).

---

## 3. Standard Operating Procedures (SOP)

### A. Pengujian Pipeline Tanpa Memakai Kredit Nyata
Gunakan mock server Higgsfield saat mode pengembangan:
```powershell
$env:STUDIO_HF_BASE = "http://localhost:8080/mock-higgsfield"
npm run dev
```

### B. Menambah Model Baru ke Katalog Higgsfield
1. Buka [`src/shared/higgsfield-catalog.json`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/higgsfield-catalog.json).
2. Daftarkan entri model baru dengan menyertakan:
   - `id`: identifier resmi endpoint Higgsfield.
   - `name`: nama tampilan model di antarmuka.
   - `type`: `'image'` atau `'video'`.
   - `resolutions`: array resolusi yang didukung (misal: `["1080p", "720p"]`).
   - `durations`: array durasi detik (untuk video).
   - `supportsReference`: boolean apakah menerima gambar referensi.
3. Jalankan `npm run typecheck` untuk memvalidasi skema katalog.

### C. Penanganan Error & Cache Biaya Kredit
- Biaya kredit diambil dari endpoint gratis `/estimate/<endpoint>` dan dicache selama 24 jam di tabel `cache` SQLite.
- Jika pengguna memperbarui kunci API Higgsfield di Pengaturan, panggil `forgetEstimates()` untuk mengosongkan cache lama.
