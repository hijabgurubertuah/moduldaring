// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import {
  Student,
  Material,
  GradeRecord,
  GradeSettings,
  CmsSettings,
  SyncSettings,
  ActivityLog,
  SessionUser,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_MATERIALS,
  INITIAL_GRADES,
  INITIAL_GRADE_SETTINGS,
  INITIAL_CMS_SETTINGS,
  INITIAL_SYNC_SETTINGS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ADMIN_PASSWORD_HASH,
  calculateMaterialGrade,
} from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'smpn1_students',
  MATERIALS: 'smpn1_materials',
  GRADES: 'smpn1_grades',
  GRADE_SETTINGS: 'smpn1_grade_settings',
  CMS_SETTINGS: 'smpn1_cms_settings',
  SYNC_SETTINGS: 'smpn1_sync_settings',
  ACTIVITY_LOGS: 'smpn1_activity_logs',
  ADMIN_HASH: 'smpn1_admin_hash',
  SESSION: 'smpn1_session',
  OPENED_MATERI: 'smpn1_opened_materi_',
  LAST_VISITED: 'smpn1_last_visited_',
  FAILED_ATTEMPTS: 'smpn1_login_failed_attempts',
  LOCKOUT_TIME: 'smpn1_login_lockout_time',
  UJI_ATTEMPTS: 'smpn1_uji_',
  KUIS_ATTEMPTS: 'smpn1_kuis_attempts_',
  OFFLINE_QUEUE: 'smpn1_offline_grade_queue',
};

// Safe localStorage access
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export class StorageService {
  private static instance: StorageService;

  private students: Student[];
  private materials: Material[];
  private grades: GradeRecord[];
  private gradeSettings: GradeSettings;
  private cmsSettings: CmsSettings;
  private syncSettings: SyncSettings;
  private activityLogs: ActivityLog[];
  private adminHash: string;
  private session: (SessionUser & { expiresAt: number }) | null = null;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    this.materials = getStored(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
    this.grades = getStored(STORAGE_KEYS.GRADES, INITIAL_GRADES);
    this.gradeSettings = getStored(STORAGE_KEYS.GRADE_SETTINGS, INITIAL_GRADE_SETTINGS);
    this.cmsSettings = getStored(STORAGE_KEYS.CMS_SETTINGS, INITIAL_CMS_SETTINGS);
    this.syncSettings = getStored(STORAGE_KEYS.SYNC_SETTINGS, INITIAL_SYNC_SETTINGS);
    this.activityLogs = getStored(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    this.adminHash = getStored(STORAGE_KEYS.ADMIN_HASH, INITIAL_ADMIN_PASSWORD_HASH);

    // Load active session
    const storedSession = getStored<(SessionUser & { expiresAt: number }) | null>(STORAGE_KEYS.SESSION, null);
    if (storedSession && storedSession.expiresAt > Date.now()) {
      this.session = storedSession;
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }

    // Apply CMS theme variables to DOM immediately
    this.applyThemeToDOM(this.cmsSettings);

    // Set up auto retry for queued grades on online
    window.addEventListener('online', () => {
      this.processOfflineQueue();
    });
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // --- Theme Injection ---
  public applyThemeToDOM(cms: CmsSettings): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', cms.colorPrimary);
    root.style.setProperty('--color-secondary', cms.colorSecondary);
    root.style.setProperty('--color-accent', cms.colorAccent);
    root.style.setProperty('--color-warm', cms.colorWarm);
    root.style.setProperty('--color-bg-start', cms.colorBgStart);
    root.style.setProperty('--color-bg-mid', cms.colorBgMid);
    root.style.setProperty('--color-bg-end', cms.colorBgEnd);
    root.style.setProperty('--color-text-primary', cms.colorTextPrimary);
    root.style.setProperty('--color-text-secondary', cms.colorTextSecondary);
    root.style.setProperty('--glass-opacity', cms.glassOpacity.toString());
    root.style.setProperty('--glass-content-opacity', cms.glassContentOpacity.toString());
    root.style.setProperty('--glass-blur', `${cms.glassBlur}px`);
    root.style.setProperty('--border-radius', `${cms.borderRadius}px`);
    root.style.setProperty('--spin-speed', `${cms.loginSpinSpeed || 6}s`);
  }

  // --- Session Management ---
  public getSession(): SessionUser | null {
    if (!this.session) return null;
    if (Date.now() > this.session.expiresAt) {
      this.logout();
      return null;
    }
    return {
      role: this.session.role,
      student: this.session.student,
    };
  }

  public touchSession(): void {
    if (!this.session) return;
    const duration = this.session.role === 'Admin' ? 30 * 60 * 1000 : 60 * 60 * 1000;
    this.session.expiresAt = Date.now() + duration;
    setStored(STORAGE_KEYS.SESSION, this.session);
  }

  public loginAdmin(): void {
    const expiresAt = Date.now() + 30 * 60 * 1000;
    this.session = { role: 'Admin', expiresAt };
    setStored(STORAGE_KEYS.SESSION, this.session);
    this.resetFailedAttempts();
    this.notify();
  }

  public loginStudent(student: Student): void {
    const expiresAt = Date.now() + 60 * 60 * 1000;
    this.session = { role: 'Siswa', student, expiresAt };
    setStored(STORAGE_KEYS.SESSION, this.session);
    this.resetFailedAttempts();
    this.notify();
  }

  public logout(): void {
    this.session = null;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.notify();
  }

  // --- Failed Login Attempts ---
  public getFailedAttempts(): { count: number; lockoutUntil: number } {
    const count = getStored<number>(STORAGE_KEYS.FAILED_ATTEMPTS, 0);
    const lockoutUntil = getStored<number>(STORAGE_KEYS.LOCKOUT_TIME, 0);
    return { count, lockoutUntil };
  }

  public recordFailedAttempt(): { locked: boolean; remainingSec: number } {
    const current = this.getFailedAttempts();
    const newCount = current.count + 1;
    if (newCount >= 5) {
      const lockoutUntil = Date.now() + 30 * 1000;
      setStored(STORAGE_KEYS.FAILED_ATTEMPTS, 0);
      setStored(STORAGE_KEYS.LOCKOUT_TIME, lockoutUntil);
      return { locked: true, remainingSec: 30 };
    }
    setStored(STORAGE_KEYS.FAILED_ATTEMPTS, newCount);
    return { locked: false, remainingSec: 0 };
  }

  public resetFailedAttempts(): void {
    setStored(STORAGE_KEYS.FAILED_ATTEMPTS, 0);
    setStored(STORAGE_KEYS.LOCKOUT_TIME, 0);
  }

  // --- Students ---
  public getStudents(): Student[] {
    return [...this.students];
  }

  public getClasses(): string[] {
    const set = new Set<string>();
    this.students.forEach((s) => {
      if (s.className && s.className.trim()) set.add(s.className.trim());
    });
    return Array.from(set).sort();
  }

  public saveStudents(newStudents: Student[]): void {
    this.students = newStudents;
    setStored(STORAGE_KEYS.STUDENTS, this.students);
    this.logActivity('Memperbarui daftar siswa');
    this.notify();
  }

  public addStudent(student: Omit<Student, 'id'>): void {
    const newStudent: Student = {
      ...student,
      id: `std-${Date.now()}`,
    };
    this.students.push(newStudent);
    setStored(STORAGE_KEYS.STUDENTS, this.students);
    this.logActivity(`Menambah siswa ${student.name}`);
    this.notify();
  }

  public updateStudent(student: Student): void {
    this.students = this.students.map((s) => (s.nisn === student.nisn || s.id === student.id ? student : s));
    setStored(STORAGE_KEYS.STUDENTS, this.students);
    this.logActivity(`Memperbarui data siswa ${student.name}`);
    this.notify();
  }

  public deleteStudent(idOrNisn: string): void {
    const target = this.students.find((s) => s.id === idOrNisn || s.nisn === idOrNisn);
    this.students = this.students.filter((s) => s.id !== idOrNisn && s.nisn !== idOrNisn);
    setStored(STORAGE_KEYS.STUDENTS, this.students);
    if (target) {
      this.logActivity(`Menghapus siswa ${target.name}`);
    }
    this.notify();
  }

  // --- Materials ---
  public getMaterials(): Material[] {
    return [...this.materials].sort((a, b) => a.order - b.order);
  }

  public getMaterialById(id: string): Material | undefined {
    return this.materials.find((m) => m.id === id);
  }

  public saveMaterials(materials: Material[]): void {
    this.materials = materials;
    setStored(STORAGE_KEYS.MATERIALS, this.materials);
    this.logActivity('Memperbarui daftar materi');
    this.notify();
  }

  public saveMaterial(material: Material): void {
    const idx = this.materials.findIndex((m) => m.id === material.id);
    if (idx >= 0) {
      this.materials[idx] = material;
    } else {
      this.materials.push(material);
    }
    setStored(STORAGE_KEYS.MATERIALS, this.materials);
    this.logActivity(`Menyimpan materi ${material.title}`);
    this.notify();
  }

  public deleteMaterial(id: string): void {
    const m = this.materials.find((item) => item.id === id);
    this.materials = this.materials.filter((item) => item.id !== id);
    setStored(STORAGE_KEYS.MATERIALS, this.materials);
    if (m) {
      this.logActivity(`Menghapus materi ${m.title}`);
    }
    this.notify();
  }

  // --- Grades (Evaluasi Uji Pemahaman & Kuis Akhir) ---
  public getGrades(): GradeRecord[] {
    return [...this.grades];
  }

  public getGradesByNisn(nisn: string): GradeRecord[] {
    return this.grades.filter((g) => g.studentNisn === nisn);
  }

  public getGradesForStudent(nisn: string): GradeRecord[] {
    return this.getGradesByNisn(nisn);
  }

  public saveGrades(newRecords: GradeRecord[]): void {
    const map = new Map<string, GradeRecord>();
    this.grades.forEach((g) => {
      map.set(`${g.studentNisn}___${g.materialId}`, g);
    });
    newRecords.forEach((r) => {
      map.set(`${r.studentNisn}___${r.materialId}`, r);
    });
    this.grades = Array.from(map.values());
    setStored(STORAGE_KEYS.GRADES, this.grades);
    this.logActivity('Menyimpan rekap nilai');
    this.notify();
  }

  public getGradeSettings(): GradeSettings {
    return { ...this.gradeSettings };
  }

  public saveGradeSettings(settings: GradeSettings): void {
    this.gradeSettings = settings;
    setStored(STORAGE_KEYS.GRADE_SETTINGS, this.gradeSettings);
    // Recalculate grades with new settings
    this.grades = this.grades.map((g) => {
      const mat = this.materials.find((m) => m.id === g.materialId);
      const hasKuis = mat ? mat.pages.some((p) => p.type === 'kuis_akhir') : g.kuisAkhir >= 0;
      const { nilaiAkhir, predikat } = calculateMaterialGrade(
        g.ujiPemahaman,
        g.kuisAkhir,
        hasKuis,
        settings
      );
      return { ...g, nilaiAkhir, predikat };
    });
    setStored(STORAGE_KEYS.GRADES, this.grades);
    this.logActivity('Memperbarui pengaturan nilai');
    this.notify();
  }

  // --- Uji Pemahaman Question State ---
  public getUjiStatus(
    studentNisn: string,
    materialId: string,
    pageId: string
  ): { isAnswered: boolean; attempts: number; score: number; selectedOptionId?: string } {
    const key = `${STORAGE_KEYS.UJI_ATTEMPTS}${studentNisn}_${materialId}_${pageId}`;
    return getStored(key, { isAnswered: false, attempts: 0, score: 0 });
  }

  public recordUjiAttempt(
    studentNisn: string,
    materialId: string,
    pageId: string,
    isCorrect: boolean,
    selectedOptionId: string
  ): { isAnswered: boolean; attempts: number; score: number } {
    const key = `${STORAGE_KEYS.UJI_ATTEMPTS}${studentNisn}_${materialId}_${pageId}`;
    const curr = getStored(key, { isAnswered: false, attempts: 0, score: 0, selectedOptionId: '' });

    if (curr.isAnswered) {
      return curr;
    }

    const newAttempts = curr.attempts + 1;
    let newScore = 0;
    if (isCorrect) {
      newScore = Math.round(100 / newAttempts);
    }

    const updated = {
      isAnswered: isCorrect,
      attempts: newAttempts,
      score: newScore,
      selectedOptionId,
    };
    setStored(key, updated);

    if (isCorrect) {
      this.recalculateAndSyncStudentGrade(studentNisn, materialId);
    }

    return updated;
  }

  // --- Kuis Akhir Result Record ---
  public getKuisAttempts(studentNisn: string, materialId: string): number {
    const key = `${STORAGE_KEYS.KUIS_ATTEMPTS}${studentNisn}_${materialId}`;
    return getStored(key, 0);
  }

  public recordKuisAkhirScore(
    studentNisn: string,
    materialId: string,
    score: number
  ): { finalScore: number; attempts: number } {
    const key = `${STORAGE_KEYS.KUIS_ATTEMPTS}${studentNisn}_${materialId}`;
    const currentAttempts = getStored(key, 0) + 1;
    setStored(key, currentAttempts);

    this.recalculateAndSyncStudentGrade(studentNisn, materialId, score);
    return { finalScore: score, attempts: currentAttempts };
  }

  // Recalculates student's GradeRecord for this material and syncs to Apps Script
  private recalculateAndSyncStudentGrade(studentNisn: string, materialId: string, newKuisScore?: number) {
    const mat = this.materials.find((m) => m.id === materialId);
    if (!mat) return;
    const student = this.students.find((s) => s.nisn === studentNisn);
    if (!student) return;

    // Calculate Uji Pemahaman average across all pages with questions
    const pagesWithQuestion = mat.pages.filter((p) => p.type === 'materi' && p.question);
    let totalUjiScore = 0;
    let answeredCount = 0;

    pagesWithQuestion.forEach((p) => {
      const status = this.getUjiStatus(studentNisn, materialId, p.id);
      if (status.isAnswered) {
        totalUjiScore += status.score;
        answeredCount++;
      }
    });

    const avgUji = answeredCount > 0 ? Math.round(totalUjiScore / pagesWithQuestion.length) : -1;

    // Check existing record to keep highest score
    const existingIdx = this.grades.findIndex(
      (g) => g.studentNisn === studentNisn && g.materialId === materialId
    );
    const existing = existingIdx >= 0 ? this.grades[existingIdx] : null;

    let kuisScore = existing ? existing.kuisAkhir : -1;
    if (newKuisScore !== undefined) {
      kuisScore = Math.max(kuisScore, newKuisScore);
    }

    const ujiToUse = existing ? Math.max(existing.ujiPemahaman, avgUji) : avgUji;
    const hasKuis = mat.pages.some((p) => p.type === 'kuis_akhir');

    const { nilaiAkhir, predikat } = calculateMaterialGrade(
      ujiToUse >= 0 ? ujiToUse : 0,
      kuisScore,
      hasKuis,
      this.gradeSettings
    );

    const updatedRecord: GradeRecord = {
      id: existing ? existing.id : `grd-${studentNisn}-${materialId}`,
      studentNisn,
      studentName: student.name,
      className: student.className,
      subject: mat.subject,
      materialId: mat.id,
      materialTitle: mat.title,
      ujiPemahaman: ujiToUse,
      kuisAkhir: kuisScore,
      nilaiAkhir,
      predikat,
      updatedAt: new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    if (existingIdx >= 0) {
      this.grades[existingIdx] = updatedRecord;
    } else {
      this.grades.push(updatedRecord);
    }
    setStored(STORAGE_KEYS.GRADES, this.grades);
    this.notify();

    // Auto send to spreadsheet
    this.sendGradeToAppsScript(updatedRecord);
  }

  // Auto sync grade to Apps Script with offline queue
  public async sendGradeToAppsScript(record: GradeRecord): Promise<void> {
    const sync = this.getSyncSettings();
    if (!sync.webAppUrl || !navigator.onLine) {
      this.queueOfflineGrade(record);
      return;
    }

    try {
      const resp = await fetch(sync.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveStudentGrade',
          record,
        }),
      });
      const res = await resp.json();
      if (!res || !res.success) {
        this.queueOfflineGrade(record);
      }
    } catch {
      this.queueOfflineGrade(record);
    }
  }

  private queueOfflineGrade(record: GradeRecord): void {
    const queue = getStored<GradeRecord[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    const idx = queue.findIndex(
      (r) => r.studentNisn === record.studentNisn && r.materialId === record.materialId
    );
    if (idx >= 0) {
      queue[idx] = record;
    } else {
      queue.push(record);
    }
    setStored(STORAGE_KEYS.OFFLINE_QUEUE, queue);
  }

  private async processOfflineQueue(): Promise<void> {
    const queue = getStored<GradeRecord[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    if (queue.length === 0) return;

    const sync = this.getSyncSettings();
    if (!sync.webAppUrl || !navigator.onLine) return;

    const remaining: GradeRecord[] = [];
    for (const record of queue) {
      try {
        const resp = await fetch(sync.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'saveStudentGrade', record }),
        });
        const res = await resp.json();
        if (!res || !res.success) {
          remaining.push(record);
        }
      } catch {
        remaining.push(record);
      }
    }
    setStored(STORAGE_KEYS.OFFLINE_QUEUE, remaining);
  }

  // --- CMS Settings ---
  public getCmsSettings(): CmsSettings {
    return { ...this.cmsSettings };
  }

  public saveCmsSettings(newCms: CmsSettings): void {
    this.cmsSettings = newCms;
    setStored(STORAGE_KEYS.CMS_SETTINGS, this.cmsSettings);
    this.applyThemeToDOM(this.cmsSettings);
    this.logActivity('Memperbarui pengaturan CMS');
    this.notify();
  }

  // --- Sync Settings ---
  public getSyncSettings(): SyncSettings {
    return { ...this.syncSettings };
  }

  public saveSyncSettings(newSync: SyncSettings): void {
    this.syncSettings = newSync;
    setStored(STORAGE_KEYS.SYNC_SETTINGS, this.syncSettings);
    this.logActivity('Memperbarui konfigurasi sinkronisasi');
    this.notify();
  }

  // --- Activity Logs ---
  public getActivityLogs(): ActivityLog[] {
    return [...this.activityLogs];
  }

  public logActivity(action: string): void {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      role: 'Admin',
      action,
    };
    this.activityLogs.unshift(newLog);
    if (this.activityLogs.length > 100) this.activityLogs.pop();
    setStored(STORAGE_KEYS.ACTIVITY_LOGS, this.activityLogs);
  }

  // --- Admin Password ---
  public getAdminPasswordHash(): string {
    return this.adminHash;
  }

  public saveAdminPasswordHash(newHash: string): void {
    this.adminHash = newHash;
    setStored(STORAGE_KEYS.ADMIN_HASH, this.adminHash);
    this.logActivity('Mengubah kata sandi Admin');
    this.notify();
  }

  // --- Student Progress & Last Visited ---
  public getOpenedMaterials(studentNisn: string): Set<string> {
    const list = getStored<string[]>(STORAGE_KEYS.OPENED_MATERI + studentNisn, []);
    return new Set(list);
  }

  public markMaterialOpened(studentNisn: string, materialId: string): void {
    const set = this.getOpenedMaterials(studentNisn);
    if (!set.has(materialId)) {
      set.add(materialId);
      setStored(STORAGE_KEYS.OPENED_MATERI + studentNisn, Array.from(set));
      this.notify();
    }
  }

  public getLastVisited(studentNisn: string): { materialId: string; pageId?: string } | null {
    return getStored<{ materialId: string; pageId?: string } | null>(
      STORAGE_KEYS.LAST_VISITED + studentNisn,
      null
    );
  }

  public setLastVisited(studentNisn: string, materialId: string, pageId?: string): void {
    setStored(STORAGE_KEYS.LAST_VISITED + studentNisn, { materialId, pageId });
  }

  // --- Google Apps Script Online Calls ---
  public async verifyNisnWithAppsScript(nisn: string): Promise<{ success: boolean; data?: Student; error?: string }> {
    const sync = this.getSyncSettings();
    if (!sync.webAppUrl || sync.lastConnectedStatus !== 'Terhubung') {
      const found = this.students.find((s) => s.nisn === nisn.trim());
      if (found) return { success: true, data: found };
      return { success: false, error: 'NISN tidak terdaftar' };
    }

    try {
      const resp = await fetch(sync.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'verifyNisn', nisn }),
      });
      const json = await resp.json();
      return json;
    } catch {
      const found = this.students.find((s) => s.nisn === nisn.trim());
      if (found) return { success: true, data: found };
      return { success: false, error: 'Koneksi gagal' };
    }
  }

  public async getStudentGradesFromAppsScript(nisn: string): Promise<GradeRecord[]> {
    const sync = this.getSyncSettings();
    if (!sync.webAppUrl || sync.lastConnectedStatus !== 'Terhubung') {
      return this.getGradesByNisn(nisn);
    }
    try {
      const resp = await fetch(sync.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getStudentGrades', nisn }),
      });
      const json = await resp.json();
      if (json && json.success && Array.isArray(json.data)) {
        return json.data;
      }
    } catch {
      // Fallback
    }
    return this.getGradesByNisn(nisn);
  }
}
