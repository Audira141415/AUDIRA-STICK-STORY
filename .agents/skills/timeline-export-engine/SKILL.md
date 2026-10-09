---
name: timeline-export-engine
description: >-
  Use this skill when developing, refactoring, or debugging the Audira Story non-linear Timeline editor, 3-clip isolate Player preview, camera motion transforms, transitions, or the FFmpeg broadcast MP4 exporter while strictly adhering to the Pratinjau = Ekspor principle.
---

# Timeline Editor & Broadcast FFmpeg Export Runbook

Panduan tata kelola dan SOP operasional model timeline magnetis, engine pratinjau Player 3-klip, kalkulasi gerak kamera, transisi, dan ekspor video MP4 berbasis FFmpeg pada [Audira Story](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/AGENTS.md).

---

## 1. Prinsip Mutlak: Pratinjau = Ekspor (Preview Equals Export)

> [!IMPORTANT]
> **HUKUM UTAMA EDITOR & EKSPOR:**
> Apa yang dilihat dan didengar di pratinjau Player **WAJIB 100% IDENTIK** dengan berkas MP4 hasil render FFmpeg.
> Seluruh aturan kalkulasi gerak kamera, transisi, durasi, rentang audio, dan caption wajib berada di [`src/shared/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/) dan tidak boleh dihitung ulang secara terpisah di satu sisi saja.

### Modul Bersama Inti:
- **[`src/shared/motion.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/motion.ts)**: Kalkulasi transformasi kamera 2D/3D (`cameraAt`, `cameraCss`, `cameraPerspective`), orientasi gerak, dan durasi transisi.
- **[`src/shared/timeline.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/timeline.ts)**: Penentuan rentang suara klip (`voiceSpan`), kata caption per klip (`clipCaptionWords`), rentang musik (`musicSpan`), dan pembagian suara saat klip dipotong (`splitNarration`).
- **[`src/shared/captions.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/captions.ts)**: Pemenggalan baris kata (`layoutCaptionLines`), metrik `cell` font TTF, dan penggambaran kotak rounded ASS.

---

## 2. Arsitektur Pratinjau Player (`Player.tsx` & `engine.ts`)

1. **Pipeline 3-Klip Terisolasi (3-Clip Isolate Engine)**:
   - Klip sebelum (*prev*), saat ini (*current*), dan berikutnya (*next*) selalu terpasang di DOM dalam wadah isolasi CSS.
   - Klip berikutnya dimuat dan menunggu tersembunyi tepat di titik mulainya (`mediaInMs`), sehingga pergantian klip tidak memerlukan pembuatan elemen `<video>` baru (yang dapat memicu kedipan hitam atau frame flash).
2. **Mitigasi Jitter DirectComposition di Windows**:
   - Di sistem operasi Windows, browser Chromium terkadang mengalihkan video ke overlay hardware yang membulatkan posisi ke piksel bulat utuh, menyebabkan gemetar pada gerak lambat.
   - Solusi: Seluruh video yang memiliki gerak kamera diberi opasitas `0.999` dan dijalankan dengan switch Chromium `disable-direct-composition-video-overlays` di `src/main/index.ts`.
3. **Sinkronisasi Audio & Audition Mode**:
   - `usePlaybackEngine` menyinkronkan pemutaran elemen `<audio>` narasi per klip dan musik latar dengan jam playhead `requestAnimationFrame`.
   - Fitur *Audition* memungkinkan pengguna menguji gerak kamera atau transisi baru di pratinjau tanpa menggeser playhead utama dan tanpa menyalakan suara.

---

## 3. Arsitektur Mesin Ekspor FFmpeg (`src/main/exporter.ts`)

1. **Filter `perspective` vs `zoompan`**:
   - *Jangan gunakan `zoompan`*: Filter `zoompan` membulatkan koordinat crop ke integer piksel setiap frame, menghasilkan getaran kasar (0.6–0.7 px) pada kamera lambat.
   - Gunakan filter `perspective` (sense=source, interpolation=cubic) yang menghitung pecahan sub-piksel (getaran hanya 0.02–0.16 px).
2. **Buffer Frame Pengaman Transisi `xfade`**:
   - Transisi `xfade` akan menghentikan seluruh video jika klip pertama selesai sebelum durasi offset transisi tercapai.
   - Fungsi `planSegments()` membulatkan titik mulai klip ke frame utuh dan menambahkan **2 frame pengaman** untuk menjamin kestabilan stream FFmpeg.
3. **Subtitle ASS Berkotak Rounded**:
   - Subtitle digambar menggunakan format ASS (*Advanced SubStation Alpha*) yang dimuxing oleh `libass`.
   - Kotak rounded digambar secara prosedural di layer bawah teks, dengan lebar yang dihitung presisi dari metrik font TTF asli (`fontMetrics.ts`).

---

## 4. Standard Operating Procedures (SOP)

### A. Menambahkan Jenis Transisi Baru
1. Daftarkan tipe transisi baru pada enum `TransitionType` di [`src/shared/types.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/types.ts).
2. Tambahkan implementasi gaya CSS di [`src/renderer/src/pages/project/editor/transitionStyle.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/editor/transitionStyle.ts).
3. Tambahkan pemetaan filter `xfade` terkait di [`src/main/exporter.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/exporter.ts).
4. Pastikan durasi transisi ditangani secara konsisten oleh `transitionSecOf` di [`src/shared/motion.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/motion.ts).

### B. Memodifikasi Perilaku Pemotongan Klip (Split Clip `S`)
1. Logika pemotongan file suara dan naskah narasi wajib melewati fungsi `splitNarration()` di [`src/shared/timeline.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/timeline.ts).
2. Handler proses utama di [`src/main/editing.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/editing.ts) menangani pemotongan file fisik WAV di disk tanpa merusak file suara master.
3. Titik potong wajib diselaraskan dengan jeda antar kata terdekat agar tidak memotong vokal narator.

### C. Verifikasi Keselarasan Durasi Hasil Ekspor
Setelah merender video MP4:
```powershell
ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 output.mp4
ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 output.mp4
```
Pastikan selisih durasi antara aliran video dan audio tidak melebihi 1 frame (~33ms pada 30 FPS).
