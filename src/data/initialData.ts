// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import {
  Student,
  Material,
  GradeRecord,
  GradeSettings,
  CmsSettings,
  SyncSettings,
  ActivityLog,
  QuestionItem,
} from '../types';

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

// Interactive Game HTML for Matematika
const MATH_GAME_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body {
    margin: 0;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #042F2E;
    color: #ECFEFF;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    box-sizing: border-box;
  }
  .card {
    background: rgba(15, 118, 110, 0.4);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    max-width: 380px;
    width: 100%;
    box-sizing: border-box;
  }
  .question {
    font-size: 28px;
    font-weight: bold;
    color: #2DD4BF;
    margin: 16px 0;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 20px;
  }
  button {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    color: #ECFEFF;
    padding: 14px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  button:hover {
    background: rgba(45, 212, 191, 0.4);
  }
  .score {
    font-size: 14px;
    color: #A5D8D3;
  }
</style>
</head>
<body>
<div class="card">
  <div class="score" id="score">Skor: 0</div>
  <div class="question" id="problem">(-7) + 12 = ?</div>
  <div class="grid" id="options"></div>
</div>
<script>
  let score = 0;
  let correct = 5;
  function nextProblem() {
    const a = Math.floor(Math.random() * 20) - 10;
    const b = Math.floor(Math.random() * 20) - 10;
    const isPlus = Math.random() > 0.5;
    correct = isPlus ? a + b : a - b;
    const op = isPlus ? '+' : '-';
    document.getElementById('problem').textContent = '(' + a + ') ' + op + ' (' + b + ') = ?';
    document.getElementById('score').textContent = 'Skor: ' + score;
    const answers = [correct];
    while(answers.length < 4) {
      const wrong = correct + (Math.floor(Math.random() * 11) - 5);
      if(!answers.includes(wrong)) answers.push(wrong);
    }
    answers.sort(() => Math.random() - 0.5);
    const container = document.getElementById('options');
    container.innerHTML = '';
    answers.forEach(ans => {
      const btn = document.createElement('button');
      btn.textContent = ans;
      btn.onclick = () => {
        if(ans === correct) {
          score += 10;
          btn.style.background = '#34D399';
        } else {
          btn.style.background = '#EF4444';
        }
        setTimeout(nextProblem, 500);
      };
      container.appendChild(btn);
    });
  }
  nextProblem();
</script>
</body>
</html>`;

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
        type: 'materi',
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
              content:
                'Bilangan bulat adalah himpunan bilangan yang terdiri atas bilangan bulat negatif, bilangan nol, dan bilangan bulat positif. Pada garis bilangan horizontal, bilangan nol berada di titik tengah. Bilangan positif terletak di sebelah kanan nol, sedangkan bilangan negatif terletak di sebelah kiri nol.',
            },
          },
          {
            id: 'b-03',
            type: 'text',
            text: {
              style: 'paragraph',
              content:
                'Semakin ke kanan letak suatu bilangan pada garis bilangan, maka nilainya semakin besar. Sebaliknya, semakin ke kiri letak suatu bilangan, nilainya semakin kecil. Pemahaman garis bilangan ini menjadi dasar utama dalam mempelajari operasi hitung penjumlahan dan pengurangan.',
            },
          },
        ],
        question: {
          id: 'q-01',
          question: 'Manakah pernyataan yang benar mengenai posisi bilangan pada garis bilangan horizontal?',
          options: [
            { id: 'opt-1a', label: 'A', text: 'Semakin ke kiri nilainya semakin besar' },
            { id: 'opt-1b', label: 'B', text: 'Semakin ke kanan nilainya semakin besar' },
            { id: 'opt-1c', label: 'C', text: 'Bilangan negatif berada di sebelah kanan nol' },
            { id: 'opt-1d', label: 'D', text: 'Bilangan nol nilainya lebih kecil dari semua bilangan negatif' },
          ],
          correctOptionId: 'opt-1b',
          delaySeconds: 5,
        },
      },
      {
        id: 'p-02',
        type: 'materi',
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
              content:
                'Penjumlahan dua bilangan bertanda sama dilakukan dengan menjumlahkan kedua nilai mutlaknya lalu memberikan tanda yang sama dengan kedua bilangan tersebut. Sebagai contoh, (-5) + (-7) = -12.',
            },
          },
          {
            id: 'b-06',
            type: 'text',
            text: {
              style: 'paragraph',
              content:
                'Apabila tanda kedua bilangan berbeda, kurangkan nilai mutlak yang lebih besar dengan nilai mutlak yang lebih kecil, lalu ikuti tanda dari bilangan yang memiliki nilai mutlak lebih besar. Misalnya: 15 + (-8) = 7, sedangkan (-15) + 8 = -7.',
            },
          },
        ],
        question: {
          id: 'q-02',
          question: 'Berapakah hasil dari (-18) + 25?',
          options: [
            { id: 'opt-2a', label: 'A', text: '-7' },
            { id: 'opt-2b', label: 'B', text: '7' },
            { id: 'opt-2c', label: 'C', text: '43' },
            { id: 'opt-2d', label: 'D', text: '-43' },
          ],
          correctOptionId: 'opt-2b',
          delaySeconds: 10,
        },
      },
      {
        id: 'p-03',
        type: 'materi',
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
              content:
                'Perkalian dan pembagian dua bilangan bulat mengikuti kaidah tanda yang konsisten. Perkalian dua bilangan bertanda sama selalu menghasilkan bilangan positif, sedangkan perkalian dua bilangan berbeda tanda selalu menghasilkan bilangan negatif.',
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
        question: {
          id: 'q-03',
          question: 'Berapakah hasil dari (-8) × (-9)?',
          options: [
            { id: 'opt-3a', label: 'A', text: '-72' },
            { id: 'opt-3b', label: 'B', text: '72' },
            { id: 'opt-3c', label: 'C', text: '-17' },
            { id: 'opt-3d', label: 'D', text: '17' },
          ],
          correctOptionId: 'opt-3b',
          delaySeconds: 15,
        },
      },
      {
        id: 'p-04',
        type: 'game',
        gameHtml: MATH_GAME_HTML,
      },
      {
        id: 'p-05',
        type: 'kuis_akhir',
        maxAttempts: 0,
        quizQuestions: [
          {
            id: 'qk-01',
            question: 'Hasil dari 12 + (-25) adalah...',
            options: [
              { id: 'qk-1a', label: 'A', text: '-13' },
              { id: 'qk-1b', label: 'B', text: '13' },
              { id: 'qk-1c', label: 'C', text: '-37' },
              { id: 'qk-1d', label: 'D', text: '37' },
            ],
            correctOptionId: 'qk-1a',
          },
          {
            id: 'qk-02',
            question: 'Hasil dari (-15) - (-8) adalah...',
            options: [
              { id: 'qk-2a', label: 'A', text: '-23' },
              { id: 'qk-2b', label: 'B', text: '-7' },
              { id: 'qk-2c', label: 'C', text: '7' },
              { id: 'qk-2d', label: 'D', text: '23' },
            ],
            correctOptionId: 'qk-2b',
          },
          {
            id: 'qk-03',
            question: 'Nilai dari (-6) × 7 adalah...',
            options: [
              { id: 'qk-3a', label: 'A', text: '-42' },
              { id: 'qk-3b', label: 'B', text: '42' },
              { id: 'qk-3c', label: 'C', text: '-1' },
              { id: 'qk-3d', label: 'D', text: '13' },
            ],
            correctOptionId: 'qk-3a',
          },
          {
            id: 'qk-04',
            question: 'Hasil dari (-56) ÷ (-8) adalah...',
            options: [
              { id: 'qk-4a', label: 'A', text: '-7' },
              { id: 'qk-4b', label: 'B', text: '7' },
              { id: 'qk-4c', label: 'C', text: '-64' },
              { id: 'qk-4d', label: 'D', text: '48' },
            ],
            correctOptionId: 'qk-4b',
          },
          {
            id: 'qk-05',
            question: 'Suhu mula-mula -3°C lalu naik 8°C. Suhu sekarang adalah...',
            options: [
              { id: 'qk-5a', label: 'A', text: '11°C' },
              { id: 'qk-5b', label: 'B', text: '5°C' },
              { id: 'qk-5c', label: 'C', text: '-5°C' },
              { id: 'qk-5d', label: 'D', text: '-11°C' },
            ],
            correctOptionId: 'qk-5b',
          },
          {
            id: 'qk-06',
            question: 'Hasil dari 15 + (-3) × 4 adalah...',
            options: [
              { id: 'qk-6a', label: 'A', text: '48' },
              { id: 'qk-6b', label: 'B', text: '3' },
              { id: 'qk-6c', label: 'C', text: '-3' },
              { id: 'qk-6d', label: 'D', text: '27' },
            ],
            correctOptionId: 'qk-6b',
          },
          {
            id: 'qk-07',
            question: 'Urutan bilangan -4, 2, -8, 0, 5 dari yang terkecil adalah...',
            options: [
              { id: 'qk-7a', label: 'A', text: '-8, -4, 0, 2, 5' },
              { id: 'qk-7b', label: 'B', text: '5, 2, 0, -4, -8' },
              { id: 'qk-7c', label: 'C', text: '0, -4, -8, 2, 5' },
              { id: 'qk-7d', label: 'D', text: '-4, -8, 0, 2, 5' },
            ],
            correctOptionId: 'qk-7a',
          },
          {
            id: 'qk-08',
            question: 'Pernyataan berikut yang benar adalah...',
            options: [
              { id: 'qk-8a', label: 'A', text: '-12 > -5' },
              { id: 'qk-8b', label: 'B', text: '-10 < -15' },
              { id: 'qk-8c', label: 'C', text: '-7 < 2' },
              { id: 'qk-8d', label: 'D', text: '0 < -3' },
            ],
            correctOptionId: 'qk-8c',
          },
          {
            id: 'qk-09',
            question: 'Hasil dari [(-10) + 4] ÷ (-3) adalah...',
            options: [
              { id: 'qk-9a', label: 'A', text: '-2' },
              { id: 'qk-9b', label: 'B', text: '2' },
              { id: 'qk-9c', label: 'C', text: '-6' },
              { id: 'qk-9d', label: 'D', text: '6' },
            ],
            correctOptionId: 'qk-9b',
          },
          {
            id: 'qk-10',
            question: 'Sebuah kapal selam berada di kedalaman 120 m. Jika naik 45 m, posisi kapal sekarang adalah...',
            options: [
              { id: 'qk-10a', label: 'A', text: '-165 m' },
              { id: 'qk-10b', label: 'B', text: '-75 m' },
              { id: 'qk-10c', label: 'C', text: '75 m' },
              { id: 'qk-10d', label: 'D', text: '165 m' },
            ],
            correctOptionId: 'qk-10b',
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
        type: 'materi',
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
              content:
                'Semua makhluk hidup memiliki karakteristik pembeda dari benda tak hidup. Ciri-ciri tersebut meliputi bernapas, memerlukan nutrisi, bergerak, peka terhadap rangsang (iritabilitas), tumbuh dan berkembang, berkembang biak, serta mampu menyesuaikan diri dengan lingkungan.',
            },
          },
        ],
        question: {
          id: 'q-ipa-1',
          question: 'Kemampuan makhluk hidup dalam menanggapi rangsangan dari luar disebut...',
          options: [
            { id: 'opt-ipa-1a', label: 'A', text: 'Adaptasi' },
            { id: 'opt-ipa-1b', label: 'B', text: 'Iritabilitas' },
            { id: 'opt-ipa-1c', label: 'C', text: 'Reproduksi' },
            { id: 'opt-ipa-1d', label: 'D', text: 'Respirasi' },
          ],
          correctOptionId: 'opt-ipa-1b',
          delaySeconds: 10,
        },
      },
      {
        id: 'p-07',
        type: 'materi',
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
              content:
                'Robert H. Whittaker mengelompokkan makhluk hidup ke dalam lima kerajaan: Monera, Protista, Fungi (Jamur), Plantae (Tumbuhan), dan Animalia (Hewan).',
            },
          },
        ],
        question: {
          id: 'q-ipa-2',
          question: 'Kingdom yang mencakup organisme prokariotik seperti bakteri adalah...',
          options: [
            { id: 'opt-ipa-2a', label: 'A', text: 'Monera' },
            { id: 'opt-ipa-2b', label: 'B', text: 'Protista' },
            { id: 'opt-ipa-2c', label: 'C', text: 'Fungi' },
            { id: 'opt-ipa-2d', label: 'D', text: 'Plantae' },
          ],
          correctOptionId: 'opt-ipa-2a',
          delaySeconds: 10,
        },
      },
      {
        id: 'p-08',
        type: 'materi',
        blocks: [
          {
            id: 'b-21',
            type: 'text',
            text: {
              style: 'heading',
              content: 'Kunci Determinasi',
            },
          },
          {
            id: 'b-22',
            type: 'text',
            text: {
              style: 'paragraph',
              content:
                'Kunci determinasi adalah petunjuk praktis berupa daftar ciri-ciri organisme yang disusun berpasangan secara berlawanan untuk mengidentifikasi kelompok taksonomi yang tepat.',
            },
          },
        ],
        question: {
          id: 'q-ipa-3',
          question: 'Kunci identifikasi yang terdiri atas dua pilihan ciri berlawanan pada setiap langkah dinamakan kunci...',
          options: [
            { id: 'opt-ipa-3a', label: 'A', text: 'Format' },
            { id: 'opt-ipa-3b', label: 'B', text: 'Dikotomi' },
            { id: 'opt-ipa-3c', label: 'C', text: 'Takson' },
            { id: 'opt-ipa-3d', label: 'D', text: 'Klasik' },
          ],
          correctOptionId: 'opt-ipa-3b',
          delaySeconds: 10,
        },
      },
      {
        id: 'p-09-cbt',
        type: 'kuis_akhir',
        maxAttempts: 0,
        quizQuestions: [
          {
            id: 'q-cbt-ipa-1',
            question: 'Ciri makhluk hidup yang berhubungan dengan pelestarian keturunan adalah...',
            options: [
              { id: 'cbt-1a', label: 'A', text: 'Berkembang biak' },
              { id: 'cbt-1b', label: 'B', text: 'Bergerak' },
              { id: 'cbt-1c', label: 'C', text: 'Bernapas' },
              { id: 'cbt-1d', label: 'D', text: 'Memerlukan nutrisi' },
            ],
            correctOptionId: 'cbt-1a',
          },
          {
            id: 'q-cbt-ipa-2',
            question: 'Urutan takson tumbuhan dari tingkat tertinggi ke terendah adalah...',
            options: [
              { id: 'cbt-2a', label: 'A', text: 'Kingdom - Divisi - Kelas - Ordo - Famili - Genus - Spesies' },
              { id: 'cbt-2b', label: 'B', text: 'Kingdom - Filum - Kelas - Ordo - Famili - Genus - Spesies' },
              { id: 'cbt-2c', label: 'C', text: 'Spesies - Genus - Famili - Ordo - Kelas - Divisi - Kingdom' },
              { id: 'cbt-2d', label: 'D', text: 'Divisi - Kingdom - Ordo - Kelas - Famili - Genus - Spesies' },
            ],
            correctOptionId: 'cbt-2a',
          },
          {
            id: 'q-cbt-ipa-3',
            question: 'Pemberian nama ilmiah dengan dua kata diperkenalkan oleh...',
            options: [
              { id: 'cbt-3a', label: 'A', text: 'Carolus Linnaeus' },
              { id: 'cbt-3b', label: 'B', text: 'Robert Whittaker' },
              { id: 'cbt-3c', label: 'C', text: 'Charles Darwin' },
              { id: 'cbt-3d', label: 'D', text: 'Gregor Mendel' },
            ],
            correctOptionId: 'cbt-3a',
          },
          {
            id: 'q-cbt-ipa-4',
            question: 'Organisme yang tidak berklorofil dan dinding selnya tersusun dari zat kitin adalah...',
            options: [
              { id: 'cbt-4a', label: 'A', text: 'Fungi' },
              { id: 'cbt-4b', label: 'B', text: 'Plantae' },
              { id: 'cbt-4c', label: 'C', text: 'Animalia' },
              { id: 'cbt-4d', label: 'D', text: 'Monera' },
            ],
            correctOptionId: 'cbt-4a',
          },
          {
            id: 'q-cbt-ipa-5',
            question: 'Contoh hewan vertebrata yang bernapas dengan insang saat dewasa adalah...',
            options: [
              { id: 'cbt-5a', label: 'A', text: 'Ikan mas' },
              { id: 'cbt-5b', label: 'B', text: 'Katak sawah' },
              { id: 'cbt-5c', label: 'C', text: 'Paus biru' },
              { id: 'cbt-5d', label: 'D', text: 'Lumba-lumba' },
            ],
            correctOptionId: 'cbt-5a',
          },
          {
            id: 'q-cbt-ipa-6',
            question: 'Tumbuhan lumut dan paku berkembang biak secara generatif dengan bantuan...',
            options: [
              { id: 'cbt-6a', label: 'A', text: 'Spora' },
              { id: 'cbt-6b', label: 'B', text: 'Biji terbuka' },
              { id: 'cbt-6c', label: 'C', text: 'Bunga sejati' },
              { id: 'cbt-6d', label: 'D', text: 'Tunas adventif' },
            ],
            correctOptionId: 'cbt-6a',
          },
          {
            id: 'q-cbt-ipa-7',
            question: 'Ciri khas hewan mamalia adalah...',
            options: [
              { id: 'cbt-7a', label: 'A', text: 'Memiliki kelenjar susu dan berambut' },
              { id: 'cbt-7b', label: 'B', text: 'Berdarah dingin dan bersisik' },
              { id: 'cbt-7c', label: 'C', text: 'Bertelur dan bernapas dengan pundi udara' },
              { id: 'cbt-7d', label: 'D', text: 'Kulit selalu basah dan mengalami metamorfosis' },
            ],
            correctOptionId: 'cbt-7a',
          },
          {
            id: 'q-cbt-ipa-8',
            question: 'Tujuan utama klasifikasi makhluk hidup adalah...',
            options: [
              { id: 'cbt-8a', label: 'A', text: 'Mempermudah mengenali dan mempelajari keanekaragaman' },
              { id: 'cbt-8b', label: 'B', text: 'Menambah spesies baru di alam' },
              { id: 'cbt-8c', label: 'C', text: 'Memusnahkan organisme berbahaya' },
              { id: 'cbt-8d', label: 'D', text: 'Mengubah nama lokal makhluk hidup' },
            ],
            correctOptionId: 'cbt-8a',
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
        id: 'p-10',
        type: 'materi',
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
              content:
                'Teks deskripsi adalah teks yang melukiskan suatu objek, tempat, atau peristiwa secara jelas dan terperinci sehingga pembaca seolah-olah melihat, mendengar, atau merasakan sendiri objek yang digambarkan oleh penulis.',
            },
          },
        ],
        question: {
          id: 'q-bi-1',
          question: 'Tujuan utama penulisan teks deskripsi adalah...',
          options: [
            { id: 'opt-bi-1a', label: 'A', text: 'Menceritakan peristiwa sejarah' },
            { id: 'opt-bi-1b', label: 'B', text: 'Melukiskan objek secara terperinci agar pembaca seolah melihatnya' },
            { id: 'opt-bi-1c', label: 'C', text: 'Membujuk pembaca membeli suatu produk' },
            { id: 'opt-bi-1d', label: 'D', text: 'Menjelaskan langkah kerja suatu alat' },
          ],
          correctOptionId: 'opt-bi-1b',
          delaySeconds: 10,
        },
      },
      {
        id: 'p-11',
        type: 'materi',
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
              content:
                'Teks deskripsi lazim menggunakan kata-kata khusus yang konkret, kalimat bermajas perbandingan, serta kata sifat yang mendeskripsikan kondisi visual, aroma, suara, atau rasa suatu tempat atau benda.',
            },
          },
        ],
        question: {
          id: 'q-bi-2',
          question: 'Struktur pertama pada teks deskripsi yang memuat identitas umum objek adalah...',
          options: [
            { id: 'opt-bi-2a', label: 'A', text: 'Identifikasi' },
            { id: 'opt-bi-2b', label: 'B', text: 'Deskripsi Bagian' },
            { id: 'opt-bi-2c', label: 'C', text: 'Simpulan' },
            { id: 'opt-bi-2d', label: 'D', text: 'Reorientasi' },
          ],
          correctOptionId: 'opt-bi-2a',
          delaySeconds: 10,
        },
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
        type: 'materi',
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
              content:
                'Descriptive text is a type of text with a purpose to give information. The context of this kind of text is the description of a particular person, animal, place, or thing.',
            },
          },
        ],
        question: {
          id: 'q-bing-1',
          question: 'What is the generic structure of a descriptive text?',
          options: [
            { id: 'opt-bing-1a', label: 'A', text: 'Orientation and Complication' },
            { id: 'opt-bing-1b', label: 'B', text: 'Identification and Description' },
            { id: 'opt-bing-1c', label: 'C', text: 'Thesis and Arguments' },
            { id: 'opt-bing-1d', label: 'D', text: 'Goal and Steps' },
          ],
          correctOptionId: 'opt-bing-1b',
          delaySeconds: 10,
        },
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
        id: 'p-13',
        type: 'materi',
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
              content:
                'Indonesia memiliki keragaman suku bangsa, bahasa daerah, pakaian adat, rumah adat, tarian tradisional, serta sistem kekerabatan yang sangat kaya.',
            },
          },
        ],
        question: {
          id: 'q-ips-1',
          question: 'Rumah adat tradisional khas masyarakat Melayu Riau bernama...',
          options: [
            { id: 'opt-ips-1a', label: 'A', text: 'Rumah Gadang' },
            { id: 'opt-ips-1b', label: 'B', text: 'Selaso Jatuh Kembar' },
            { id: 'opt-ips-1c', label: 'C', text: 'Rumah Joglo' },
            { id: 'opt-ips-1d', label: 'D', text: 'Rumah Tongkonan' },
          ],
          correctOptionId: 'opt-ips-1b',
          delaySeconds: 10,
        },
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
        id: 'p-14',
        type: 'materi',
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
              content:
                'Norma merupakan aturan atau ketentuan yang mengikat warga kelompok dalam masyarakat, dipakai sebagai panduan, tatanan, dan pengendali tingkah laku yang sesuai dan berterima.',
            },
          },
        ],
        question: {
          id: 'q-ppkn-1',
          question: 'Norma yang bersumber dari hati nurani manusia yang menghasilkan rasa penyesalan jika dilanggar adalah norma...',
          options: [
            { id: 'opt-ppkn-1a', label: 'A', text: 'Hukum' },
            { id: 'opt-ppkn-1b', label: 'B', text: 'Kesusilaan' },
            { id: 'opt-ppkn-1c', label: 'C', text: 'Kesopanan' },
            { id: 'opt-ppkn-1d', label: 'D', text: 'Agama' },
          ],
          correctOptionId: 'opt-ppkn-1b',
          delaySeconds: 10,
        },
      },
    ],
  },
];

export const INITIAL_GRADE_SETTINGS: GradeSettings = {
  bobotUjiPemahaman: 30,
  bobotKuisAkhir: 70,
  kkm: 75,
  batasA: 90,
  batasB: 80,
  batasC: 70,
};

export function calculateMaterialGrade(
  ujiPemahaman: number,
  kuisAkhir: number,
  hasKuis: boolean,
  settings: GradeSettings = INITIAL_GRADE_SETTINGS
): { nilaiAkhir: number; predikat: 'A' | 'B' | 'C' | 'D' | '-' } {
  if (hasKuis && (kuisAkhir < 0 || isNaN(kuisAkhir))) {
    return { nilaiAkhir: -1, predikat: '-' };
  }

  let finalScore = 0;
  if (!hasKuis) {
    finalScore = ujiPemahaman >= 0 ? ujiPemahaman : 0;
  } else {
    const totalWeights = settings.bobotUjiPemahaman + settings.bobotKuisAkhir;
    finalScore = Math.round(
      (ujiPemahaman * settings.bobotUjiPemahaman + kuisAkhir * settings.bobotKuisAkhir) /
        (totalWeights || 100)
    );
  }

  let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
  if (finalScore >= settings.batasA) predikat = 'A';
  else if (finalScore >= settings.batasB) predikat = 'B';
  else if (finalScore >= settings.batasC) predikat = 'C';
  return { nilaiAkhir: finalScore, predikat };
}

export function calculateGrade(
  ujiPemahaman: number,
  kuisAkhir: number,
  settings: GradeSettings = INITIAL_GRADE_SETTINGS,
  hasKuis: boolean = true
): { nilaiAkhir: number; predikat: 'A' | 'B' | 'C' | 'D' | '-' } {
  return calculateMaterialGrade(ujiPemahaman, kuisAkhir, hasKuis, settings);
}

// Generate sample grades with realistic spread 60-98
export const INITIAL_GRADES: GradeRecord[] = (() => {
  const list: GradeRecord[] = [];
  const evalMaterials = [INITIAL_MATERIALS[0], INITIAL_MATERIALS[1]]; // Matematika & IPA

  INITIAL_STUDENTS.forEach((student, sIdx) => {
    evalMaterials.forEach((mat, mIdx) => {
      // Deterministic spread
      const seed = (sIdx * 19 + mIdx * 29) % 38;
      const uji = Math.min(100, Math.max(65, 70 + seed));
      const kuis = Math.min(100, Math.max(60, 68 + ((seed + 11) % 31)));
      const hasKuis = mat.pages.some((p) => p.type === 'kuis_akhir');
      const { nilaiAkhir, predikat } = calculateMaterialGrade(
        uji,
        kuis,
        hasKuis,
        INITIAL_GRADE_SETTINGS
      );

      list.push({
        id: `grd-${student.nisn}-${mat.id}`,
        studentNisn: student.nisn,
        studentName: student.name,
        className: student.className,
        subject: mat.subject,
        materialId: mat.id,
        materialTitle: mat.title,
        ujiPemahaman: uji,
        kuisAkhir: kuis,
        nilaiAkhir,
        predikat,
        updatedAt: '2026-10-17 10:30',
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
  glassOpacity: 0.4,
  glassContentOpacity: 0.55,
  glassBlur: 18,
  borderRadius: 20,
  fontFamily: 'Plus Jakarta Sans',

  // 4. Sidebar & Menu
  labelRekapNilai: 'Rekap Nilai',
  labelKeluar: 'Keluar',
  sectionTitleMateri: 'Materi Belajar',
  showProfileCard: true,
  showOpenedCheckmark: true,
  groupBySubject: true,

  // 5. Tampilan Materi
  tabStyle: 'Angka',
  tabDefaultBg: 'rgba(15, 118, 110, 0.4)',
  tabDefaultTextColor: '#A5D8D3',
  tabActiveBg: 'rgba(45, 212, 191, 0.55)',
  tabActiveTextColor: '#ECFEFF',
  pageMarginX: 8,
  contentFontSize: 16,
  maxReadWidth: 820,
  emptyMaterialText: 'Belum ada materi',

  // 6. Uji Pemahaman & Kuis Akhir
  popupSuccessText: 'Kamu sudah menguasai materi ini',
  popupDuration: 1.8,
  questionDelaySeconds: 10,
  btnPrev: 'Mundur',
  btnNext: 'Lanjut',
  btnFinish: 'Selesai',
  btnBack: 'Kembali',
  btnConfirmFinish: 'Selesaikan',
  confirmUnansweredText: 'Masih ada {count} soal belum dijawab.',
  quizResultTitle: 'Hasil Kuis',
  numberUnansweredColor: '#EF4444',
  numberAnsweredColor: '#22C55E',

  // 7. Rekap Nilai
  rekapTitle: 'Rekap Nilai',
  labelColSubject: 'Mata Pelajaran',
  labelColMaterial: 'Materi',
  labelColUjiPemahaman: 'Uji Pemahaman',
  labelColKuisAkhir: 'Kuis Akhir',
  labelColNilaiAkhir: 'Nilai Akhir',
  labelColPredikat: 'Predikat',
  labelCardAvg: 'Rata-rata Nilai Akhir',
  labelCardTuntas: 'Materi Tuntas',
  labelCardDikerjakan: 'Materi Dikerjakan',
  showSummaryCards: true,
  showGradeChart: true,
  predikatColorA: '#34D399',
  predikatColorB: '#2DD4BF',
  predikatColorC: '#FBBF24',
  predikatColorD: '#FB923C',

  // 8. Teks & Pesan
  msgCountdown: 'Tunggu {seconds} detik',
  msgSaved: 'Berhasil disimpan',
  msgUploadFailed: 'Gagal mengunggah',
  msgEmptyData: 'Belum ada data',
  msgEmptyGrade: 'Belum ada nilai',
  msgPageNotFound: 'Halaman Tidak Ditemukan',
  msgOfflineBadge: 'Offline',

  // 9. Fitur
  featureSpinLogo: true,
  featureRememberLast: true,
  featureOpenedMark: true,
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
  { id: 'log-02', timestamp: '2026-10-17 11:45', role: 'Admin', action: 'Menyimpan nilai evaluasi siswa' },
  { id: 'log-03', timestamp: '2026-10-16 16:30', role: 'Admin', action: 'Memperbarui pengaturan CMS Identitas' },
  { id: 'log-04', timestamp: '2026-10-16 10:15', role: 'Admin', action: 'Menambah data siswa baru' },
  { id: 'log-05', timestamp: '2026-10-15 08:20', role: 'Admin', action: 'Menguji koneksi spreadsheet' },
];

export const INITIAL_ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
