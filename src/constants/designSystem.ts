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
 *    c. Label tombol dan menu (kata kerja singkat 1-3 kata: "Simpan", "Tambah Siswa", "Batal", "Hapus").
 *    d. Label kolom isian (satu frasa singkat, tetap tampil di atas kolom, tanda * untuk wajib).
 *    e. Pesan kesalahan validasi (hanya saat terjadi kesalahan).
 *    f. Notifikasi singkat hasil aksi ("Berhasil disimpan", "Gagal mengunggah") dan lencana status koneksi singkat ("Offline").
 *    g. Judul singkat keadaan kosong ("Belum ada data", "Belum ada materi", "Belum ada nilai") tanpa kalimat penjelasan.
 * 
 * 4. ATURAN INPUT & GAMBAR:
 *    - Placeholder input dikosongkan atau hanya contoh isi murni (bukan instruksi).
 *    - Setiap kolom gambar selalu punya tombol "Hapus Gambar" berikon tempat sampah di samping pratinjau.
 *    - Logo, banner, dan gambar popup bisa diganti dan dihapus.
 *    - Tidak ada gambar bawaan yang tertulis mati di komponen; semua dari data pengaturan CMS.
 *    - Saat gambar/video/PDF memuat atau gagal, tampilkan kerangka abu netral tanpa teks galat.
 * 
 * 5. ATURAN MOBILE (HP) PRIORITAS UTAMA:
 *    - Layar 360px - 430px harus rapi, proporsional, mudah dioperasikan dengan satu jari.
 *    - ATURAN PERMANEN: Di tampilan HP, sidebar dibuka dengan tombol pegangan di tepi kiri tengah layar; tidak ada tombol hamburger di header HP.
 *    - Header HP menempel, tinggi 56-64px, HANYA berisi logo dan nama singkat (tanpa tombol apa pun).
 *    - Tombol pegangan: ukuran tampil 30px x 120px menempel tepi kiri tengah layar, area sentuh minimal 44px, isi 3 elemen vertikal (garis aksen, ikon 3 garis, garis aksen tanpa teks).
 *    - Saat laci terbuka, tombol pegangan bergeser keluar ke kiri sambil memudar; saat laci tertutup sempurna, tombol kembali masuk.
 *    - Area isi halaman di HP diberi jarak kiri sekitar 38px agar tidak tertutup tombol pegangan.
 *    - Menu laci dari sisi (lebar ~78% layar, maks 320px) dengan lapisan gelap toska transparan; item vertikal >= 48px, huruf >= 16px.
 *    - Menutup otomatis saat mengetuk lapisan gelap, Escape, memilih item, berpindah halaman, atau menggeser laci ke kiri.
 *    - Dialog tampil sebagai panel dari bawah (bottom sheet) atau modal responsif.
 *    - Tidak ada elemen yang overflow mendatar / membuat gulir samping pada halaman.
 *    - Tabel berubah menjadi kartu bertumpuk pada layar HP.
 */

export const DESIGN_RULES = {
  MIN_TOUCH_TARGET: 44,
  HEADER_HEIGHT_MOBILE: 60,
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
