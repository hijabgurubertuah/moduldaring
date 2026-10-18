/**
 * ATURAN BAKU DESAIN PERMANEN - MODUL BELAJAR DARING
 * SMP NEGERI 1 BENGKALIS
 * 
 * 1. PRINSIP UTAMA:
 *    - Minimalis, bersih, ringkas, dan jelas.
 *    - Tampil seperti produk jadi yang profesional, bukan prototipe.
 * 
 * 2. LARANGAN MUTLAK (ZERO INSTRUCTION TEXT):
 *    - DILARANG menampilkan satu pun teks petunjuk, penjelasan fungsi, atau keterangan teknis di seluruh antarmuka (termasuk halaman publik, formulir, dialog, dan dashboard admin).
 *    - DILARANG menyebut kata Google Drive, Apps Script, Firebase, Base64, atau mekanisme teknis lainnya di UI.
 *    - DILARANG teks format atau batas ukuran file ("Format didukung JPG...", "Maksimal 5MB"). Validasi dilakukan di kode; pesan kesalahan hanya muncul saat dilanggar.
 *    - DILARANG kalimat instruksi: "Isi kolom...", "Klik di sini...", "Fitur ini digunakan...", "Catatan:", "Tips:", "Perhatian:".
 *    - DILARANG teks kecil abu-abu di bawah tombol/kolom/kartu yang menjelaskan fungsinya.
 *    - DILARANG tooltip, balon petunjuk, tur, onboarding, banner cara pakai, badge "Baru"/"Demo", kata demo/simulasi/mock.
 *    - DILARANG paragraf pengantar di atas formulir atau tabel.
 * 
 * 3. HANYA TEKS BERIKUT YANG BOLEH TAMPIL:
 *    a. Konten asli aplikasi (isi materi, nama siswa, data nilai).
 *    b. Judul halaman dan judul bagian (satu frasa singkat).
 *    c. Label tombol dan menu (kata kerja singkat 1-3 kata: "Simpan", "Tambah Siswa", "Batal", "Hapus", "Mundur", "Lanjut", "Selesai").
 *    d. Label kolom isian (satu frasa singkat, tetap tampil di atas kolom, tanda * untuk wajib).
 *    e. Pesan kesalahan validasi (hanya saat terjadi kesalahan).
 *    f. Notifikasi singkat hasil aksi ("Berhasil disimpan", "Gagal mengunggah") dan lencana status koneksi singkat ("Offline").
 *    g. Judul singkat keadaan kosong ("Belum ada data", "Belum ada materi", "Belum ada nilai") tanpa kalimat penjelasan.
 * 
 * 4. ATURAN MOBILE (HP) PRIORITAS UTAMA:
 *    - Layar 360px - 430px harus rapi, proporsional, mudah dioperasikan dengan satu jari.
 *    - ATURAN PERMANEN HEADER: Header HP di Ruang Belajar Siswa DIHAPUS TOTAL. Header HP di Panel Admin tetap ada (hanya logo dan nama singkat tanpa tombol).
 *    - ATURAN PERMANEN TOMBOL SIDEBAR:
 *      * Tombol sidebar Panel Admin memakai IKON DASBOR (bukan hamburger). Hamburger hanya untuk sidebar materi (di tampilan siswa dan di layar Materi admin).
 *      * Di tampilan HP, sidebar dibuka dengan tombol pegangan di tepi kiri layar berukuran 25px x 120px, hampir transparan (rgba(15,118,110,0.12), blur ringan, opasitas garis/ikon ~50%, disentuh ~85%), area sentuh sama dengan ukuran tampil (25px x 120px). Tombol DIABAIKAN dalam penentuan tata letak (tidak ada jarak kiri tambahan pada isi).
 *    - ATURAN PERMANEN LAYAR MATERI PANEL ADMIN:
 *      * Layar Materi di Panel Admin menjadi tampilan penuh yang SAMA PERSIS dengan tampilan materi siswa, dengan DUA tombol sidebar di tampilan HP:
 *        1) Tombol sidebar Panel Admin (ikon dasbor di posisi upper) untuk membuka menu admin.
 *        2) Tombol sidebar Materi (ikon hamburger di posisi lower) untuk membuka daftar navigasi materi.
 *      * Menggantikan susunan editor lama (daftar tabel terpisah atau split form).
 *    - ATURAN PERMANEN KOLOM PILIHAN (DROPDOWN TANPA POPUP):
 *      * Semua kolom pilihan (dropdown) di seluruh aplikasi tidak lagi berupa popup, dialog, lembar bawah (bottom sheet), atau pilihan bawaan browser (select / datalist).
 *      * Daftar pilihan terbuka menempel langsung pada kolom yang diketuk, dengan arah buka cerdas (ke bawah bila cukup ruang, ke atas bila sempit).
 *      * Lebar daftar sama dengan lebar kolom, tinggi maksimal s/d 240px dengan scroll mandiri (overscroll contain) dan tinggi item 44px.
 *    - Jarak tepi kiri dan kanan kartu isi dan baris tab tipis: sekitar 8px di HP. Padding dalam kartu isi sekitar 14px.
 *    - TAB HALAMAN ANGKA: Tab halaman hanya berupa angka (1, 2, 3...) tanpa judul, rata tengah, tidak pernah digeser mendatar. Tab aktif lebih lebar (~1.6x) dan toska lebih terang.
 *    - JENIS HALAMAN: Materi (dengan Uji Pemahaman opsional di bawah, tanpa tombol), Game (HTML responsif terisolasi ~75% viewport), dan Kuis Akhir (CBT dengan tombol Mundur, Lanjut/Selesai, dan grid 6 kolom nomor soal).
 *    - PENILAIAN OTOMATIS: Nilai dihitung otomatis per materi dari Uji Pemahaman dan Kuis Akhir, lalu direkap otomatis ke spreadsheet tab "Rekap Nilai".
 */

export const DESIGN_RULES = {
  MIN_TOUCH_TARGET: 44,
  HEADER_HEIGHT_MOBILE: 60,
  HANDLE_WIDTH_MOBILE: 25,
  HANDLE_HEIGHT_MOBILE: 120,
  FONT_DISPLAY: "'Plus Jakarta Sans', sans-serif",
  FONT_BODY: "'Inter', sans-serif",
  THEME_COLORS: {
    PRIMARY: '#0F766E',
    SECONDARY: '#134E4A',
    ACCENT: '#2DD4BF',
    WARM: '#FBBF24',
    BG_START: '#042F2E',
    BG_MID: '#0B4F4A',
    BG_END: '#0F766E',
    TEXT_PRIMARY: '#ECFEFF',
    TEXT_SECONDARY: '#A5D8D3',
  },
  PREDICATE_COLORS: {
    A: '#34D399',
    B: '#2DD4BF',
    C: '#FBBF24',
    D: '#FB923C',
  },
  DEFAULT_LOGO_URL: 'https://i.ibb.co.com/nqfqhc29/kdu.png',
} as const;

export const STRICT_BANNER = '// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.';
