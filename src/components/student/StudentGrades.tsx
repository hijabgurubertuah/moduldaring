// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { GradeRecord, CmsSettings, GradeSettings } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { GradeBarChart } from '../common/Charts';

interface StudentGradesProps {
  grades: GradeRecord[];
  cms: CmsSettings;
  gradeSettings: GradeSettings;
  totalMaterialsForClass: number;
}

export const StudentGrades: React.FC<StudentGradesProps> = ({
  grades,
  cms,
  gradeSettings,
  totalMaterialsForClass,
}) => {
  if (!grades || grades.length === 0) {
    return (
      <GlassCard className="p-8 text-center text-[#A5D8D3]">
        <h3 className="text-base font-semibold">{cms.msgEmptyGrade}</h3>
      </GlassCard>
    );
  }

  // Summary Metrics
  const validEvaluated = grades.filter((g) => g.nilaiAkhir >= 0);
  const avgGrade =
    validEvaluated.length > 0
      ? Math.round(
          validEvaluated.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / validEvaluated.length
        )
      : 0;

  const tuntasCount = validEvaluated.filter((g) => g.nilaiAkhir >= gradeSettings.kkm).length;
  const dikerjakanCount = validEvaluated.length;

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

  const chartData = validEvaluated.map((g) => ({
    label: g.materialTitle,
    score: g.nilaiAkhir,
  }));

  return (
    <div className="flex flex-col gap-4 w-full max-w-[820px] mx-auto pb-12">
      {/* 1. Summary Cards */}
      {cms.showSummaryCards && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <GlassCard className="p-4 flex flex-col items-center text-center">
            <span className="text-xs text-[#A5D8D3] font-medium">{cms.labelCardAvg}</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#ECFEFF] mt-1 tabular-nums">
              {avgGrade}
            </span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col items-center text-center">
            <span className="text-xs text-[#A5D8D3] font-medium">{cms.labelCardTuntas}</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#2DD4BF] mt-1 tabular-nums">
              {tuntasCount} <span className="text-xs text-[#A5D8D3] font-normal">/ {grades.length}</span>
            </span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col items-center text-center">
            <span className="text-xs text-[#A5D8D3] font-medium">{cms.labelCardDikerjakan}</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#FBBF24] mt-1 tabular-nums">
              {dikerjakanCount} <span className="text-xs text-[#A5D8D3] font-normal">/ {totalMaterialsForClass}</span>
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
                <th className="px-4 py-3">{cms.labelColSubject}</th>
                <th className="px-4 py-3">{cms.labelColMaterial}</th>
                <th className="px-4 py-3 text-center">{cms.labelColUjiPemahaman}</th>
                <th className="px-4 py-3 text-center">{cms.labelColKuisAkhir}</th>
                <th className="px-4 py-3 text-center">{cms.labelColNilaiAkhir}</th>
                <th className="px-4 py-3 text-center">{cms.labelColPredikat}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {grades.map((item) => {
                const isBelowKKM = item.nilaiAkhir >= 0 && item.nilaiAkhir < gradeSettings.kkm;
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-[#ECFEFF]">{item.subject}</td>
                    <td className="px-4 py-2.5 text-[#ECFEFF]/90">{item.materialTitle}</td>
                    <td className="px-4 py-2.5 text-center text-[#ECFEFF]/80 tabular-nums">
                      {item.ujiPemahaman >= 0 ? item.ujiPemahaman : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-center text-[#ECFEFF]/80 tabular-nums">
                      {item.kuisAkhir >= 0 ? item.kuisAkhir : '-'}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-center font-bold tabular-nums ${
                        isBelowKKM ? 'text-[#FB923C]' : 'text-[#ECFEFF]'
                      }`}
                    >
                      {item.nilaiAkhir >= 0 ? item.nilaiAkhir : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPredikatBadgeStyle(
                          item.predikat
                        )}`}
                      >
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
        <div className="block sm:hidden divide-y divide-white/10 p-1">
          {grades.map((item) => {
            const isBelowKKM = item.nilaiAkhir >= 0 && item.nilaiAkhir < gradeSettings.kkm;
            return (
              <div key={item.id} className="p-3.5 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#2DD4BF] uppercase">
                      {item.subject}
                    </span>
                    <span className="font-bold text-sm text-[#ECFEFF] leading-snug">
                      {item.materialTitle}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border shrink-0 ${getPredikatBadgeStyle(
                      item.predikat
                    )}`}
                  >
                    {item.predikat}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-white/5 p-2 rounded-xl text-xs">
                  <div>
                    <span className="text-[#A5D8D3] block text-[11px] truncate">
                      {cms.labelColUjiPemahaman}
                    </span>
                    <span className="font-semibold text-[#ECFEFF] tabular-nums">
                      {item.ujiPemahaman >= 0 ? item.ujiPemahaman : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#A5D8D3] block text-[11px] truncate">
                      {cms.labelColKuisAkhir}
                    </span>
                    <span className="font-semibold text-[#ECFEFF] tabular-nums">
                      {item.kuisAkhir >= 0 ? item.kuisAkhir : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#A5D8D3] block text-[11px] truncate">
                      {cms.labelColNilaiAkhir}
                    </span>
                    <span
                      className={`font-bold tabular-nums ${
                        isBelowKKM ? 'text-[#FB923C]' : 'text-[#2DD4BF]'
                      }`}
                    >
                      {item.nilaiAkhir >= 0 ? item.nilaiAkhir : '-'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* 3. Bar Chart per Material */}
      {cms.showGradeChart && chartData.length > 0 && (
        <GlassCard className="p-4 sm:p-6">
          <GradeBarChart data={chartData} kkm={gradeSettings.kkm} />
        </GlassCard>
      )}
    </div>
  );
};
