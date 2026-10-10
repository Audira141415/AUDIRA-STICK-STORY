# AUDIRA Brain Directory — Episodic & Specialized Knowledge Store

> **Sub-sistem Penyimpanan Memori Episodik & Catatan Khusus AI Agent**  
> **Bagian dari:** [`.agents/BRAIN.md`](file:///f:/AUDIRA-STICK-STORY/.agents/BRAIN.md) dan [`.agents/MEMORY.md`](file:///f:/AUDIRA-STICK-STORY/.agents/MEMORY.md)  
> **Pemilik:** AUDIRA (Agus Dwi R)

---

## Tujuan Direktori `brain/`

Direktori `.agents/brain/` ini digunakan untuk menyimpan catatan kognitif episodik, catatan keputusan mendalam (deep ADR), log insiden terperinci, dan data kontekstual yang terlalu panjang bila dimasukkan seluruhnya ke dalam `BRAIN.md` utama.

Dengan membagi pengetahuan ke dalam berkas-berkas modular di bawah `brain/`:
1. `BRAIN.md` di level root `.agents/` tetap ringkas, bersih, dan cepat dibaca saat sesi dimulai.
2. Pengetahuan mendalam per sub-topik dapat diakses sesuai kebutuhan (*on-demand retrieval*).
3. Setiap proyek AUDIRA memiliki wadah terstandarisasi untuk menyimpan jejak kognitif.

---

## Struktur Berkas di Direktori Ini

```
.agents/brain/
├── README.md           # [Dokumen ini] Penjelasan struktur dan panduan penggunaan
├── incident_log.md     # Log detail penanganan bug masa lalu dan resolusi definitif
└── architecture_adr.md # Catatan keputusan arsitektural spesifik (misal: FFmpeg, Whisper, IPC)
```

---

## Aturan Penggunaan untuk AI Agent

1. **Ketika Menemukan Bug Kritis yang Baru Diperbaiki:**
   - Catat tanggal, deskripsi error, akar masalah (*root cause*), dan solusi di `incident_log.md`.
2. **Ketika Mengubah Keputusan Arsitektural:**
   - Tambahkan entri baru di `architecture_adr.md` dengan menyertakan alasan penolakan alternatif lain.
3. **Patuhi Batas Minimal Blast Radius:**
   - Jangan menulis file temporer atau file sampah di folder ini.
