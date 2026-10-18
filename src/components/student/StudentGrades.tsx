// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { GradeRecord, CmsSettings, GradeSettings } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { GradeBarChart } from '../common/Charts';

interface StudentGradesProps {
  grades: GradeRecord[];
  cms: CmsSettings;
  gradeSettings: GradeSettings;
  materialProgressPercent: number;
}

export const StudentGrades: React.FC<StudentGradesProps> = ({
  grades,
  cms,
  gradeSettings,
  materialProgressPercent,
}) => {
  if (!grades || grades.length === 0) {
    return (
      <GlassCard className="p-12 text-center text-[#A5D8D3]">
        <h3 className="text-lg font-semibold">{cms.msgEmptyGrade}</h3>
      </GlassCard>
    );
  }

  // Summary Metrics
  const avgGrade = Math.round(
    grades.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / (grades.length || 1)
  );
  const tuntasCount = grades.filter((g) => g.nilaiAkhir >= gradeSettings.kkm).length;

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

  const chartData = grades.map((g) => ({
    label: g.subject,
    score: g.nilaiAkhir,
  }));

  return (
    <div className="flex flex-col gap-6 w-full max-w-[860px] mx-auto pb-12">
      {/* 1. Summary Cards */}
      {cms.showSummaryCards && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="p-5 flex flex-col items-center text-center">
            <span className="text-xs text-[#A5D8D3] font-medium">{cms.labelAvgCard}</span>
            <span className="text-3xl font-bold text-[#ECFEFF] mt-1 tabular-nums">
              {avgGrade}
            </span>
          </GlassCard>

          <GlassCard className="p-5 flex flex-col items-center text-center">
            <span className="text-xs text-[#A5D8D3] font-medium">{cms.labelTuntasCard}</span>
            <span className="text-3xl font-bold text-[#2DD4BF] mt-1 tabular-nums">
              {tuntasCount} <span className="text-sm text-[#A5D8D3] font-normal">/ {grades.length}</span>
            </span>
          </GlassCard>

          <GlassCard className="p-5 flex flex-col items-center text-center">
            <span className="text-xs text-[#A5D8D3] font-medium">{cms.labelProgressCard}</span>
            <span className="text-3xl font-bold text-[#FBBF24] mt-1 tabular-nums">
              {materialProgressPercent}%
            </span>
          </GlassCard>
        </div>
      )}

      {/* 2. Table on Desktop / Stacked Cards on Mobile */}
      <GlassCard className="overflow-hidden">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-white/10 border-b border-white/15 text-[#2DD4BF] font-semibold">
                <th className="px-4 py-3.5">{cms.labelColSubject}</th>
                <th className="px-4 py-3.5 text-center">{cms.labelColTugas}</th>
                <th className="px-4 py-3.5 text-center">{cms.labelColKuis}</th>
                <th className="px-4 py-3.5 text-center">{cms.labelColUts}</th>
                <th className="px-4 py-3.5 text-center">{cms.labelColUas}</th>
                <th className="px-4 py-3.5 text-center">{cms.labelColAkhir}</th>
                <th className="px-4 py-3.5 text-center">{cms.labelColPredikat}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {grades.map((item) => {
                const isBelowKKM = item.nilaiAkhir < gradeSettings.kkm;
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#ECFEFF]">{item.subject}</td>
                    <td className="px-4 py-3 text-center text-[#ECFEFF]/80 tabular-nums">{item.tugas}</td>
                    <td className="px-4 py-3 text-center text-[#ECFEFF]/80 tabular-nums">{item.kuis}</td>
                    <td className="px-4 py-3 text-center text-[#ECFEFF]/80 tabular-nums">{item.uts}</td>
                    <td className="px-4 py-3 text-center text-[#ECFEFF]/80 tabular-nums">{item.uas}</td>
                    <td className={`px-4 py-3 text-center font-bold tabular-nums ${isBelowKKM ? 'text-[#FB923C]' : 'text-[#ECFEFF]'}`}>
                      {item.nilaiAkhir}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPredikatBadgeStyle(item.predikat)}`}>
                        {item.predikat}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Stacked Cards */}
        <div className="block sm:hidden divide-y divide-white/10 p-2">
          {grades.map((item) => {
            const isBelowKKM = item.nilaiAkhir < gradeSettings.kkm;
            return (
              <div key={item.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-[#ECFEFF]">{item.subject}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPredikatBadgeStyle(item.predikat)}`}>
                    {item.predikat}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center bg-white/5 p-2 rounded-xl text-xs">
                  <div>
                    <span className="text-[#A5D8D3] block">{cms.labelColTugas}</span>
                    <span className="font-semibold text-[#ECFEFF] tabular-nums">{item.tugas}</span>
                  </div>
                  <div>
                    <span className="text-[#A5D8D3] block">{cms.labelColKuis}</span>
                    <span className="font-semibold text-[#ECFEFF] tabular-nums">{item.kuis}</span>
                  </div>
                  <div>
                    <span className="text-[#A5D8D3] block">{cms.labelColUts}</span>
                    <span className="font-semibold text-[#ECFEFF] tabular-nums">{item.uts}</span>
                  </div>
                  <div>
                    <span className="text-[#A5D8D3] block">{cms.labelColUas}</span>
                    <span className="font-semibold text-[#ECFEFF] tabular-nums">{item.uas}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-xs text-[#A5D8D3]">{cms.labelColAkhir}</span>
                  <span className={`text-base font-bold tabular-nums ${isBelowKKM ? 'text-[#FB923C]' : 'text-[#2DD4BF]'}`}>
                    {item.nilaiAkhir}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* 3. Bar Chart per Subject */}
      {cms.showGradeChart && (
        <GlassCard className="p-6">
          <GradeBarChart data={chartData} kkm={gradeSettings.kkm} />
        </GlassCard>
      )}
    </div>
  );
};
