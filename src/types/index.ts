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

export interface MaterialPage {
  id: string;
  title: string;
  blocks: MaterialBlock[];
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
  tugas: number;
  kuis: number;
  uts: number;
  uas: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  updatedAt: string;
}

export interface GradeSettings {
  bobotTugas: number;
  bobotKuis: number;
  bobotUts: number;
  bobotUas: number;
  kkm: number;
  batasA: number;
  batasB: number;
  batasC: number;
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
  sectionTitleMateri: string;
  labelKeluar: string;
  showProfileCard: boolean;
  groupBySubject: boolean;

  // 5. Tampilan Materi
  tabStyle: 'pill' | 'underline';
  contentFontSize: number;
  maxReadWidth: number;
  showOpenedCheckmark: boolean;
  emptyMaterialText: string;

  // 6. Rekap Nilai
  rekapTitle: string;
  labelColSubject: string;
  labelColTugas: string;
  labelColKuis: string;
  labelColUts: string;
  labelColUas: string;
  labelColAkhir: string;
  labelColPredikat: string;
  labelAvgCard: string;
  labelTuntasCard: string;
  labelProgressCard: string;
  showSummaryCards: boolean;
  showGradeChart: boolean;
  predikatColorA: string;
  predikatColorB: string;
  predikatColorC: string;
  predikatColorD: string;

  // 7. Teks & Pesan
  msgCountdown: string;
  msgSaved: string;
  msgUploadFailed: string;
  msgEmptyData: string;
  msgEmptyGrade: string;
  msgPageNotFound: string;
  msgOfflineBadge: string;

  // 8. Fitur
  featureSpinLogo: boolean;
  featureOpenedMark: boolean;
  featureRememberLast: boolean;
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
