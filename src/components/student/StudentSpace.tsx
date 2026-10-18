// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import { Check, BookOpen, Award, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { Student, Material, GradeRecord, CmsSettings, GradeSettings } from '../../types';
import { StorageService } from '../../services/storageService';
import { MaterialViewer } from './MaterialViewer';
import { StudentGrades } from './StudentGrades';
import { GlassCard } from '../common/GlassCard';
import { MobileSidebarDrawer } from '../common/MobileSidebarDrawer';

interface StudentSpaceProps {
  student: Student;
  cms: CmsSettings;
  onLogout: () => void;
}

export const StudentSpace: React.FC<StudentSpaceProps> = ({ student, cms, onLogout }) => {
  const storage = StorageService.getInstance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'materi' | 'nilai'>('materi');
  const [activeMaterialId, setActiveMaterialId] = useState<string>('');
  const [activePageId, setActivePageId] = useState<string>('');
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [gradeSettings, setGradeSettings] = useState<GradeSettings>(storage.getGradeSettings());
  const [openedSet, setOpenedSet] = useState<Set<string>>(storage.getOpenedMaterials(student.nisn));

  // Materials visible to this student (Status: Tampil AND targetClasses contains student class or "Semua Kelas")
  const allMaterials = storage.getMaterials();
  const studentMaterials = allMaterials.filter(
    (m) =>
      m.status === 'Tampil' &&
      (m.targetClasses.includes(student.className) || m.targetClasses.includes('Semua Kelas'))
  );

  // Group materials by subject
  const materialsBySubject: Record<string, Material[]> = {};
  studentMaterials.forEach((m) => {
    if (!materialsBySubject[m.subject]) {
      materialsBySubject[m.subject] = [];
    }
    materialsBySubject[m.subject].push(m);
  });

  // Calculate percentage of opened materials
  const totalMateri = studentMaterials.length;
  const openedCount = studentMaterials.filter((m) => openedSet.has(m.id)).length;
  const progressPercent = totalMateri > 0 ? Math.round((openedCount / totalMateri) * 100) : 0;

  // On mount: restore last visited or first material
  useEffect(() => {
    const last = storage.getLastVisited(student.nisn);
    if (last && studentMaterials.some((m) => m.id === last.materialId)) {
      setActiveMaterialId(last.materialId);
      setActivePageId(last.pageId || '');
      const mat = studentMaterials.find((m) => m.id === last.materialId);
      if (mat) {
        setExpandedSubjects((prev) => ({ ...prev, [mat.subject]: true }));
      }
    } else if (studentMaterials.length > 0) {
      const first = studentMaterials[0];
      setActiveMaterialId(first.id);
      setActivePageId(first.pages[0]?.id || '');
      setExpandedSubjects({ [first.subject]: true });
    }

    // Load student grades
    storage.getStudentGradesFromAppsScript(student.nisn).then((res) => {
      setGrades(res);
    });

    setGradeSettings(storage.getGradeSettings());
  }, [student.nisn]);

  // Touch session on click / interaction
  useEffect(() => {
    const handleTouch = () => storage.touchSession();
    window.addEventListener('click', handleTouch);
    window.addEventListener('scroll', handleTouch);
    return () => {
      window.removeEventListener('click', handleTouch);
      window.removeEventListener('scroll', handleTouch);
    };
  }, [storage]);

  // Mark material opened and remember last visited
  const handleSelectMaterial = (materi: Material, pageId?: string) => {
    setActiveTab('materi');
    setActiveMaterialId(materi.id);
    const chosenPageId = pageId || materi.pages[0]?.id || '';
    setActivePageId(chosenPageId);
    setMobileMenuOpen(false);

    storage.markMaterialOpened(student.nisn, materi.id);
    setOpenedSet(storage.getOpenedMaterials(student.nisn));
    storage.setLastVisited(student.nisn, materi.id, chosenPageId);
  };

  const handlePageChange = (pageId: string) => {
    setActivePageId(pageId);
    storage.setLastVisited(student.nisn, activeMaterialId, pageId);
  };

  const toggleSubject = (sub: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [sub]: !prev[sub] }));
  };

  const activeMaterial = studentMaterials.find((m) => m.id === activeMaterialId);

  // Logo URL
  const logoUrl = cms.logoValue || 'https://i.ibb.co.com/nqfqhc29/kdu.png';

  // Get student initials for avatar circle
  const initials = student.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  // Reusable Sidebar Content for both Desktop and Mobile Drawer
  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-1 pr-1">
        {/* 1. Logo & App Name */}
        <div className="flex items-center gap-3 px-2 py-2">
          <img
            src={logoUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-9 h-9 object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-[#ECFEFF] truncate">
              {cms.appName}
            </span>
            <span className="text-[11px] text-[#A5D8D3] truncate">
              {cms.institutionName}
            </span>
          </div>
        </div>

        {/* 2. Student Profile Card */}
        {cms.showProfileCard && (
          <div className="p-3 bg-white/10 rounded-2xl border border-white/15 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#2DD4BF] text-[#042F2E] font-bold text-sm flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm text-[#ECFEFF] truncate">
                {student.name}
              </span>
              <span className="text-xs text-[#2DD4BF] font-mono">
                {student.className}
              </span>
            </div>
          </div>
        )}

        {/* 3. Navigation: Rekap Nilai */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('nilai');
            setMobileMenuOpen(false);
          }}
          className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl font-medium text-base sm:text-sm flex items-center gap-3 transition-all cursor-pointer ${
            activeTab === 'nilai'
              ? 'bg-[#2DD4BF] text-[#042F2E] font-semibold shadow-md shadow-[#2DD4BF]/20'
              : 'text-[#A5D8D3] hover:text-[#ECFEFF] hover:bg-white/10'
          }`}
        >
          <Award className="w-5 h-5 shrink-0" />
          <span>{cms.labelRekapNilai}</span>
        </button>

        {/* 4. Section: Materi (Accordion per Subject) */}
        <div className="flex flex-col gap-1 pt-2">
          <span className="text-xs font-semibold text-[#A5D8D3] uppercase tracking-wider px-3 mb-1">
            {cms.sectionTitleMateri}
          </span>

          {Object.keys(materialsBySubject).length === 0 ? (
            <span className="text-xs text-[#A5D8D3] px-3 py-2 italic">
              {cms.emptyMaterialText}
            </span>
          ) : (
            Object.entries(materialsBySubject).map(([sub, mats]) => {
              const isExpanded = !!expandedSubjects[sub];
              return (
                <div key={sub} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className="w-full min-h-[48px] px-3 py-2 rounded-xl text-sm font-semibold text-[#ECFEFF] flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <BookOpen className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                      <span className="truncate">{sub}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-[#A5D8D3] font-mono">({mats.length})</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#A5D8D3]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#A5D8D3]" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col pl-4 pr-1 py-1 gap-1">
                      {mats.map((m) => {
                        const isMateriActive = activeTab === 'materi' && activeMaterialId === m.id;
                        const isOpened = openedSet.has(m.id);

                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleSelectMaterial(m)}
                            className={`w-full min-h-[48px] px-3 py-2 rounded-xl text-sm text-left flex items-center justify-between transition-all cursor-pointer ${
                              isMateriActive
                                ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-semibold border border-[#2DD4BF]/40'
                                : 'text-[#ECFEFF]/80 hover:text-[#ECFEFF] hover:bg-white/10'
                            }`}
                          >
                            <span className="truncate mr-2">{m.title}</span>
                            {cms.showOpenedCheckmark && isOpened && (
                              <Check className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Keluar Item at Bottom */}
      <div className="pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onLogout}
          className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl font-medium text-base sm:text-sm text-[#A5D8D3] hover:text-red-400 hover:bg-white/10 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>{cms.labelKeluar}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#ECFEFF] selection:bg-[#2DD4BF] selection:text-[#042F2E]">
      {/* ATURAN PERMANEN: Header HP di Ruang Belajar Siswa DIHAPUS TOTAL */}

      {/* --- MOBILE SIDEBAR DRAWER DENGAN TOMBOL PEGANGAN DI KIRI TENGAH LAYAR --- */}
      <MobileSidebarDrawer
        isOpen={mobileMenuOpen}
        onOpen={() => setMobileMenuOpen(true)}
        onClose={() => setMobileMenuOpen(false)}
      >
        {renderSidebarContent()}
      </MobileSidebarDrawer>

      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="hidden md:flex sticky top-0 left-0 z-10 h-screen w-[300px] bg-[#0F766E]/40 backdrop-blur-[var(--glass-blur,18px)] border-r border-white/15 flex-col justify-between p-4 shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* --- MAIN LEARNING AREA (Tombol pegangan diabaikan dalam penentuan tata letak, seimbang kiri-kanan ~8px di HP) --- */}
      <main className="flex-1 px-2 py-3 sm:px-4 sm:py-6 md:p-8 overflow-y-auto">
        {activeTab === 'materi' ? (
          activeMaterial ? (
            <MaterialViewer
              material={activeMaterial}
              initialPageId={activePageId}
              cms={cms}
              studentNisn={student.nisn}
              onPageChange={handlePageChange}
            />
          ) : (
            <GlassCard className="p-12 text-center text-[#A5D8D3]">
              <h3 className="text-lg font-semibold">{cms.emptyMaterialText}</h3>
            </GlassCard>
          )
        ) : (
          <StudentGrades
            grades={storage.getGradesForStudent(student.nisn)}
            cms={cms}
            gradeSettings={gradeSettings}
            totalMaterialsForClass={studentMaterials.length}
          />
        )}
      </main>
    </div>
  );
};
