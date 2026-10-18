// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { Copy, Check, Save, Radio, ShieldCheck, ShieldAlert } from 'lucide-react';
import { SyncSettings } from '../../types';
import { StorageService } from '../../services/storageService';
import { APPS_SCRIPT_TEMPLATE } from '../../services/appsScriptCode';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassInput } from '../common/GlassInput';

interface AdminSyncProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminSync: React.FC<AdminSyncProps> = ({ onShowToast }) => {
  const storage = StorageService.getInstance();
  const [syncData, setSyncData] = useState<SyncSettings>(storage.getSyncSettings());
  const [initialData, setInitialData] = useState<SyncSettings>(storage.getSyncSettings());
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'Terhubung' | 'Gagal' | 'Belum Teruji'>(
    syncData.lastConnectedStatus
  );

  const hasChanges = JSON.stringify(syncData) !== JSON.stringify(initialData);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Kode disalin');
  };

  const handleSave = () => {
    const updated = { ...syncData, lastConnectedStatus: connectionStatus };
    storage.saveSyncSettings(updated);
    setInitialData({ ...updated });
    onShowToast('Berhasil disimpan');
  };

  const handleTestConnection = async () => {
    if (!syncData.webAppUrl) {
      setConnectionStatus('Gagal');
      onShowToast('Gagal terhubung', 'error');
      return;
    }

    setTesting(true);
    try {
      const resp = await fetch(syncData.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'testConnection', token: syncData.token }),
      });
      const res = await resp.json();
      if (res && res.success) {
        setConnectionStatus('Terhubung');
        onShowToast('Koneksi terhubung');
      } else {
        setConnectionStatus('Gagal');
        onShowToast('Gagal terhubung', 'error');
      }
    } catch {
      setConnectionStatus('Gagal');
      onShowToast('Gagal terhubung', 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#ECFEFF]">Sinkronisasi</h2>
        <div className="flex items-center gap-2">
          <GlassButton
            type="button"
            variant="secondary"
            size="sm"
            loading={testing}
            onClick={handleTestConnection}
          >
            <Radio className="w-4 h-4 mr-1.5" />
            <span>Uji Koneksi</span>
          </GlassButton>
          <GlassButton
            type="button"
            variant="primary"
            size="sm"
            disabled={!hasChanges && connectionStatus === syncData.lastConnectedStatus}
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Simpan</span>
          </GlassButton>
        </div>
      </div>

      {/* Connection Status Badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#A5D8D3] font-medium">Status:</span>
        {connectionStatus === 'Terhubung' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Terhubung</span>
          </span>
        ) : connectionStatus === 'Gagal' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Gagal</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#A5D8D3]">
            <span>Belum Teruji</span>
          </span>
        )}
      </div>

      {/* Configuration Form */}
      <GlassCard className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <GlassInput
              label="URL Web App"
              value={syncData.webAppUrl}
              onChange={(e) => setSyncData({ ...syncData, webAppUrl: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <GlassInput
              label="Token"
              isPassword
              value={syncData.token}
              onChange={(e) => setSyncData({ ...syncData, token: e.target.value })}
            />
          </div>

          <GlassInput
            label="ID Spreadsheet"
            value={syncData.spreadsheetId}
            onChange={(e) => setSyncData({ ...syncData, spreadsheetId: e.target.value })}
          />

          <GlassInput
            label="ID Folder Drive"
            value={syncData.driveFolderId}
            onChange={(e) => setSyncData({ ...syncData, driveFolderId: e.target.value })}
          />

          <GlassInput
            label="Nama Tab Siswa"
            value={syncData.studentSheetName}
            onChange={(e) => setSyncData({ ...syncData, studentSheetName: e.target.value })}
          />

          <GlassInput
            label="Nama Tab Rekap Nilai"
            value={syncData.gradesSheetName}
            onChange={(e) => setSyncData({ ...syncData, gradesSheetName: e.target.value })}
          />
        </div>
      </GlassCard>

      {/* Apps Script Code Box with Copy Button */}
      <GlassCard className="p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#ECFEFF]">Kode Apps Script</span>
          <GlassButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyCode}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1 text-[#2DD4BF]" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                <span>Salin Kode</span>
              </>
            )}
          </GlassButton>
        </div>

        <div className="w-full max-h-[360px] overflow-y-auto rounded-xl bg-black/40 p-4 border border-white/10 font-mono text-xs text-[#A5D8D3] selection:bg-[#2DD4BF] selection:text-[#042F2E]">
          <pre>{APPS_SCRIPT_TEMPLATE}</pre>
        </div>
      </GlassCard>
    </div>
  );
};
