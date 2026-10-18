// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

export type UserRole = 'Admin' | 'Siswa';

export interface Student {
  id: string;
  name: string;
  nisn: string;
  className: string;
}

export type BlockType = 'text' | 'image' | 'video' | 'pdf' | 'table' | 'divider';

export interface MaterialBlock {
  id: string;
  type: BlockType;
  text?: {
    content: string;
    style?: 'heading' | 'subheading' | 'paragraph' | 'quote' | 'bullet_list' | 'numbered_list';
  };
  image?: {
    source: 'drive' | 'tautan';
    value: string;
    caption?: string;
  };
  video?: {
    youtubeUrl: string;
  };
  pdf?: {
    source: 'drive' | 'tautan';
    value: string;
    name?: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface QuizOption {
  id: string;
  label: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  text: string;
  image?: {
    source: 'drive' | 'tautan';
    value: string;
  };
}

export interface QuestionItem {
  id: string;
  question: string;
  image?: {
    source: 'drive' | 'tautan';
    value: string;
  };
  options: QuizOption[];
  correctOptionId: string;
  delaySeconds?: number; // for Uji Pemahaman, default 10
}

export type PageType = 'materi' | 'game' | 'kuis_akhir';

export interface MaterialPage {
  id: string;
  type: PageType;
  title?: string; // internal identifier if needed
  blocks?: MaterialBlock[]; // for 'materi'
  question?: QuestionItem; // for 'materi' (Uji Pemahaman, optional)
  gameHtml?: string; // for 'game' (complete HTML)
  quizQuestions?: QuestionItem[]; // for 'kuis_akhir'
  maxAttempts?: number; // for 'kuis_akhir', 0 or undefined = unlimited
}

export interface Material {
  id: string;
  title: string;
  subject: string;
  targetClasses: string[];
  status: 'Tampil' | 'Sembunyi';
  order: number;
  pages: MaterialPage[];
}

export interface GradeRecord {
  id: string;
  studentNisn: string;
  studentName: string;
  className: string;
  subject: string;
  materialId: string;
  materialTitle: string;
  ujiPemahaman: number; // 0-100
  kuisAkhir: number; // 0-100, or -1 if none/not done
  nilaiAkhir: number; // weighted or -1 if waiting
  predikat: 'A' | 'B' | 'C' | 'D' | '-';
  updatedAt: string;
}

export interface GradeSettings {
  bobotUjiPemahaman: number; // default 30
  bobotKuisAkhir: number; // default 70
  kkm: number; // default 75
  batasA: number; // default 90
  batasB: number; // default 80
  batasC: number; // default 70
}

export interface CmsSettings {
  // 1. Identitas
  appName: string;
  institutionName: string;
  shortName: string;
  logoSource: 'drive' | 'tautan';
  logoValue: string;
  faviconValue: string;
  copyrightText: string;
  pageTitle: string;
  pageDescription: string;

  // 2. Layar Login
  loginWelcomeTitle: string;
  loginInstitutionName: string;
  loginWelcomeText: string;
  loginPasswordLabel: string;
  loginButtonLabel: string;
  loginErrorMessage: string;
  loginSpinLogo: boolean;
  loginSpinSpeed: number; // in seconds
  loginBackgroundType: 'gradient' | 'image';
  loginBackgroundImage: string;

  // 3. Tema
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorWarm: string;
  colorBgStart: string;
  colorBgMid: string;
  colorBgEnd: string;
  colorTextPrimary: string;
  colorTextSecondary: string;
  glassOpacity: number;
  glassContentOpacity: number;
  glassBlur: number;
  borderRadius: number;
  fontFamily: string;

  // 4. Sidebar & Menu
  labelRekapNilai: string;
  labelKeluar: string;
  sectionTitleMateri: string;
  showProfileCard: boolean;
  showOpenedCheckmark: boolean;
  groupBySubject: boolean;

  // 5. Tampilan Materi
  tabStyle: string;
  tabDefaultBg: string;
  tabDefaultTextColor: string;
  tabActiveBg: string;
  tabActiveTextColor: string;
  pageMarginX: number; // default 8
  contentFontSize: number;
  maxReadWidth: number;
  emptyMaterialText: string;

  // 6. Uji Pemahaman & Kuis Akhir
  popupSuccessText: string;
  popupDuration: number; // default 1.8
  questionDelaySeconds: number; // default 10
  btnPrev: string;
  btnNext: string;
  btnFinish: string;
  btnBack: string;
  btnConfirmFinish: string;
  confirmUnansweredText: string;
  quizResultTitle: string;
  numberUnansweredColor: string;
  numberAnsweredColor: string;

  // 7. Rekap Nilai
  rekapTitle: string;
  labelColSubject: string;
  labelColMaterial: string;
  labelColUjiPemahaman: string;
  labelColKuisAkhir: string;
  labelColNilaiAkhir: string;
  labelColPredikat: string;
  labelCardAvg: string;
  labelCardTuntas: string;
  labelCardDikerjakan: string;
  showSummaryCards: boolean;
  showGradeChart: boolean;
  predikatColorA: string;
  predikatColorB: string;
  predikatColorC: string;
  predikatColorD: string;

  // 8. Teks & Pesan
  msgCountdown: string;
  msgSaved: string;
  msgUploadFailed: string;
  msgEmptyData: string;
  msgEmptyGrade: string;
  msgPageNotFound: string;
  msgOfflineBadge: string;

  // 9. Fitur
  featureSpinLogo: boolean;
  featureRememberLast: boolean;
  featureOpenedMark: boolean;
  featureSummaryCards: boolean;
  featureGradeChart: boolean;
}

export interface SyncSettings {
  webAppUrl: string;
  token: string;
  driveFolderId: string;
  spreadsheetId: string;
  studentSheetName: string;
  gradesSheetName: string;
  lastConnectedStatus: 'Terhubung' | 'Gagal' | 'Belum Teruji';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  role: 'Admin';
  action: string;
}

export interface SessionUser {
  role: UserRole;
  student?: Student;
}
