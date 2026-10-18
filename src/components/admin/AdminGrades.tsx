// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Settings, Save, Download, Upload, Printer, RotateCw } from 'lucide-react';
import { GradeRecord, GradeSettings, Material } from '../../types';
import { StorageService } from '../../services/storageService';
import { calculateMaterialGrade } from '../../data/initialData';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassSelect } from '../common/GlassSelect';

interface AdminGradesProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminGrades: React.FC<AdminGradesProps> = ({ onShowToast }) => {
  const storage = StorageService.getInstance();
  const classes = storage.getClasses();
  const allMaterials = storage.getMaterials();

  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || 'VII A');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    allMaterials[0]?.id || ''
  );
  const [gradeSettings, setGradeSettings] = useState<GradeSettings>(storage.getGradeSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter materials for this class
  const classMaterials = useMemo(() => {
    return allMaterials.filter(
      (m) =>
        m.targetClasses.includes('Semua Kelas') || m.targetClasses.includes(selectedClass)
    );
  }, [allMaterials, selectedClass]);

  // Ensure selected material is valid for selected class
  useEffect(() => {
    if (classMaterials.length > 0) {
      const exists = classMaterials.some((m) => m.id === selectedMaterialId);
      if (!exists) {
        setSelectedMaterialId(classMaterials[0].id);
      }
    }
  }, [classMaterials, selectedMaterialId]);

  const currentMaterial = useMemo(() => {
    return allMaterials.find((m) => m.id === selectedMaterialId) || allMaterials[0];
  }, [allMaterials, selectedMaterialId]);

  const hasKuis = useMemo(() => {
    return currentMaterial ? currentMaterial.pages.some((p) => p.type === 'kuis_akhir') : false;
  }, [currentMaterial]);

  // Students in selected class
  const studentsInClass = useMemo(() => {
    return storage.getStudents().filter((s) => s.className === selectedClass);
  }, [selectedClass, storage]);

  // Draft records per student for this class & material
  const [draftRecords, setDraftRecords] = useState<GradeRecord[]>([]);

  useEffect(() => {
    if (!currentMaterial) {
      setDraftRecords([]);
      return;
    }

    const allGrades = storage.getGrades();
    const list: GradeRecord[] = studentsInClass.map((student) => {
      const existing = allGrades.find(
        (g) => g.studentNisn === student.nisn && g.materialId === currentMaterial.id
      );
      if (existing) {
        return { ...existing };
      }

      // Default new record
      const defaultUji = 80;
      const defaultKuis = hasKuis ? 80 : -1;
      const { nilaiAkhir, predikat } = calculateMaterialGrade(
        defaultUji,
        defaultKuis,
        hasKuis,
        gradeSettings
      );

      return {
        id: `grd-${student.nisn}-${currentMaterial.id}`,
        studentNisn: student.nisn,
        studentName: student.name,
        className: student.className,
        subject: currentMaterial.subject,
        materialId: currentMaterial.id,
        materialTitle: currentMaterial.title,
        ujiPemahaman: defaultUji,
        kuisAkhir: defaultKuis,
        nilaiAkhir,
        predikat,
        updatedAt: '',
      };
    });

    setDraftRecords(list);
    setHasChanges(false);
  }, [selectedClass, currentMaterial, studentsInClass, hasKuis, gradeSettings]);

  // Edit score
  const handleScoreChange = (
    nisn: string,
    field: 'ujiPemahaman' | 'kuisAkhir',
    value: string
  ) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = -1;
    if (num > 100) num = 100;

    setDraftRecords((prev) =>
      prev.map((r) => {
        if (r.studentNisn !== nisn) return r;
        const updated = { ...r, [field]: num };
        const calc = calculateMaterialGrade(
          updated.ujiPemahaman,
          updated.kuisAkhir,
          hasKuis,
          gradeSettings
        );
        updated.nilaiAkhir = calc.nilaiAkhir;
        updated.predikat = calc.predikat;
        updated.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        return updated;
      })
    );
    setHasChanges(true);
  };

  // Save changes
  const handleSave = () => {
    storage.saveGrades(draftRecords);
    setHasChanges(false);
    onShowToast('Berhasil disimpan');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!currentMaterial) return;
    const header = 'NISN,Nama,Kelas,Mata Pelajaran,Materi,Uji Pemahaman,Kuis Akhir,Nilai Akhir,Predikat,Waktu\n';
    const rows = draftRecords
      .map(
        (r) =>
          `"'${r.studentNisn}","${r.studentName}","${r.className}","${r.subject}","${r.materialTitle}",${r.ujiPemahaman},${r.kuisAkhir},${r.nilaiAkhir},"${r.predikat}","${r.updatedAt}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nilai_${selectedClass}_${currentMaterial.title.replace(/\s+/g, '_')}.csv`);
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
        if (parts.length >= 7) {
          const [nisn, , , , , sUji, sKuis] = parts;
          const target = updatedList.find((r) => r.studentNisn === nisn);
          if (target) {
            target.ujiPemahaman = Math.max(0, Math.min(100, Number(sUji) || 0));
            target.kuisAkhir = hasKuis ? Math.max(0, Math.min(100, Number(sKuis) || 0)) : -1;
            const calc = calculateMaterialGrade(
              target.ujiPemahaman,
              target.kuisAkhir,
              hasKuis,
              gradeSettings
            );
            target.nilaiAkhir = calc.nilaiAkhir;
            target.predikat = calc.predikat;
            target.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
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
          (g) => g.studentNisn === r.studentNisn && g.materialId === r.materialId
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
      case 'D':
        return 'bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]/40';
      default:
        return 'bg-white/10 text-[#A5D8D3] border-white/20';
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

      {/* Class and Material Selectors */}
      <GlassCard className="no-print p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <label className="text-xs text-[#A5D8D3] font-medium shrink-0">Kelas:</label>
          <div className="flex-1">
            <GlassSelect
              value={selectedClass}
              onChange={setSelectedClass}
              options={classes}
              ariaLabel="Pilih Kelas"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <label className="text-xs text-[#A5D8D3] font-medium shrink-0">Materi:</label>
          <div className="flex-1">
            <GlassSelect
              value={selectedMaterialId}
              onChange={setSelectedMaterialId}
              options={classMaterials.map((m) => ({
                value: m.id,
                label: `${m.subject} — ${m.title}`,
              }))}
              ariaLabel="Pilih Materi"
            />
          </div>
        </div>
      </GlassCard>

      {/* Clean Print Header */}
      <div className="hidden print:block mb-4 text-center">
        <h1 className="text-xl font-bold uppercase text-black">SMP NEGERI 1 BENGKALIS</h1>
        <h2 className="text-base font-semibold text-black mt-1">
          Rekap Nilai: {currentMaterial?.subject} ({currentMaterial?.title}) — Kelas {selectedClass}
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
                  <th className="px-4 py-3.5 w-32 text-center">Uji Pemahaman</th>
                  <th className="px-4 py-3.5 w-32 text-center">Kuis Akhir</th>
                  <th className="px-4 py-3.5 w-24 text-center">Nilai Akhir</th>
                  <th className="px-4 py-3.5 w-24 text-center">Predikat</th>
                  <th className="px-4 py-3.5 text-center hidden md:table-cell">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 print:divide-gray-300">
                {draftRecords.map((r, idx) => {
                  const isBelowKKM = r.nilaiAkhir >= 0 && r.nilaiAkhir < gradeSettings.kkm;
                  return (
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
                      <td className="px-2 py-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={r.ujiPemahaman >= 0 ? r.ujiPemahaman : ''}
                          onChange={(e) =>
                            handleScoreChange(r.studentNisn, 'ujiPemahaman', e.target.value)
                          }
                          className="w-16 min-h-[38px] text-center bg-white/10 border border-white/20 rounded-lg text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] font-mono tabular-nums print:border-none print:text-black"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        {hasKuis ? (
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={r.kuisAkhir >= 0 ? r.kuisAkhir : ''}
                            onChange={(e) =>
                              handleScoreChange(r.studentNisn, 'kuisAkhir', e.target.value)
                            }
                            className="w-16 min-h-[38px] text-center bg-white/10 border border-white/20 rounded-lg text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] font-mono tabular-nums print:border-none print:text-black"
                          />
                        ) : (
                          <span className="text-xs text-[#A5D8D3] italic">-</span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 text-center font-bold text-base tabular-nums print:text-black ${
                          isBelowKKM ? 'text-[#FB923C]' : 'text-[#ECFEFF]'
                        }`}
                      >
                        {r.nilaiAkhir >= 0 ? r.nilaiAkhir : '-'}
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
                      <td className="px-4 py-3 text-center text-xs text-[#A5D8D3] font-mono hidden md:table-cell print:text-black">
                        {r.updatedAt || '-'}
                      </td>
                    </tr>
                  );
                })}
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
  onCloseDirect?: () => void;
}> = ({ settings, onClose, onSave }) => {
  const [draft, setDraft] = useState<GradeSettings>({ ...settings });
  const [error, setError] = useState('');

  const totalBobot = draft.bobotUjiPemahaman + draft.bobotKuisAkhir;

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
                <label className="text-xs text-[#A5D8D3]">Bobot Uji Pemahaman (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.bobotUjiPemahaman}
                  onChange={(e) =>
                    setDraft({ ...draft, bobotUjiPemahaman: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-[#A5D8D3]">Bobot Kuis Akhir (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.bobotKuisAkhir}
                  onChange={(e) =>
                    setDraft({ ...draft, bobotKuisAkhir: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[#A5D8D3]">Total Bobot:</span>
              <span
                className={`font-bold font-mono ${
                  totalBobot === 100 ? 'text-[#34D399]' : 'text-red-400'
                }`}
              >
                {totalBobot}%
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
              <div>
                <label className="text-xs text-[#A5D8D3]">KKM</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.kkm}
                  onChange={(e) =>
                    setDraft({ ...draft, kkm: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-2 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-[#A5D8D3]">Batas A</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.batasA}
                  onChange={(e) =>
                    setDraft({ ...draft, batasA: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-2 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-[#A5D8D3]">Batas B</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.batasB}
                  onChange={(e) =>
                    setDraft({ ...draft, batasB: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-2 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-[#A5D8D3]">Batas C</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.batasC}
                  onChange={(e) =>
                    setDraft({ ...draft, batasC: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full min-h-[44px] px-2 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] text-center mt-1 font-mono"
                />
              </div>
            </div>

            {error && <span className="text-xs text-red-400 text-center">{error}</span>}

            <div className="flex items-center justify-end gap-2 pt-3">
              <GlassButton type="button" variant="secondary" size="sm" onClick={onClose}>
                Batal
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm">
                Simpan
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
