// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { Save, Eye, Sparkles } from 'lucide-react';
import { CmsSettings } from '../../types';
import { StorageService } from '../../services/storageService';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassInput } from '../common/GlassInput';
import { ImageUploader } from '../common/ImageUploader';
import { LoginScreen } from '../auth/LoginScreen';

interface AdminCmsProps {
  cms: CmsSettings;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

type CmsTab =
  | 'Identitas'
  | 'Layar Login'
  | 'Tema'
  | 'Sidebar & Menu'
  | 'Tampilan Materi'
  | 'Rekap Nilai'
  | 'Teks & Pesan'
  | 'Fitur';

export const AdminCms: React.FC<AdminCmsProps> = ({ cms, onShowToast }) => {
  const storage = StorageService.getInstance();
  const [activeTab, setActiveTab] = useState<CmsTab>('Identitas');
  const [draftCms, setDraftCms] = useState<CmsSettings>({ ...cms });
  const [savedSnapshot, setSavedSnapshot] = useState<CmsSettings>({ ...cms });
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Check if current tab draft differs from saved snapshot
  const hasChanges = JSON.stringify(draftCms) !== JSON.stringify(savedSnapshot);

  const handleFieldChange = <K extends keyof CmsSettings>(field: K, value: CmsSettings[K]) => {
    setDraftCms((prev) => {
      const updated = { ...prev, [field]: value };
      // Realtime DOM reflection for theme fields
      if (
        field.startsWith('color') ||
        field.startsWith('glass') ||
        field === 'borderRadius' ||
        field === 'loginSpinSpeed'
      ) {
        storage.applyThemeToDOM(updated);
      }
      return updated;
    });
  };

  const handleSaveTab = () => {
    storage.saveCmsSettings(draftCms);
    setSavedSnapshot({ ...draftCms });
    onShowToast('Berhasil disimpan');
  };

  const tabs: CmsTab[] = [
    'Identitas',
    'Layar Login',
    'Tema',
    'Sidebar & Menu',
    'Tampilan Materi',
    'Rekap Nilai',
    'Teks & Pesan',
    'Fitur',
  ];

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#ECFEFF]">Pengaturan Tampilan</h2>
        <div className="flex items-center gap-2">
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => setIsPreviewModalOpen(true)}
          >
            <Eye className="w-4 h-4 mr-1.5" />
            <span>Pratinjau</span>
          </GlassButton>
          <GlassButton
            variant="primary"
            size="sm"
            disabled={!hasChanges}
            onClick={handleSaveTab}
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Simpan</span>
          </GlassButton>
        </div>
      </div>

      {/* CMS Sub-tabs Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2DD4BF] text-[#042F2E] font-bold shadow-md shadow-[#2DD4BF]/20'
                  : 'bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF] hover:bg-white/15'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <GlassCard className="p-6">
        {/* 1. Identitas */}
        {activeTab === 'Identitas' && (
          <div className="flex flex-col gap-5 max-w-2xl">
            <GlassInput
              label="Nama Aplikasi"
              value={draftCms.appName}
              onChange={(e) => handleFieldChange('appName', e.target.value)}
            />
            <GlassInput
              label="Nama Lembaga"
              value={draftCms.institutionName}
              onChange={(e) => handleFieldChange('institutionName', e.target.value)}
            />
            <GlassInput
              label="Nama Singkat Header HP"
              value={draftCms.shortName}
              onChange={(e) => handleFieldChange('shortName', e.target.value)}
            />
            <ImageUploader
              label="Logo"
              source={draftCms.logoSource}
              value={draftCms.logoValue}
              onChange={(source, value) => {
                handleFieldChange('logoSource', source);
                handleFieldChange('logoValue', value);
              }}
              onClear={() => handleFieldChange('logoValue', '')}
            />
            <GlassInput
              label="Teks Hak Cipta"
              value={draftCms.copyrightText}
              onChange={(e) => handleFieldChange('copyrightText', e.target.value)}
            />
            <GlassInput
              label="Judul Halaman Web"
              value={draftCms.pageTitle}
              onChange={(e) => handleFieldChange('pageTitle', e.target.value)}
            />
            <GlassInput
              label="Deskripsi Halaman Web"
              value={draftCms.pageDescription}
              onChange={(e) => handleFieldChange('pageDescription', e.target.value)}
            />
          </div>
        )}

        {/* 2. Layar Login */}
        {activeTab === 'Layar Login' && (
          <div className="flex flex-col gap-5 max-w-2xl">
            <GlassInput
              label="Judul Sambutan"
              value={draftCms.loginWelcomeTitle}
              onChange={(e) => handleFieldChange('loginWelcomeTitle', e.target.value)}
            />
            <GlassInput
              label="Nama Lembaga Layar Login"
              value={draftCms.loginInstitutionName}
              onChange={(e) => handleFieldChange('loginInstitutionName', e.target.value)}
            />
            <GlassInput
              label="Kalimat Sambutan"
              value={draftCms.loginWelcomeText}
              onChange={(e) => handleFieldChange('loginWelcomeText', e.target.value)}
            />
            <GlassInput
              label="Label Kolom Kata Sandi"
              value={draftCms.loginPasswordLabel}
              onChange={(e) => handleFieldChange('loginPasswordLabel', e.target.value)}
            />
            <GlassInput
              label="Label Tombol Masuk"
              value={draftCms.loginButtonLabel}
              onChange={(e) => handleFieldChange('loginButtonLabel', e.target.value)}
            />
            <GlassInput
              label="Pesan Galat Login"
              value={draftCms.loginErrorMessage}
              onChange={(e) => handleFieldChange('loginErrorMessage', e.target.value)}
            />
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">Logo Berputar 360°</span>
              <input
                type="checkbox"
                checked={draftCms.loginSpinLogo}
                onChange={(e) => handleFieldChange('loginSpinLogo', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>
            {draftCms.loginSpinLogo && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#ECFEFF]">
                  Kecepatan Putaran (Detik)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={draftCms.loginSpinSpeed}
                  onChange={(e) =>
                    handleFieldChange('loginSpinSpeed', parseInt(e.target.value, 10) || 6)
                  }
                  className="w-full min-h-[44px] px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF]"
                />
              </div>
            )}
          </div>
        )}

        {/* 3. Tema */}
        {activeTab === 'Tema' && (
          <div className="flex flex-col gap-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#A5D8D3] block mb-1">Warna Utama</label>
                <input
                  type="color"
                  value={draftCms.colorPrimary}
                  onChange={(e) => handleFieldChange('colorPrimary', e.target.value)}
                  className="w-full h-11 rounded-xl bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-[#A5D8D3] block mb-1">Warna Sekunder</label>
                <input
                  type="color"
                  value={draftCms.colorSecondary}
                  onChange={(e) => handleFieldChange('colorSecondary', e.target.value)}
                  className="w-full h-11 rounded-xl bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-[#A5D8D3] block mb-1">Warna Aksen</label>
                <input
                  type="color"
                  value={draftCms.colorAccent}
                  onChange={(e) => handleFieldChange('colorAccent', e.target.value)}
                  className="w-full h-11 rounded-xl bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-[#A5D8D3] block mb-1">Aksen Hangat</label>
                <input
                  type="color"
                  value={draftCms.colorWarm}
                  onChange={(e) => handleFieldChange('colorWarm', e.target.value)}
                  className="w-full h-11 rounded-xl bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[#A5D8D3] block mb-1">Latar Awal</label>
                <input
                  type="color"
                  value={draftCms.colorBgStart}
                  onChange={(e) => handleFieldChange('colorBgStart', e.target.value)}
                  className="w-full h-11 rounded-xl bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-[#A5D8D3] block mb-1">Latar Tengah</label>
                <input
                  type="color"
                  value={draftCms.colorBgMid}
                  onChange={(e) => handleFieldChange('colorBgMid', e.target.value)}
                  className="w-full h-11 rounded-xl bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-[#A5D8D3] block mb-1">Latar Akhir</label>
                <input
                  type="color"
                  value={draftCms.colorBgEnd}
                  onChange={(e) => handleFieldChange('colorBgEnd', e.target.value)}
                  className="w-full h-11 rounded-xl bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#A5D8D3] block mb-1">
                  Transparansi Kaca ({Math.round(draftCms.glassOpacity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={draftCms.glassOpacity}
                  onChange={(e) =>
                    handleFieldChange('glassOpacity', parseFloat(e.target.value))
                  }
                  className="w-full accent-[#2DD4BF] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-[#A5D8D3] block mb-1">
                  Efek Blur ({draftCms.glassBlur}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={draftCms.glassBlur}
                  onChange={(e) =>
                    handleFieldChange('glassBlur', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-[#2DD4BF] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A5D8D3]">Sudut Membulat ({draftCms.borderRadius}px)</label>
              <input
                type="range"
                min="4"
                max="32"
                value={draftCms.borderRadius}
                onChange={(e) =>
                  handleFieldChange('borderRadius', parseInt(e.target.value, 10))
                }
                className="w-full accent-[#2DD4BF] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 4. Sidebar & Menu */}
        {activeTab === 'Sidebar & Menu' && (
          <div className="flex flex-col gap-5 max-w-2xl">
            <GlassInput
              label="Label Rekap Nilai"
              value={draftCms.labelRekapNilai}
              onChange={(e) => handleFieldChange('labelRekapNilai', e.target.value)}
            />
            <GlassInput
              label="Judul Bagian Materi"
              value={draftCms.sectionTitleMateri}
              onChange={(e) => handleFieldChange('sectionTitleMateri', e.target.value)}
            />
            <GlassInput
              label="Label Keluar"
              value={draftCms.labelKeluar}
              onChange={(e) => handleFieldChange('labelKeluar', e.target.value)}
            />
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">Tampilkan Profil Siswa</span>
              <input
                type="checkbox"
                checked={draftCms.showProfileCard}
                onChange={(e) => handleFieldChange('showProfileCard', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">
                Kelompokkan Materi per Mapel
              </span>
              <input
                type="checkbox"
                checked={draftCms.groupBySubject}
                onChange={(e) => handleFieldChange('groupBySubject', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 5. Tampilan Materi */}
        {activeTab === 'Tampilan Materi' && (
          <div className="flex flex-col gap-5 max-w-2xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#ECFEFF]">Gaya Tab Halaman</label>
              <select
                value={draftCms.tabStyle}
                onChange={(e) => handleFieldChange('tabStyle', e.target.value as any)}
                className="min-h-[44px] px-3.5 py-2 text-sm bg-[#0B4F4A] border border-white/20 rounded-xl text-[#ECFEFF] cursor-pointer"
              >
                <option value="pill">Pil Beraksen</option>
                <option value="underline">Garis Bawah</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#ECFEFF]">
                Ukuran Huruf Isi ({draftCms.contentFontSize}px)
              </label>
              <input
                type="range"
                min="14"
                max="20"
                value={draftCms.contentFontSize}
                onChange={(e) =>
                  handleFieldChange('contentFontSize', parseInt(e.target.value, 10))
                }
                className="w-full accent-[#2DD4BF] cursor-pointer"
              />
            </div>

            <GlassInput
              label="Teks Materi Kosong"
              value={draftCms.emptyMaterialText}
              onChange={(e) => handleFieldChange('emptyMaterialText', e.target.value)}
            />

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">
                Penanda Materi Sudah Dibuka (Centang)
              </span>
              <input
                type="checkbox"
                checked={draftCms.showOpenedCheckmark}
                onChange={(e) => handleFieldChange('showOpenedCheckmark', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 6. Rekap Nilai */}
        {activeTab === 'Rekap Nilai' && (
          <div className="flex flex-col gap-5 max-w-2xl">
            <GlassInput
              label="Judul Halaman Rekap Nilai"
              value={draftCms.rekapTitle}
              onChange={(e) => handleFieldChange('rekapTitle', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <GlassInput
                label="Label Kolom Mapel"
                value={draftCms.labelColSubject}
                onChange={(e) => handleFieldChange('labelColSubject', e.target.value)}
              />
              <GlassInput
                label="Label Kolom Materi"
                value={draftCms.labelColMaterial}
                onChange={(e) => handleFieldChange('labelColMaterial', e.target.value)}
              />
              <GlassInput
                label="Label Kolom Uji Pemahaman"
                value={draftCms.labelColUjiPemahaman}
                onChange={(e) => handleFieldChange('labelColUjiPemahaman', e.target.value)}
              />
              <GlassInput
                label="Label Kolom Kuis Akhir"
                value={draftCms.labelColKuisAkhir}
                onChange={(e) => handleFieldChange('labelColKuisAkhir', e.target.value)}
              />
              <GlassInput
                label="Label Kolom Nilai Akhir"
                value={draftCms.labelColNilaiAkhir}
                onChange={(e) => handleFieldChange('labelColNilaiAkhir', e.target.value)}
              />
              <GlassInput
                label="Label Kolom Predikat"
                value={draftCms.labelColPredikat}
                onChange={(e) => handleFieldChange('labelColPredikat', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">
                Tampilkan Tiga Kartu Ringkasan
              </span>
              <input
                type="checkbox"
                checked={draftCms.showSummaryCards}
                onChange={(e) => handleFieldChange('showSummaryCards', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">
                Tampilkan Grafik Batang Nilai
              </span>
              <input
                type="checkbox"
                checked={draftCms.showGradeChart}
                onChange={(e) => handleFieldChange('showGradeChart', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 7. Teks & Pesan */}
        {activeTab === 'Teks & Pesan' && (
          <div className="flex flex-col gap-5 max-w-2xl">
            <GlassInput
              label="Format Pesan Hitung Mundur"
              value={draftCms.msgCountdown}
              onChange={(e) => handleFieldChange('msgCountdown', e.target.value)}
            />
            <GlassInput
              label="Pesan Berhasil Disimpan"
              value={draftCms.msgSaved}
              onChange={(e) => handleFieldChange('msgSaved', e.target.value)}
            />
            <GlassInput
              label="Pesan Gagal Unggah"
              value={draftCms.msgUploadFailed}
              onChange={(e) => handleFieldChange('msgUploadFailed', e.target.value)}
            />
            <GlassInput
              label="Pesan Data Kosong"
              value={draftCms.msgEmptyData}
              onChange={(e) => handleFieldChange('msgEmptyData', e.target.value)}
            />
            <GlassInput
              label="Pesan Nilai Kosong"
              value={draftCms.msgEmptyGrade}
              onChange={(e) => handleFieldChange('msgEmptyGrade', e.target.value)}
            />
            <GlassInput
              label="Lencana Offline"
              value={draftCms.msgOfflineBadge}
              onChange={(e) => handleFieldChange('msgOfflineBadge', e.target.value)}
            />
          </div>
        )}

        {/* 8. Fitur */}
        {activeTab === 'Fitur' && (
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">Logo Berputar Horizontal</span>
              <input
                type="checkbox"
                checked={draftCms.featureSpinLogo}
                onChange={(e) => handleFieldChange('featureSpinLogo', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">Penanda Materi Dibuka</span>
              <input
                type="checkbox"
                checked={draftCms.featureOpenedMark}
                onChange={(e) => handleFieldChange('featureOpenedMark', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">Ingat Materi Terakhir</span>
              <input
                type="checkbox"
                checked={draftCms.featureRememberLast}
                onChange={(e) => handleFieldChange('featureRememberLast', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">Kartu Ringkasan Rekap Nilai</span>
              <input
                type="checkbox"
                checked={draftCms.featureSummaryCards}
                onChange={(e) => handleFieldChange('featureSummaryCards', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-[#ECFEFF]">Grafik Nilai Siswa</span>
              <input
                type="checkbox"
                checked={draftCms.featureGradeChart}
                onChange={(e) => handleFieldChange('featureGradeChart', e.target.checked)}
                className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab Footer Save Button */}
        <div className="pt-6 border-t border-white/15 flex justify-end">
          <GlassButton
            type="button"
            variant="primary"
            disabled={!hasChanges}
            onClick={handleSaveTab}
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Simpan</span>
          </GlassButton>
        </div>
      </GlassCard>

      {/* Pratinjau Modal */}
      {isPreviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-2">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Tutup Pratinjau
              </GlassButton>
            </div>
            <LoginScreen cms={draftCms} onLoginSuccess={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
};
