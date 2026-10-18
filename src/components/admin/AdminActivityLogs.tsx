// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useMemo } from 'react';
import { StorageService } from '../../services/storageService';
import { GlassCard } from '../common/GlassCard';
import { GlassSelect } from '../common/GlassSelect';

export const AdminActivityLogs: React.FC = () => {
  const storage = StorageService.getInstance();
  const logs = storage.getActivityLogs();
  const [dateFilter, setDateFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchDate = !dateFilter || log.timestamp.includes(dateFilter);
      const matchRole = roleFilter === 'Semua' || log.role.toLowerCase() === roleFilter.toLowerCase();
      return matchDate && matchRole;
    });
  }, [logs, dateFilter, roleFilter]);

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#ECFEFF]">Log Aktivitas</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-36">
            <GlassSelect
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'Semua', label: 'Semua Peran' },
                { value: 'admin', label: 'Admin' },
                { value: 'siswa', label: 'Siswa' },
              ]}
              ariaLabel="Filter Peran"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="min-h-[44px] px-3.5 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="px-3 py-2 text-xs text-[#A5D8D3] hover:text-[#ECFEFF] cursor-pointer"
            >
              Hapus Filter
            </button>
          )}
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-[#A5D8D3]">
            <h3 className="text-base font-semibold">Belum ada data</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-white/10 border-b border-white/15 text-[#2DD4BF] font-semibold">
                  <th className="px-4 py-3.5 w-44">Waktu</th>
                  <th className="px-4 py-3.5 w-24">Peran</th>
                  <th className="px-4 py-3.5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#A5D8D3] tabular-nums">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3 font-semibold text-xs text-[#2DD4BF] uppercase">
                      {log.role}
                    </td>
                    <td className="px-4 py-3 text-[#ECFEFF]">{log.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
