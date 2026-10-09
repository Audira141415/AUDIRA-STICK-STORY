# PRD — AUDIRA STORY (AUDIRA-STICK-STORY)

> Product Requirements Document: Studio Produksi Video Cerita YouTube Berbasis AI (Desktop Electron + React + FFmpeg).  
> **Pencipta & Pemegang HAKI:** AUDIRA (Agus Dwi R) | Hak Cipta Dilindungi Undang-Undang.  
> **Versi:** v1.0.0  
> **Terakhir Diperbarui:** 2026-10-09  
> **Status:** Active / Production Ready  

---

## 1. Ringkasan Eksekutif (Executive Summary)

**Audira Story** adalah aplikasi desktop modern yang memungkinkan kreator konten mengubah konsep cerita mentah menjadi video YouTube dan media sosial berstandar siar secara otomatis dan terorkestrasi. Aplikasi memadukan kemampuan model bahasa besar (LLM) untuk penulisan naskah dramatik dan arahan adegan, model generatif gambar dan video Higgsfield untuk visualisasi konsisten berbasis lembar karakter, model Text-to-Speech terdepan (Gemini & ElevenLabs) untuk narasi yang hidup, model pengenal suara lokal whisper.cpp untuk sinkronisasi caption berakurasi sub-detik, serta timeline non-linear magnetis dengan mesin render video FFmpeg broadcast.

- **Visi Produk:** Menghadirkan studio produksi video AI terpadu di mana kreator tunggal dapat memproduksi animasi cerita YouTube berdurasi penuh dari nol hingga ekspor MP4 beresolusi tinggi tanpa harus berpindah-pindah antar aplikasi terpisah.
- **Tujuan Utama Produk:**
  1. Mengeliminasi inkonsistensi visual karakter melalui pembuatan lembar karakter (character sheet) otomatis sebagai referensi visual gambar adegan.
  2. Menjamin narasi vokal yang alami dan seragam melalui alur rekaman utuh satu kali (*single-take narration*) yang dipotong presisi di jeda alami antar kata.
  3. Memastikan apa yang terlihat di editor pratinjau 100% sama dengan hasil render MP4 final (*Pratinjau = Ekspor*).
  4. Menjamin kedaulatan data dan privasi pengguna dengan model Bring Your Own Key (BYOK) yang terenkripsi aman secara lokal di perangkat pengguna.

---

## 2. Target Pengguna & Persona (Target Personas)

1. **Kreator Cerita YouTube Solo (Persona: Budi — Storyteller)**
   - *Kebutuhan:* Memproduksi video cerita fiksi, fabel, atau horor untuk YouTube dengan alur cepat, narasi memikat, visual dinamis, dan subtitle bergaya TikTok/YouTube Shorts tanpa keahlian animasi 3D manual yang rumit.
2. **Operator Saluran YouTube Tanpa Wajah (Persona: Rian — Faceless Channel Manager)**
   - *Kebutuhan:* Efisiensi alur produksi massal, estimasi biaya kredit AI sebelum eksekusi pembuatan video, kemampuan menduplikasi proyek dengan cepat, dan ekspor resolusi 1080p/720p yang stabil.
3. **Pendidik & Kreator Konten Edukasi (Persona: Sarah — Educational Content Creator)**
   - *Kebutuhan:* Naskah yang terstruktur rapi per adegan, subtitle dengan kata yang tersorot saat diucapkan (*word-level highlight*), serta penempatan logo kanal dan teks overlay yang mudah diatur.

---

## 3. Spesifikasi Fitur Produk (Feature Specifications)

### 3.1 Alur Produksi 4 Langkah Terpandu (4-Step Guided Wizard)

#### Langkah 1: Eksplorasi Ide (`IdeaStep`)
- **Masukan Pengguna:** Sinopsis ide cerita, pemilihan target durasi (30 detik s/d 5+ menit), dan pilihan bahasa narasi (Bahasa Indonesia, Inggris, dll).
- **Kalkulasi Cerdas:** Sistem secara otomatis menghitung jumlah adegan ideal (`clipCountFor`) berdasarkan kecepatan wicara standar (~2,6 kata per detik atau ~5,5 detik per adegan).
- **Eksekusi LLM:** Menghasilkan struktur cerita beradegan yang terdiri dari judul proyek, judul adegan, narasi, dan ringkasan cerita.

#### Langkah 2: Pemurnian Naskah (`ScriptStep`)
- **Editor Naskah:** Kreator dapat mengubah teks adegan, memodifikasi narasi, menambah atau menghapus klip, serta mengatur ulang urutan adegan.
- **Dukungan Voice Tags:** Tag wicara standar (`<short pause>`, `<long pause>`, `<chuckles>`, `<sigh>`, `<gasp>`, `<whispers>`) untuk mengarahkan intonasi narator TTS.
- **Perencanaan Visual Otomatis (`generateVisuals`):** LLM menyusun dunia cerita (`world`), profil fisik karakter tanpa pakaian bawaan (`identity`), pakaian default (`outfit`), dan prompt adegan berlabel (`Setting`, `Action`, `Wardrobe`, `Framing`, `Avoid`).

#### Langkah 3: Storyboard & Produksi Aset AI (`StoryboardStep`)
- **Lembar Karakter Otomatis (`characterSheet`):** Menghasilkan gambar karakter tampak depan, samping, dan 3/4 dengan latar polos untuk model yang mendukung gambar referensi.
- **Pembuatan Gambar Klip:** Menghasilkan gambar adegan beresolusi tinggi dengan menyertakan lembar karakter sebagai referensi agar penampilan tokoh tetap konsisten antar adegan.
- **Animasi Video AI Opsional:** Menganimasikan gambar klip menggunakan model image-to-video Higgsfield terpilih dengan parameter tanpa audio bawaan (`NO_MUSIC`).
- **Sintesis Narasi Utuh & Whisper Sync:** Menghasilkan audio satu rekaman utuh via Gemini TTS atau ElevenLabs, kemudian menjalankan whisper.cpp lokal untuk menyelaraskan waktu tiap kata dan membagi file audio per adegan tanpa memotong kata.

#### Langkah 4: Editor Timeline & Finishing (`EditorStep`)
- **Timeline Non-Linear Magnetis:** Track klip yang menempel tanpa celah, penyesuaian durasi klip, snapping 8px pada sambungan dan playhead.
- **Audio Klip Tertaut:** Audio narasi terikat pada klip masing-masing, dapat digeser titik mulainya (`voiceStartMs`), serta dipotong awal (`voiceInMs`) dan akhirnya (`voiceOutMs`).
- **Pemisahan Klip (Split Clip `S` / `Ctrl+B`):** Membelah klip di posisi playhead tepat pada jeda antar kata, menduplikasi media visual, dan membagi naskah narasi.
- **Pratinjau Multi-Klip:** Pipeline pratinjau 3-klip tanpa jeda frame atau kedipan hitam, pemutaran suara narasi tersinkronisasi, dan background music mixing.
- **Gerak Kamera & Transisi:** Pilihan gerak kamera (Static, Pan Left/Right, Zoom In/Out, Tilt Up/Down) dan transisi antar adegan (Cut, Dissolve, Wipe, Slide).
- **Tipografi Subtitle Caption:** 15 pilihan font profesional, gaya kotak rounded bersudut halus, sorotan kata aktif, dan pemenggalan baris otomatis yang identik dengan hasil ekspor.
- **Trek Musik & Overlay:** Dukungan musik latar dengan kontrol volume (dB), serta teks/logo overlay dengan penempatan jangkar 9-arah.

---

## 4. Ekspor Video Siar (Broadcast Video Exporter)

- **Mesin Ekspor:** FFmpeg dengan library static bawaan (`ffmpeg-static`) dan subsistem subtitle `libass`.
- **Kualitas Output:** Format MP4 (H.264 video codec, AAC audio codec, 30 FPS, resolusi 1080p Full HD atau 720p HD).
- **Penyelarasan Efek Visual:** Filter `perspective` pecahan piksel untuk gerak kamera mulus, buffer frame pengaman transisi `xfade`, dan gambar kotak rounded ASS berpresisi metrik TTF.
- **Pemrosesan Audio Terpadu:** Penggabungan jalur audio narasi per klip, musik latar yang disesuaikan durasinya, dan normalisasi desibel suara.

---

## 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

1. **Privasi & Keamanan (BYOK):** Kunci API pengguna dienkripsi dengan aman di disk lokal menggunakan DPAPI Windows dan tidak pernah dikirim ke pihak selain penyedia API yang bersangkutan.
2. **Kemandirian Lokal (Offline Capabilities):** Editor timeline, pengenal suara Whisper lokal, database SQLite, dan mesin ekspor FFmpeg dapat beroperasi penuh tanpa koneksi internet setelah aset visual/audio terunduh.
3. **Integritas "Pratinjau = Ekspor":** Modul bersama di `src/shared/` mengeliminasi deviasi antara apa yang ditinjau di layar editor dengan video MP4 hasil ekspor.
4. **Stabilitas Render:** Toleransi konkurensi job latar belakang terkendali untuk mencegah kehabisan VRAM atau memori sistem saat mengekspor proyek panjang.
