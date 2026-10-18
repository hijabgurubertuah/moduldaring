// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { BarChartSimple, DonutChart } from '../common/Charts';
import { StorageService } from '../../services/storageService';

export const AdminDashboard: React.FC = () => {
  const storage = StorageService.getInstance();
  const students = storage.getStudents();
  const materials = storage.getMaterials();
  const grades = storage.getGrades();
  const classes = storage.getClasses();
  const logs = storage.getActivityLogs().slice(0, 5);

  // Stats calculations
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalMaterials = materials.length;

  // Percentage of filled grades
  // Expected grade slots: students.length * 4 subjects
  const expectedGradesCount = totalStudents * 4;
  const filledGradesPercent =
    expectedGradesCount > 0 ? Math.min(100, Math.round((grades.length / expectedGradesCount) * 100)) : 0;

  // Chart 1: Siswa per kelas
  const studentsPerClass = classes.map((c) => ({
    label: c,
    value: students.filter((s) => s.className === c).length,
  }));

  // Chart 2: Materi per mata pelajaran (Donut)
  const subjectColors = ['#2DD4BF', '#FBBF24', '#34D399', '#38BDF8', '#A78BFA', '#FB7185'];
  const subjectMap: Record<string, number> = {};
  materials.forEach((m) => {
    subjectMap[m.subject] = (subjectMap[m.subject] || 0) + 1;
  });
  const materialsPerSubject = Object.entries(subjectMap).map(([label, value], i) => ({
    label,
    value,
    color: subjectColors[i % subjectColors.length],
  }));

  // Chart 3: Rata-rata Nilai Akhir per kelas
  const avgGradePerClass = classes.map((c) => {
    const classGrades = grades.filter((g) => g.className === c);
    const avg =
      classGrades.length > 0
        ? Math.round(classGrades.reduce((a, b) => a + b.nilaiAkhir, 0) / classGrades.length)
        : 0;
    return {
      label: c,
      value: avg,
    };
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* 1. Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex flex-col">
          <span className="text-xs text-[#A5D8D3] font-medium">Jumlah Siswa</span>
          <span className="text-3xl font-bold text-[#ECFEFF] mt-1 tabular-nums">
            {totalStudents}
          </span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col">
          <span className="text-xs text-[#A5D8D3] font-medium">Jumlah Kelas</span>
          <span className="text-3xl font-bold text-[#2DD4BF] mt-1 tabular-nums">
            {totalClasses}
          </span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col">
          <span className="text-xs text-[#A5D8D3] font-medium">Jumlah Materi</span>
          <span className="text-3xl font-bold text-[#FBBF24] mt-1 tabular-nums">
            {totalMaterials}
          </span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col">
          <span className="text-xs text-[#A5D8D3] font-medium">Nilai Terisi</span>
          <span className="text-3xl font-bold text-[#34D399] mt-1 tabular-nums">
            {filledGradesPercent}%
          </span>
        </GlassCard>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-[#ECFEFF] mb-2">Siswa per Kelas</h3>
          <BarChartSimple data={studentsPerClass} color="#2DD4BF" />
        </GlassCard>

        <GlassCard className="p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-[#ECFEFF] mb-2">Materi per Mapel</h3>
          <DonutChart data={materialsPerSubject} />
        </GlassCard>

        <GlassCard className="p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-[#ECFEFF] mb-2">Rata-rata Nilai per Kelas</h3>
          <BarChartSimple data={avgGradePerClass} color="#FBBF24" />
        </GlassCard>
      </div>

      {/* 3. Lima Aktivitas Terbaru */}
      <GlassCard className="p-6">
        <h3 className="text-base font-semibold text-[#ECFEFF] mb-4">Aktivitas Terbaru</h3>
        <div className="divide-y divide-white/10">
          {logs.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <span className="text-[#ECFEFF] font-medium">{log.action}</span>
              <span className="text-[#A5D8D3] shrink-0 font-mono">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
