// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { GlassCard } from '../common/GlassCard';

interface QuotaMetric {
  title: string;
  used: number;
  limit: number;
  unit: string;
  color: string;
}

export const AdminFirebaseQuota: React.FC = () => {
  const metrics: QuotaMetric[] = [
    {
      title: 'Operasi Baca',
      used: 1250,
      limit: 50000,
      unit: '/ hari',
      color: '#2DD4BF',
    },
    {
      title: 'Operasi Tulis',
      used: 480,
      limit: 20000,
      unit: '/ hari',
      color: '#34D399',
    },
    {
      title: 'Operasi Hapus',
      used: 24,
      limit: 20000,
      unit: '/ hari',
      color: '#FBBF24',
    },
    {
      title: 'Penyimpanan Teks',
      used: 4.2,
      limit: 1024,
      unit: 'MB',
      color: '#38BDF8',
    },
    {
      title: 'Lalu Lintas Jaringan',
      used: 128,
      limit: 10240,
      unit: 'MB / bulan',
      color: '#A78BFA',
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      <h2 className="text-xl font-bold text-[#ECFEFF]">Penggunaan Kuota</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metrics.map((m, idx) => {
          const percent = Math.min(100, Math.round((m.used / m.limit) * 100));

          return (
            <GlassCard key={idx} className="p-6 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#ECFEFF]">{m.title}</span>
                <span
                  className="text-xs font-bold font-mono px-2 py-0.5 rounded-full"
                  style={{ color: m.color, backgroundColor: `${m.color}20` }}
                >
                  {percent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(2, percent)}%`,
                    backgroundColor: m.color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#A5D8D3]">
                <span className="font-mono tabular-nums text-sm font-bold text-[#ECFEFF]">
                  {m.used.toLocaleString()}
                </span>
                <span className="font-mono tabular-nums">
                  {m.limit.toLocaleString()} {m.unit}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
