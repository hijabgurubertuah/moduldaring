// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import { Student, Material, GradeRecord, GradeSettings, CmsSettings, SyncSettings, ActivityLog } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  // Kelas VII A
  { id: 'std-01', name: 'Ahmad Fauzi', nisn: '0123456701', className: 'VII A' },
  { id: 'std-02', name: 'Siti Aisyah', nisn: '0123456702', className: 'VII A' },
  { id: 'std-03', name: 'Rizky Pratama', nisn: '0123456703', className: 'VII A' },
  { id: 'std-13', name: 'Tengku Zulkifli', nisn: '0123456713', className: 'VII A' },
  { id: 'std-14', name: 'Wan Nadira', nisn: '0123456714', className: 'VII A' },
  { id: 'std-15', name: 'Megat Iskandar', nisn: '0123456715', className: 'VII A' },

  // Kelas VII B
  { id: 'std-04', name: 'Nur Alya Putri', nisn: '0123456704', className: 'VII B' },
  { id: 'std-05', name: 'Muhammad Dzaky', nisn: '0123456705', className: 'VII B' },
  { id: 'std-06', name: 'Dewi Lestari', nisn: '0123456706', className: 'VII B' },
  { id: 'std-16', name: 'Raja Faisal', nisn: '0123456716', className: 'VII B' },
  { id: 'std-17', name: 'Syarifah Khadijah', nisn: '0123456717', className: 'VII B' },
  { id: 'std-18', name: 'Indra Gunawan', nisn: '0123456718', className: 'VII B' },

  // Kelas VIII A
  { id: 'std-07', name: 'Farhan Hidayat', nisn: '0123456707', className: 'VIII A' },
  { id: 'std-08', name: 'Annisa Rahmah', nisn: '0123456708', className: 'VIII A' },
  { id: 'std-09', name: 'Reza Maulana', nisn: '0123456709', className: 'VIII A' },
  { id: 'std-19', name: 'Putri Mayang Sari', nisn: '0123456719', className: 'VIII A' },
  { id: 'std-20', name: 'Arif Rahman Hakim', nisn: '0123456720', className: 'VIII A' },
  { id: 'std-21', name: 'Melati Anggraini', nisn: '0123456721', className: 'VIII A' },

  // Kelas IX A
  { id: 'std-10', name: 'Putri Ramadhani', nisn: '0123456710', className: 'IX A' },
  { id: 'std-11', name: 'Aditya Saputra', nisn: '0123456711', className: 'IX A' },
  { id: 'std-12', name: 'Nabila Azzahra', nisn: '0123456712', className: 'IX A' },
  { id: 'std-22', name: 'Bayu Kurniawan', nisn: '0123456722', className: 'IX A' },
  { id: 'std-23', name: 'Fitri Handayani', nisn: '0123456723', className: 'IX A' },
  { id: 'std-24', name: 'Ilham Saputra', nisn: '0123456724', className: 'IX A' },
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-01',
    title: 'Bilangan Bulat dan Operasinya',
    subject: 'Matematika',
    targetClasses: ['VII A', 'VII B'],
    status: 'Tampil',
    order: 1,
    pages: [
      {
        id: 'p-01',
        title: 'Pengertian',
        blocks: [
          {
            id: 'b-01',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Konsep Dasar Bilangan Bulat',
            },
          },
          {
            id: 'b-02',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Bilangan bulat adalah himpunan bilangan yang terdiri atas bilangan bulat negatif, bilangan nol, dan bilangan bulat positif. Pada garis bilangan horizontal, bilangan nol berada di titik tengah. Bilangan positif terletak di sebelah kanan nol, sedangkan bilangan negatif terletak di sebelah kiri nol.',
            },
          },
          {
            id: 'b-03',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Semakin ke kanan letak suatu bilangan pada garis bilangan, maka nilainya semakin besar. Sebaliknya, semakin ke kiri letak suatu bilangan, nilainya semakin kecil. Pemahaman garis bilangan ini menjadi dasar utama dalam mempelajari operasi hitung penjumlahan dan pengurangan.',
            },
          },
        ],
      },
      {
        id: 'p-02',
        title: 'Operasi Jumlah & Kurang',
        blocks: [
          {
            id: 'b-04',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Penjumlahan dan Pengurangan',
            },
          },
          {
            id: 'b-05',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Penjumlahan dua bilangan bertanda sama dilakukan dengan menjumlahkan kedua nilai mutlaknya lalu memberikan tanda yang sama dengan kedua bilangan tersebut. Sebagai contoh, (-5) + (-7) = -12.',
            },
          },
          {
            id: 'b-06',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Apabila tanda kedua bilangan berbeda, kurangkan nilai mutlak yang lebih besar dengan nilai mutlak yang lebih kecil, lalu ikuti tanda dari bilangan yang memiliki nilai mutlak lebih besar. Misalnya: 15 + (-8) = 7, sedangkan (-15) + 8 = -7.',
            },
          },
        ],
      },
      {
        id: 'p-03',
        title: 'Kali & Bagi',
        blocks: [
          {
            id: 'b-07',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Perkalian dan Pembagian',
            },
          },
          {
            id: 'b-08',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Perkalian dan pembagian dua bilangan bulat mengikuti kaidah tanda yang konsisten. Perkalian dua bilangan bertanda sama selalu menghasilkan bilangan positif, sedangkan perkalian dua bilangan berbeda tanda selalu menghasilkan bilangan negatif.',
            },
          },
          {
            id: 'b-09',
            type: 'table',
            table: {
              headers: ['Operasi', 'Contoh', 'Hasil'],
              rows: [
                ['Positif × Positif', '6 × 4', '+24'],
                ['Negatif × Negatif', '(-6) × (-4)', '+24'],
                ['Positif × Negatif', '6 × (-4)', '-24'],
                ['Negatif ÷ Positif', '(-24) ÷ 6', '-4'],
              ],
            },
          },
        ],
      },
      {
        id: 'p-04',
        title: 'Contoh Soal',
        blocks: [
          {
            id: 'b-10',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Penyelesaian Kasus Nyata',
            },
          },
          {
            id: 'b-11',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Suhu di dalam lemari pendingin mula-mula adalah -4°C. Ketika aliran listrik padam selama dua jam, suhu di dalam lemari pendingin naik sebesar 9°C. Berapakah suhu lemari pendingin sekarang?',
            },
          },
          {
            id: 'b-12',
            type: 'text',
            text: {
              style: 'quote',
              content: 'Penyelesaian: Suhu awal = -4°C. Kenaikan suhu = +9°C. Suhu akhir = (-4) + 9 = 5°C.',
            },
          },
        ],
      },
      {
        id: 'p-05',
        title: 'Rangkuman',
        blocks: [
          {
            id: 'b-13',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Rangkuman Materi',
            },
          },
          {
            id: 'b-14',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Operasi campuran bilangan bulat selalu mengutamakan tanda kurung terlebih dahulu, diikuti perkalian dan pembagian dari kiri ke kanan, dan diakhiri dengan penjumlahan dan pengurangan. Ketelitian tanda adalah kunci utama dalam memperoleh hasil yang akurat.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'mat-02',
    title: 'Klasifikasi Makhluk Hidup',
    subject: 'IPA',
    targetClasses: ['VII A', 'VII B'],
    status: 'Tampil',
    order: 2,
    pages: [
      {
        id: 'p-06',
        title: 'Ciri Kehidupan',
        blocks: [
          {
            id: 'b-15',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Karakteristik Makhluk Hidup',
            },
          },
          {
            id: 'b-16',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Semua makhluk hidup memiliki karakteristik pembeda dari benda tak hidup. Ciri-ciri tersebut meliputi bernapas, memerlukan nutrisi, bergerak, peka terhadap rangsang (iritabilitas), tumbuh dan berkembang, berkembang biak, serta mampu menyesuaikan diri dengan lingkungan.',
            },
          },
          {
            id: 'b-17',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Klasifikasi makhluk hidup bertujuan untuk mempermudah mengenali, membandingkan, dan mempelajari keanekaragaman hayati yang sangat melimpah di bumi.',
            },
          },
        ],
      },
      {
        id: 'p-07',
        title: 'Sistem Lima Kingdom',
        blocks: [
          {
            id: 'b-18',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Pengelompokan Lima Kingdom',
            },
          },
          {
            id: 'b-19',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Robert H. Whittaker mengelompokkan makhluk hidup ke dalam lima kerajaan (kingdom): Monera, Protista, Fungi (Jamur), Plantae (Tumbuhan), dan Animalia (Hewan). Setiap kelompok memiliki tingkatan organisasi seluler serta pola perolehan energi yang khas.',
            },
          },
          {
            id: 'b-20',
            type: 'video',
            video: {
              youtubeUrl: 'https://www.youtube.com/watch?v=F38BmgPcZ_I',
            },
          },
        ],
      },
      {
        id: 'p-08',
        title: 'Kunci Determinasi',
        blocks: [
          {
            id: 'b-21',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Penggunaan Kunci Dikotomi',
            },
          },
          {
            id: 'b-22',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Kunci determinasi adalah petunjuk praktis berupa daftar ciri-ciri organisme yang disusun berpasangan secara berlawanan untuk mengidentifikasi kelompok spesies tertentu hingga tingkatan taksonomi yang tepat.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'mat-03',
    title: 'Teks Deskripsi',
    subject: 'Bahasa Indonesia',
    targetClasses: ['VII A', 'VII B'],
    status: 'Tampil',
    order: 3,
    pages: [
      {
        id: 'p-09',
        title: 'Struktur Teks',
        blocks: [
          {
            id: 'b-23',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Mengenal Teks Deskripsi',
            },
          },
          {
            id: 'b-24',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Teks deskripsi adalah teks yang melukiskan suatu objek, tempat, atau peristiwa secara jelas dan terperinci sehingga pembaca seolah-olah melihat, mendengar, atau merasakan sendiri objek yang digambarkan oleh penulis.',
            },
          },
          {
            id: 'b-25',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Struktur teks deskripsi terdiri atas identifikasi (penentu identitas objek), deskripsi bagian (klasifikasi dan rincian bagian objek), serta simpulan atau kesan umum penulis terhadap objek.',
            },
          },
        ],
      },
      {
        id: 'p-10',
        title: 'Unsur Kebahasaan',
        blocks: [
          {
            id: 'b-26',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Ciri Kebahasaan Teks Deskripsi',
            },
          },
          {
            id: 'b-27',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Teks deskripsi lazim menggunakan kata-kata khusus yang konkret, kalimat bermajas perbandingan, serta kata sifat yang mendeskripsikan kondisi visual, aroma, suara, atau rasa suatu tempat atau benda.',
            },
          },
        ],
      },
      {
        id: 'p-11',
        title: 'Contoh Analisis',
        blocks: [
          {
            id: 'b-28',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Contoh Objek: Pantai Selat Baru',
            },
          },
          {
            id: 'b-29',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Pantai Selat Baru di Pulau Bengkalis menyajikan hamparan pasir landai yang luas membentang. Ombak tenang berkejaran menuju tepian di bawah naungan pohon kelapa yang berderet rapi, menghadirkan semilir angin tropis yang menyejukkan hati.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'mat-04',
    title: 'Descriptive Text',
    subject: 'Bahasa Inggris',
    targetClasses: ['VIII A'],
    status: 'Tampil',
    order: 4,
    pages: [
      {
        id: 'p-12',
        title: 'Definition',
        blocks: [
          {
            id: 'b-30',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Understanding Descriptive Text',
            },
          },
          {
            id: 'b-31',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Descriptive text is a type of text with a purpose to give information. The context of this kind of text is the description of a particular person, animal, place, or thing. It presents information in a way that appeals directly to the reader sensory awareness.',
            },
          },
        ],
      },
      {
        id: 'p-13',
        title: 'Generic Structure',
        blocks: [
          {
            id: 'b-32',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Structure and Language Features',
            },
          },
          {
            id: 'b-33',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'The generic structure consists of Identification (introducing the subject to be described) and Description (giving details of the characteristics, qualities, parts, or habits of the subject). It frequently utilizes Simple Present Tense and specific adjectives.',
            },
          },
        ],
      },
      {
        id: 'p-14',
        title: 'Practice & Reading',
        blocks: [
          {
            id: 'b-34',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Reading Passage',
            },
          },
          {
            id: 'b-35',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Bengkalis Island is a peaceful coastal region located in Riau Province. It is famous for its gentle coastal breeze, lush mangrove forests, and traditional Malay architecture with warm hospitality.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'mat-05',
    title: 'Keragaman Sosial Budaya',
    subject: 'IPS',
    targetClasses: ['VIII A'],
    status: 'Tampil',
    order: 5,
    pages: [
      {
        id: 'p-15',
        title: 'Bentuk Keragaman',
        blocks: [
          {
            id: 'b-36',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Wujud Keragaman Budaya Indonesia',
            },
          },
          {
            id: 'b-37',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Indonesia memiliki keragaman suku bangsa, bahasa daerah, pakaian adat, rumah adat, tarian tradisional, serta sistem kekerabatan yang sangat kaya. Keberagaman ini terbentuk oleh letak geografis kepulauan, kondisi iklim, serta interaksi sejarah perdagangan masa lampau.',
            },
          },
          {
            id: 'b-38',
            type: 'table',
            table: {
              headers: ['Daerah', 'Rumah Adat', 'Kesenian Khas'],
              rows: [
                ['Riau', 'Selaso Jatuh Kembar', 'Tari Zapin'],
                ['Sumatera Barat', 'Rumah Gadang', 'Tari Piring'],
                ['Jawa Tengah', 'Joglo', 'Wayang Kulit'],
                ['Kalimantan Barat', 'Rumah Betang', 'Tari Monong'],
              ],
            },
          },
        ],
      },
      {
        id: 'p-16',
        title: 'Sikap Toleransi',
        blocks: [
          {
            id: 'b-39',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Menjaga Harmoni Sosial',
            },
          },
          {
            id: 'b-40',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Semboyan Bhinneka Tunggal Ika menjadi landasan utama dalam menjaga integrasi bangsa di tengah perbedaan latar belakang kultural. Rasa saling menghormati dan sikap terbuka memperkuat persatuan masyarakat.',
            },
          },
        ],
      },
      {
        id: 'p-17',
        title: 'Pelestarian Budaya',
        blocks: [
          {
            id: 'b-41',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Peran Generasi Muda',
            },
          },
          {
            id: 'b-42',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Pelestarian budaya lokal dapat dilakukan melalui pengenalan warisan sastra, kebiasaan gotong royong, serta pemanfaatan media digital secara positif untuk mempromosikan tradisi nusantara.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'mat-06',
    title: 'Norma dalam Kehidupan Bermasyarakat',
    subject: 'PPKn',
    targetClasses: ['IX A'],
    status: 'Tampil',
    order: 6,
    pages: [
      {
        id: 'p-18',
        title: 'Pengertian Norma',
        blocks: [
          {
            id: 'b-43',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Hakikat Norma Sosial',
            },
          },
          {
            id: 'b-44',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Norma merupakan aturan atau ketentuan yang mengikat warga kelompok dalam masyarakat, dipakai sebagai panduan, tatanan, dan pengendali tingkah laku yang sesuai dan berterima.',
            },
          },
          {
            id: 'b-45',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Keberadaan norma menciptakan keteraturan, kepastian hukum, rasa aman, serta ketenteraman bersama dalam kehidupan bermasyarakat, berbangsa, dan bernegara.',
            },
          },
        ],
      },
      {
        id: 'p-19',
        title: 'Macam-Macam Norma',
        blocks: [
          {
            id: 'b-46',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Empat Norma Pokok',
            },
          },
          {
            id: 'b-47',
            type: 'table',
            table: {
              headers: ['Norma', 'Sumber', 'Sanksi'],
              rows: [
                ['Agama', 'Wahyu Tuhan Yang Maha Esa', 'Dosa (Kelak)'],
                ['Kesusilaan', 'Hati Nurani Manusia', 'Penyesalan Diri'],
                ['Kesopanan', 'Pergaulan Masyarakat', 'Dicemooh/Dikucilkan'],
                ['Hukum', 'Lembaga Resmi Negara', 'Tegas dan Mengikat'],
              ],
            },
          },
        ],
      },
      {
        id: 'p-20',
        title: 'Penerapan di Sekolah',
        blocks: [
          {
            id: 'b-48',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Budaya Disiplin dan Santun',
            },
          },
          {
            id: 'b-49',
            type: 'text',
            text: {
              style: 'paragraph',
              content: 'Di lingkungan sekolah, norma diterapkan melalui tata tertib kehadiran, sikap hormat kepada guru dan staf kependidikan, serta kepedulian terhadap sesama rekan sebaya tanpa diskriminasi.',
            },
          },
        ],
      },
    ],
  },
];

export const INITIAL_GRADE_SETTINGS: GradeSettings = {
  bobotTugas: 20,
  bobotKuis: 20,
  bobotUts: 25,
  bobotUas: 35,
  kkm: 75,
  batasA: 90,
  batasB: 80,
  batasC: 70,
};

export function calculateGrade(
  tugas: number,
  kuis: number,
  uts: number,
  uas: number,
  settings: GradeSettings = INITIAL_GRADE_SETTINGS
): { nilaiAkhir: number; predikat: 'A' | 'B' | 'C' | 'D' } {
  const sumWeights = settings.bobotTugas + settings.bobotKuis + settings.bobotUts + settings.bobotUas;
  const weighted =
    (tugas * settings.bobotTugas +
      kuis * settings.bobotKuis +
      uts * settings.bobotUts +
      uas * settings.bobotUas) /
    (sumWeights || 100);

  const rounded = Math.round(weighted);
  let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
  if (rounded >= settings.batasA) predikat = 'A';
  else if (rounded >= settings.batasB) predikat = 'B';
  else if (rounded >= settings.batasC) predikat = 'C';
  else predikat = 'D';

  return { nilaiAkhir: rounded, predikat };
}

// Generate realistic grade records across 4 subjects for all 24 students
const SUBJECTS = ['Matematika', 'IPA', 'Bahasa Indonesia', 'Bahasa Inggris'];

export const INITIAL_GRADES: GradeRecord[] = (() => {
  const list: GradeRecord[] = [];
  INITIAL_STUDENTS.forEach((student, sIdx) => {
    SUBJECTS.forEach((subject, subIdx) => {
      // Deterministic spread between 62 and 98 to produce A, B, C, D
      const baseSeed = (sIdx * 17 + subIdx * 23) % 40;
      let tugas = 65 + baseSeed;
      let kuis = 62 + ((baseSeed + 7) % 36);
      let uts = 64 + ((baseSeed + 13) % 35);
      let uas = 60 + ((baseSeed + 19) % 38);

      // Clamp between 60 and 98
      tugas = Math.min(98, Math.max(60, tugas));
      kuis = Math.min(98, Math.max(60, kuis));
      uts = Math.min(98, Math.max(60, uts));
      uas = Math.min(98, Math.max(60, uas));

      const { nilaiAkhir, predikat } = calculateGrade(tugas, kuis, uts, uas, INITIAL_GRADE_SETTINGS);

      list.push({
        id: `grd-${student.nisn}-${subIdx}`,
        studentNisn: student.nisn,
        studentName: student.name,
        className: student.className,
        subject,
        tugas,
        kuis,
        uts,
        uas,
        nilaiAkhir,
        predikat,
        updatedAt: '2026-10-15 09:30',
      });
    });
  });
  return list;
})();

export const INITIAL_CMS_SETTINGS: CmsSettings = {
  // 1. Identitas
  appName: 'Modul Belajar Daring',
  institutionName: 'SMP NEGERI 1 BENGKALIS',
  shortName: 'SMPN 1 BENGKALIS',
  logoSource: 'tautan',
  logoValue: 'https://i.ibb.co.com/nqfqhc29/kdu.png',
  faviconValue: 'https://i.ibb.co.com/nqfqhc29/kdu.png',
  copyrightText: '© SMP NEGERI 1 BENGKALIS',
  pageTitle: 'Modul Belajar Daring - SMP Negeri 1 Bengkalis',
  pageDescription: 'Media pembelajaran daring dan rekap nilai siswa.',

  // 2. Layar Login
  loginWelcomeTitle: 'Selamat Datang di Pembelajaran Daring',
  loginInstitutionName: 'SMP NEGERI 1 BENGKALIS',
  loginWelcomeText: 'Belajar kapan saja, di mana saja',
  loginPasswordLabel: 'Kata Sandi',
  loginButtonLabel: 'Masuk',
  loginErrorMessage: 'Kata sandi tidak sesuai',
  loginSpinLogo: true,
  loginSpinSpeed: 6,
  loginBackgroundType: 'gradient',
  loginBackgroundImage: '',

  // 3. Tema
  colorPrimary: '#0F766E',
  colorSecondary: '#134E4A',
  colorAccent: '#2DD4BF',
  colorWarm: '#FBBF24',
  colorBgStart: '#042F2E',
  colorBgMid: '#0B4F4A',
  colorBgEnd: '#0F766E',
  colorTextPrimary: '#ECFEFF',
  colorTextSecondary: '#A5D8D3',
  glassOpacity: 0.40,
  glassContentOpacity: 0.55,
  glassBlur: 18,
  borderRadius: 20,
  fontFamily: 'Plus Jakarta Sans',

  // 4. Sidebar & Menu
  labelRekapNilai: 'Rekap Nilai',
  sectionTitleMateri: 'Materi',
  labelKeluar: 'Keluar',
  showProfileCard: true,
  groupBySubject: true,

  // 5. Tampilan Materi
  tabStyle: 'pill',
  contentFontSize: 16,
  maxReadWidth: 820,
  showOpenedCheckmark: true,
  emptyMaterialText: 'Belum ada materi',

  // 6. Rekap Nilai
  rekapTitle: 'Rekap Nilai',
  labelColSubject: 'Mata Pelajaran',
  labelColTugas: 'Tugas',
  labelColKuis: 'Kuis',
  labelColUts: 'UTS',
  labelColUas: 'UAS',
  labelColAkhir: 'Nilai Akhir',
  labelColPredikat: 'Predikat',
  labelAvgCard: 'Rata-rata Nilai Akhir',
  labelTuntasCard: 'Mapel Tuntas',
  labelProgressCard: 'Progres Materi',
  showSummaryCards: true,
  showGradeChart: true,
  predikatColorA: '#34D399',
  predikatColorB: '#2DD4BF',
  predikatColorC: '#FBBF24',
  predikatColorD: '#FB923C',

  // 7. Teks & Pesan
  msgCountdown: 'Tunggu {seconds} detik',
  msgSaved: 'Berhasil disimpan',
  msgUploadFailed: 'Gagal mengunggah',
  msgEmptyData: 'Belum ada data',
  msgEmptyGrade: 'Belum ada nilai',
  msgPageNotFound: 'Halaman Tidak Ditemukan',
  msgOfflineBadge: 'Offline',

  // 8. Fitur
  featureSpinLogo: true,
  featureOpenedMark: true,
  featureRememberLast: true,
  featureSummaryCards: true,
  featureGradeChart: true,
};

export const INITIAL_SYNC_SETTINGS: SyncSettings = {
  webAppUrl: '',
  token: '',
  driveFolderId: '',
  spreadsheetId: '',
  studentSheetName: 'Siswa',
  gradesSheetName: 'Rekap Nilai',
  lastConnectedStatus: 'Belum Teruji',
};

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'log-01', timestamp: '2026-10-17 14:10', role: 'Admin', action: 'Memperbarui materi Bilangan Bulat dan Operasinya' },
  { id: 'log-02', timestamp: '2026-10-17 11:45', role: 'Admin', action: 'Menyimpan nilai Matematika kelas VII A' },
  { id: 'log-03', timestamp: '2026-10-16 16:30', role: 'Admin', action: 'Memperbarui pengaturan CMS Identitas' },
  { id: 'log-04', timestamp: '2026-10-16 10:15', role: 'Admin', action: 'Menambah data siswa baru kelas IX A' },
  { id: 'log-05', timestamp: '2026-10-15 08:20', role: 'Admin', action: 'Menguji koneksi spreadsheet' },
];

export const INITIAL_ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // sha256 of "admin123"
