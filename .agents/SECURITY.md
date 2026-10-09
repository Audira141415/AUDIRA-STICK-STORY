# SECURITY — AUDIRA STORY (AUDIRA-STICK-STORY)

> Protokol Keamanan, Perlindungan Rahasia Kunci API (BYOK), dan Pengerasan Proses Electron.  
> **Pencipta & Pemegang HAKI:** AUDIRA (Agus Dwi R) | Hak Cipta Dilindungi Undang-Undang.  
> **Versi:** v1.0.0  
> **Terakhir Diperbarui:** 2026-10-09  

---

## 1. Arsitektur Keamanan & Model Ancaman (Threat Model)

Audira Story mengintegrasikan komputasi desktop lokal (SQLite, FFmpeg, whisper.cpp) dengan berbagai API kecerdasan buatan cloud publik (Google Gemini, ElevenLabs, Higgsfield, OpenAI-compatible). Keamanan dibangun berdasarkan prinsip **Pertahanan Berlapis (Defense-in-Depth)** untuk melindungi integritas sistem operasi pengguna, isolasi proses browser, dan kerahasiaan kunci API pihak ketiga.

### Status Kesiagaan Keamanan (DEFCON Levels)
- **DEFCON 5 (Operasi Normal):** Komunikasi IPC normal, kunci API terenkripsi DPAPI, render FFmpeg dan pemrosesan Whisper berjalan stabil.
- **DEFCON 4 (Peringatan Kuota / Jaringan):** Kegagalan request API luar karena token habis atau koneksi terputus; pesan error disanitasi tanpa membocorkan kredensial.
- **DEFCON 3 (Anomali Sistem File / DB):** Kesalahan migrasi SQLite atau kegagalan unduhan model Whisper; penanganan kegagalan otomatis melalui rollback transaksi.
- **DEFCON 2 (Eror Eksekusi Biner / Subproses):** Kegagalan kritis pada FFmpeg atau whisper-cli; proses dihentikan secara bersih, berkas sementara di folder `tmp/` langsung dibersihkan.
- **DEFCON 1 (Pelanggaran Isolasi Proses):** Upaya eksekusi skrip berbahaya di renderer atau kebocoran kunci API; proses segera dihentikan.

---

## 2. Pengerasan Proses Electron (Electron Process Hardening)

Jendela utama aplikasi (`src/main/index.ts`) dikonfigurasi dengan standar isolasi ketat:

```typescript
const mainWindow = new BrowserWindow({
  webPreferences: {
    sandbox: true,              // Mengisolasi renderer dalam sandbox Chromium
    contextIsolation: true,     // Memisahkan konteks JavaScript renderer dan preload
    nodeIntegration: false,    // Mencegah akses modul Node.js langsung dari renderer
    webSecurity: true          // Mengaktifkan kebijakan SOP (Same-Origin Policy)
  }
})
```

### Jembatan Preload yang Aman (`src/preload/index.ts`)
- Renderer **tidak memiliki akses langsung** ke sistem file, jaringan soket mentah, atau perintah sistem operasi.
- Seluruh interaksi melewati `contextBridge.exposeInMainWorld('api', ...)` dengan kontrak tipe yang didefinisikan secara eksplisit di [`src/shared/api.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/shared/api.ts).
- Renderer tidak pernah memegang atau mengelola kunci API eksternal.

### Pembatasan Navigasi Eksternal
- Navigasi link eksternal (`app:openExternal`) secara ketat dibatasi hanya untuk protokol HTTPS yang valid:
  ```typescript
  if (!url.startsWith('https://')) {
    throw new Error('Hanya URL https yang diizinkan dibuka.')
  }
  await shell.openExternal(url)
  ```

---

## 3. Manajemen Rahasia Kunci API (BYOK & DPAPI Encryption)

Audira Story mengusung model **Bring Your Own Key (BYOK)** di mana pengguna memasukkan kunci API mereka sendiri. Perlindungan kunci dikelola di [`src/main/secrets.ts`](file:///f:/05-Creative-Media-Studio/AUDIRA-STICK-STORY/src/main/secrets.ts):

1. **Enkripsi Kriptografis Tingkat OS (DPAPI):**
   - Kunci API dienkripsi menggunakan Electron `safeStorage.encryptString()`.
   - Di sistem operasi Windows, enkripsi ini memanfaatkan **DPAPI (Data Protection API)** yang terikat langsung dengan akun login Windows pengguna. Salinan database `studio.db` yang dipindahkan ke komputer lain tidak akan dapat mendekripsi kunci tersebut.
2. **Inisialisasi Awal (`warmUpEncryption`):**
   - Kunci kripto dipersiapkan saat startup aplikasi untuk mencegah korupsi data jika pengguna menutup paksa aplikasi segera setelah menyimpan kunci pertama.
3. **Kebijakan Nol-Kebocoran (Zero-Leak Policy):**
   - Kunci API **DILARANG KERAS** dicetak ke terminal konsol, file log (`STUDIO_LOG`), pesan kesalahan error toast, atau parameter URL.
   - Fungsi `revealKey` hanya dapat dipanggil oleh aksi klik sadar tombol "Tampilkan Kunci" di antarmuka Pengaturan.

---

## 4. Keamanan Protokol Kustom `studio://` (`src/main/protocol.ts`)

Protokol kustom `studio://` menggantikan protokol `file://` untuk menyajikan aset media dan font ke renderer:

- **Pencegahan Path Traversal:**
  - Protokol memvalidasi path relatif dan memastikan bahwa file yang diminta berada secara sah di dalam direktori proyek (`projects/<id>/`) atau direktori font resmi (`resources/fonts/`).
  - Permintaan yang mengandung karakter traversal berbahaya (seperti `..` atau backslash tersembunyi) secara otomatis ditolak dengan status HTTP 403 / 404.
- **Dukungan Streaming Aman (HTTP Range 206):**
  - Mengimplementasikan penanganan header `Range` untuk seeking video dan audio tanpa mengekspos pointer sistem berkas sistemik ke proses renderer.

---

## 5. Keamanan Eksekusi Biner & Database SQLite

1. **Eksekusi FFmpeg & Whisper yang Aman:**
   - Parameter baris perintah untuk FFmpeg (`exporter.ts`) dan whisper-cli (`whisper.ts`) selalu dilewatkan dalam bentuk **array argumen terstruktur**, bukan string shell yang rentan terhadap *shell injection*.
   - Jalur berkas sementara dikarantina di subfolder `%APPDATA%\Audira Story\tmp\` dan selalu dihapus setelah proses selesai.
2. **Kueri Parameter SQLite Terproteksi (`repo.ts`):**
   - Semua operasi database menggunakan pustaka `better-sqlite3` dengan *parameterized statements* (`db.prepare('... WHERE id = ?').run(id)`).
   - Dilarang keras melakukan konkatenasi string secara mentah ke dalam kueri SQL guna mengeliminasi celah *SQL Injection*.
