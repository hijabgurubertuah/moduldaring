// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Settings, Save, Download, Upload, Printer, RotateCw } from 'lucide-react';
import { GradeRecord, GradeSettings } from '../../types';
import { StorageService } from '../../services/storageService';
import { calculateGrade } from '../../data/initialData';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';

interface AdminGradesProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminGrades: React.FC<AdminGradesProps> = ({ onShowToast }) => {
  const storage = StorageService.getInstance();
  const classes = storage.getClasses();
  const subjects = ['Matematika', 'IPA', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPS', 'PPKn'];

  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || 'VII A');
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]);
  const [gradeSettings, setGradeSettings] = useState<GradeSettings>(storage.getGradeSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Draft grades state (per student in chosen class & subject)
  const studentsInClass = useMemo(() => {
    return storage.getStudents().filter((s) => s.className === selectedClass);
  }, [selectedClass, storage]);

  const [draftRecords, setDraftRecords] = useState<GradeRecord[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draftRecords whenever selectedClass or selectedSubject changes
  useEffect(() => {
    const allGrades = storage.getGrades();
    const list: GradeRecord[] = studentsInClass.map((student) => {
      const existing = allGrades.find(
        (g) => g.studentNisn === student.nisn && g.subject === selectedSubject
      );
      if (existing) {
        return { ...existing };
      }
      const initialCalc = calculateGrade(75, 75, 75, 75, gradeSettings);
      return {
        id: `grd-${student.nisn}-${selectedSubject}`,
        studentNisn: student.nisn,
        studentName: student.name,
        className: student.className,
        subject: selectedSubject,
        tugas: 75,
        kuis: 75,
        uts: 75,
        uas: 75,
        nilaiAkhir: initialCalc.nilaiAkhir,
        predikat: initialCalc.predikat,
        updatedAt: '',
      };
    });
    setDraftRecords(list);
    setHasChanges(false);
  }, [selectedClass, selectedSubject, studentsInClass, gradeSettings]);

  // Handle score edit with 0-100 validation
  const handleScoreChange = (
    nisn: string,
    field: 'tugas' | 'kuis' | 'uts' | 'uas',
    value: string
  ) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0;
    num = Math.max(0, Math.min(100, num));

    setDraftRecords((prev) =>
      prev.map((r) => {
        if (r.studentNisn !== nisn) return r;
        const updated = { ...r, [field]: num };
        const calc = calculateGrade(
          updated.tugas,
          updated.kuis,
          updated.uts,
          updated.uas,
          gradeSettings
        );
        updated.nilaiAkhir = calc.nilaiAkhir;
        updated.predikat = calc.predikat;
        return updated;
      })
    );
    setHasChanges(true);
  };

  // Save changes to persistent storage / spreadsheet
  const handleSave = () => {
    storage.saveGrades(draftRecords);
    setHasChanges(false);
    onShowToast('Berhasil disimpan');
  };

  // Export CSV
  const handleExportCSV = () => {
    const header = 'NISN,Nama,Kelas,Mata Pelajaran,Tugas,Kuis,UTS,UAS,Nilai Akhir,Predikat\n';
    const rows = draftRecords
      .map(
        (r) =>
          `"'${r.studentNisn}","${r.studentName}","${r.className}","${r.subject}",${r.tugas},${r.kuis},${r.uts},${r.uas},${r.nilaiAkhir},"${r.predikat}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nilai_${selectedClass}_${selectedSubject}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Berhasil diunduh');
  };

  // Import CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const updatedList = [...draftRecords];
      let updatedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map((p) => p.replace(/^["']|["']$/g, '').trim());
        if (parts.length >= 8) {
          const [nisn, , , , sTugas, sKuis, sUts, sUas] = parts;
          const target = updatedList.find((r) => r.studentNisn === nisn);
          if (target) {
            target.tugas = Math.max(0, Math.min(100, Number(sTugas) || 0));
            target.kuis = Math.max(0, Math.min(100, Number(sKuis) || 0));
            target.uts = Math.max(0, Math.min(100, Number(sUts) || 0));
            target.uas = Math.max(0, Math.min(100, Number(sUas) || 0));
            const calc = calculateGrade(target.tugas, target.kuis, target.uts, target.uas, gradeSettings);
            target.nilaiAkhir = calc.nilaiAkhir;
            target.predikat = calc.predikat;
            updatedCount++;
          }
        }
      }

      if (updatedCount > 0) {
        setDraftRecords(updatedList);
        setHasChanges(true);
        onShowToast(`Berhasil memperbarui ${updatedCount} nilai`);
      } else {
        onShowToast('Format data tidak sesuai', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Reload grades
  const handleReload = () => {
    const allGrades = storage.getGrades();
    setDraftRecords((prev) =>
      prev.map((r) => {
        const found = allGrades.find(
          (g) => g.studentNisn === r.studentNisn && g.subject === r.subject
        );
        return found ? { ...found } : r;
      })
    );
    setHasChanges(false);
    onShowToast('Data diperbarui');
  };

  const getPredikatBadgeStyle = (predikat: string) => {
    switch (predikat) {
      case 'A':
        return 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/40';
      case 'B':
        return 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/40';
      case 'C':
        return 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/40';
      default:
        return 'bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]/40';
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#ECFEFF]">Manajemen Nilai</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-1.5" />
            <span>Impor</span>
          </GlassButton>
          <GlassButton variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            <span>Ekspor</span>
          </GlassButton>
          <GlassButton variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Cetak</span>
          </GlassButton>
          <GlassButton variant="secondary" size="sm" onClick={handleReload}>
            <RotateCw className="w-4 h-4" />
          </GlassButton>
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="w-4 h-4 mr-1.5" />
            <span>Pengaturan Nilai</span>
          </GlassButton>
          <GlassButton
            variant="primary"
            size="sm"
            disabled={!hasChanges}
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Simpan</span>
          </GlassButton>
        </div>
      </div>

      {/* Class and Subject Selectors */}
      <GlassCard className="no-print p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-[#A5D8D3] font-medium shrink-0">Kelas:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#0B4F4A] border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-[#A5D8D3] font-medium shrink-0">Mata Pelajaran:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#0B4F4A] border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Clean Print Header */}
      <div className="hidden print:block mb-4 text-center">
        <h1 className="text-xl font-bold uppercase text-black">SMP NEGERI 1 BENGKALIS</h1>
        <h2 className="text-base font-semibold text-black mt-1">
          Rekap Nilai Siswa: {selectedSubject} — Kelas {selectedClass}
        </h2>
      </div>

      {/* Grades Table */}
      <GlassCard className="overflow-hidden print-card">
        {draftRecords.length === 0 ? (
          <div className="p-12 text-center text-[#A5D8D3]">
            <h3 className="text-base font-semibold">Belum ada siswa pada kelas ini</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-white/10 border-b border-white/15 text-[#2DD4BF] font-semibold print:text-black">
                  <th className="px-4 py-3.5 w-12 text-center">No</th>
                  <th className="px-4 py-3.5">Nama Siswa</th>
                  <th className="px-4 py-3.5">NISN</th>
                  <th className="px-4 py-3.5 w-24 text-center">Tugas</th>
                  <th className="px-4 py-3.5 w-24 text-center">Kuis</th>
                  <th className="px-4 py-3.5 w-24 text-center">UTS</th>
                  <th className="px-4 py-3.5 w-24 text-center">UAS</th>
                  <th className="px-4 py-3.5 w-24 text-center">Nilai Akhir</th>
                  <th className="px-4 py-3.5 w-24 text-center">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 print:divide-gray-300">
                {draftRecords.map((r, idx) => (
                  <tr key={r.studentNisn} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-center text-[#A5D8D3] print:text-black">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#ECFEFF] print:text-black">
                      {r.studentName}
                    </td>
                    <td className="px-4 py-3 text-[#A5D8D3] font-mono tabular-nums print:text-black">
                      {r.studentNisn}
                    </td>
                    {/* Inline score inputs */}
                    <td className="px-2 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={r.tugas}
                        onChange={(e) => handleScoreChange(r.studentNisn, 'tugas', e.target.value)}
                        className="w-16 min-h-[38px] text-center bg-white/10 border border-white/20 rounded-lg text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] font-mono tabular-nums print:border-none print:text-black"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={r.kuis}
                        onChange={(e) => handleScoreChange(r.studentNisn, 'kuis', e.target.value)}
                        className="w-16 min-h-[38px] text-center bg-white/10 border border-white/20 rounded-lg text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] font-mono tabular-nums print:border-none print:text-black"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={r.uts}
                        onChange={(e) => handleScoreChange(r.studentNisn, 'uts', e.target.value)}
                        className="w-16 min-h-[38px] text-center bg-white/10 border border-white/20 rounded-lg text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] font-mono tabular-nums print:border-none print:text-black"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={r.uas}
                        onChange={(e) => handleScoreChange(r.studentNisn, 'uas', e.target.value)}
                        className="w-16 min-h-[38px] text-center bg-white/10 border border-white/20 rounded-lg text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] font-mono tabular-nums print:border-none print:text-black"
                      />
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-base tabular-nums print:text-black">
                      {r.nilaiAkhir}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPredikatBadgeStyle(
                          r.predikat
                        )} print:text-black print:border-gray-400`}
                      >
                        {r.predikat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Dialog: Pengaturan Nilai */}
      {isSettingsOpen && (
        <SettingsModal
          settings={gradeSettings}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(newSettings) => {
            storage.saveGradeSettings(newSettings);
            setGradeSettings(newSettings);
            setIsSettingsOpen(false);
            onShowToast('Pengaturan nilai disimpan');
          }}
        />
      )}
    </div>
  );
};

// Modal dialog for grade formula configuration
const SettingsModal: React.FC<{
  settings: GradeSettings;
  onClose: () => void;
  onSave: (s: GradeSettings) => void;
}> = ({ settings, onClose, onSave }) => {
  const [draft, setDraft] = useState<GradeSettings>({ ...settings });
  const [error, setError] = useState('');

  const totalBobot = draft.bobotTugas + draft.bobotKuis + draft.bobotUts + draft.bobotUas;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalBobot !== 100) {
      setError('Total bobot harus bernilai 100%');
      return;
    }
    onSave(draft);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-[#ECFEFF] mb-4">Pengaturan Nilai</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A5D8D3]">Bobot Tugas (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.bobotTugas}
                  onChange={(e) =>
                    setDraft({ ...draft, bobotTugas: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-[#A5D8D3]">Bobot Kuis (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.bobotKuis}
                  onChange={(e) =>
                    setDraft({ ...draft, bobotKuis: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-[#A5D8D3]">Bobot UTS (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.bobotUts}
                  onChange={(e) =>
                    setDraft({ ...draft, bobotUts: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-[#A5D8D3]">Bobot UAS (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.bobotUas}
                  onChange={(e) =>
                    setDraft({ ...draft, bobotUas: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold px-1">
              <span className="text-[#A5D8D3]">Total Bobot:</span>
              <span className={totalBobot === 100 ? 'text-[#34D399]' : 'text-red-400'}>
                {totalBobot}%
              </span>
            </div>

            <hr className="border-t border-white/10" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A5D8D3]">KKM</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.kkm}
                  onChange={(e) => setDraft({ ...draft, kkm: parseInt(e.target.value, 10) || 0 })}
                  className="w-full min-h-[44px] px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-[#A5D8D3]">Batas Nilai A</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.batasA}
                  onChange={(e) =>
                    setDraft({ ...draft, batasA: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1"
                />
              </div>
            </div>

            {error && <span className="text-xs text-red-400 font-medium">{error}</span>}

            <div className="flex items-center justify-end gap-3 mt-4">
              <GlassButton type="button" variant="secondary" onClick={onClose}>
                Batal
              </GlassButton>
              <GlassButton type="submit" variant="primary">
                Simpan
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
