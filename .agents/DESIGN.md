# DESIGN — AUDIRA STORY (AUDIRA-STICK-STORY)

> Design System & Panduan Visual UI/UX Desktop Studio Cerita AI (Paper & Ink Aesthetic).  
> **Pencipta & Pemegang HAKI:** AUDIRA (Agus Dwi R) | Hak Cipta Dilindungi Undang-Undang.  
> **Versi:** v1.0.0  
> **Terakhir Diperbarui:** 2026-10-09  

---

## 1. Filosofi Desain (Design Philosophy)

Antarmuka Audira Story mengusung filosofi **"Paper & Ink (Kertas & Tinta)"**. Berbeda dengan tema gelap futuristik atau nuansa neon generik, Audira Story mengadopsi nuansa hangat, terstruktur, dan taktil seperti lembaran naskah cetak, papan storyboard studio animasi klasik, dan sketsa ilustrator.

- **Taktil & Hangat:** Latar bernuansa kertas lembut (`paper` dan `sand`) berpadu dengan ketegasan tinta (`ink` dan `ink-2`), memberikan kenyamanan mata saat proses kreatif berdurasi panjang.
- **Kerapian Editorial:** Tipografi display yang ekspresif untuk judul dan narasi, dikombinasikan dengan font antarmuka modern yang bersih untuk tombol dan kontrol timeline.
- **Minim Distraksi & Fokus Kreasi:** Elemen interaktif merespons tindakan dengan aksen terarah (`accent` oranye kemerahan dan `sun` kuning cerah) untuk menandai fokus pengguna tanpa membebani visual.

---

## 2. Sistem Warna & Desain Token (Color System & Tokens)

Sistem warna didefinisikan menggunakan fitur `@theme` Tailwind CSS v4 di [`src/renderer/src/styles.css`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/styles.css):

```css
@theme {
  /* Latar Belakang & Permukaan Kertas (Surfaces) */
  --color-paper: #faf7f2;       /* Latar utama jendela aplikasi */
  --color-surface: #ffffff;     /* Kartu konten, modal, dropdown */
  --color-sand: #f3efe8;        /* Isian form, timeline track latar, tab nonaktif */
  --color-sand-hover: #ebe5db;  /* Keadaan hover pada kartu sand */

  /* Tinta & Keterbacaan Teks (Inks) */
  --color-ink: #1f1d1a;         /* Teks utama, judul, ikon kontras tinggi */
  --color-ink-2: #57524a;       /* Teks sekunder, label formulir */
  --color-muted: #6b665e;       /* Teks petunjuk, keterangan tambahan */
  --color-dim: #9c9488;         /* Teks redup, placeholder input */

  /* Garis Pemisah & Bingkai (Lines) */
  --color-line: #e6dfd5;        /* Border standar kartu dan kontainer */
  --color-line-2: #d8cfc2;       /* Border pemisah kolom dan track timeline */
  --color-line-3: #c5b9a8;       /* Border fokus dan keadaan hover */

  /* Aksen Utama & Sorotan Brand (Accents) */
  --color-accent: #c93a1b;      /* Tombol aksi utama (CTA), indikator playhead */
  --color-accent-dark: #a82e14; /* Hover tombol utama */
  --color-accent-soft: #fbeee9; /* Latar badge terpilih, highlight halus */

  /* Sorotan Matahari & Seleksi Aktif (Sun Highlights) */
  --color-sun: #ffc93c;         /* Sorotan kata caption aktif, lencana premium */
  --color-sun-soft: #fff6db;    /* Latar belakang kartu klip/item yang sedang terpilih */
  --color-sun-ink: #4a3800;     /* Teks kontras di atas latar sun */

  /* Indikator Status Semantik */
  --color-ok: #15803d;          --color-ok-soft: #dcfce7;
  --color-bad: #b91c1c;         --color-bad-soft: #fee2e2;
  --color-info: #1d4ed8;        --color-info-soft: #dbeafe;
}
```

### Bayangan Taktil (Tactile Ink Shadows)
- `shadow-ink`: Bayangan halus seperti stempel tinta fisik di atas kertas (`0 1px 2px rgba(31, 29, 26, 0.06), 0 1px 3px rgba(31, 29, 26, 0.1)`).
- `shadow-ink-lg`: Bayangan mengambang untuk modal dialog dan menu popover.

---

## 3. Tipografi Antarmuka (Typography)

1. **Font Teks & Antarmuka Utama (`font-sans`):** `Plus Jakarta Sans`
   - Digunakan untuk label form, tombol navigasi, teks naskah, dan deskripsi panel.
2. **Font Judul & Tampilan Karakter (`font-display`):** `Bricolage Grotesque`
   - Digunakan untuk heading utama langkah wizard, judul cerita, dan kartu pengenalan.
3. **Font Metrik, Durasi & Angka (`font-mono`):** `JetBrains Mono`
   - Digunakan untuk penanda waktu timecode (`00:01:24.5`), indikator frame, volume desibel (dB), dan biaya kredit.

### Tipografi Subtitle Caption Video
Koleksi 15 font berkualitas tinggi di [`resources/fonts/`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/resources/fonts/) yang dihitung metriknya di [`src/shared/captions.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/captions.ts):
- *Display / Punchy:* `Bangers`, `Permanent Marker`, `Luckiest Guy`, `Titan One`, `Boogaloo`.
- *Bold / Modern Sans:* `Poppins-Bold`, `Poppins-ExtraBold`, `Anton`, `Archivo Black`, `Bebas Neue`.
- *Playful / Storytelling:* `Chewy`, `Comic Neue`, `Bubblegum Sans`, `Sniglet`, `Lilita One`, `DM Serif Display`.

---

## 4. Komponen Modular yang Dipakai Ulang (Reusable UI Components)

Semua komponen antarmuka dirancang khusus untuk memastikan konsistensi visual:

| Komponen | Berkas | Deskripsi & Peran |
| :--- | :--- | :--- |
| `Button`, `IconButton` | [`src/renderer/src/components/ui.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/components/ui.tsx) | Tombol aksi primer, sekunder, dan ikon dengan tactile press state. |
| `Select` | [`src/renderer/src/components/Select.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/components/Select.tsx) | Menu dropdown kustom dengan pencarian teks, grup item, dan ikon penyedia. |
| `Popover` | [`src/renderer/src/components/Popover.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/components/Popover.tsx) | Panel melayang di portal dengan pencegah kebocoran klik latar belakang. |
| `ModelPicker` | [`src/renderer/src/components/ModelPicker.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/components/ModelPicker.tsx) | Pemilih model AI lengkap dengan lencana penyedia dan estimasi biaya per detik. |
| `StylePicker` | [`src/renderer/src/components/StylePicker.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/components/StylePicker.tsx) | Grid kartu thumbnail 1:1 untuk pemilihan gaya seni visual adegan. |
| `AutoTextarea` | [`src/renderer/src/components/AutoTextarea.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/components/AutoTextarea.tsx) | Kolom input naskah yang memanjang otomatis mengikuti volume baris teks. |
| `Waveform` | [`src/renderer/src/pages/project/editor/Waveform.tsx`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/pages/project/editor/Waveform.tsx) | Visualisasi gelombang audio narasi dan musik di atas track timeline. |

---

## 5. Aturan Baku Pengalaman Pengguna (Mandatory UX Rules)

1. **Dilarang Menggunakan `<select>` Bawaan Browser**:
   - Selalu gunakan komponen [`Select`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/components/Select.tsx) atau [`Popover`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/renderer/src/components/Popover.tsx) agar tampilan, pencarian, dan interaksi seragam di semua platform.
2. **Pilihan Gaya Seni Visual Wajib Grid Thumbnail 1:1**:
   - Pemilihan gaya visual tidak boleh berupa daftar teks polos. Wajib disajikan dalam grid gambar persegi 1:1 berfokus karakter menghadap kamera.
3. **Formulir Tunggal Terfokus**:
   - Pada panel pengaturan layanan (LLM / TTS), tampilkan hanya satu formulir konfigurasi untuk penyedia yang sedang aktif guna mencegah kekacauan visual.
4. **Penanda Seleksi Menggunakan Latar Belakang (`bg-sun-soft`)**:
   - Item atau klip yang sedang aktif ditandai dengan perubahan warna latar belakang kartu dan border aksen, bukan menggunakan kotak centang (checkbox).
5. **Bahasa Antarmuka Bersahabat**:
   - Seluruh teks yang tampil di layar wajib menggunakan Bahasa Indonesia santai dengan sapaan "kamu" (contoh: *"Kredit Higgsfield kamu tidak mencukupi"*).
   - Format penulisan angka desimal di antarmuka menggunakan koma (contoh: `3,5 dtk`).
