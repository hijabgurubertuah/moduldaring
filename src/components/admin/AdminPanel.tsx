// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  Palette,
  RefreshCw,
  Server,
  KeyRound,
  History,
  LogOut,
} from 'lucide-react';
import { CmsSettings } from '../../types';
import { StorageService } from '../../services/storageService';
import { AdminDashboard } from './AdminDashboard';
import { AdminStudents } from './AdminStudents';
import { AdminMaterials } from './AdminMaterials';
import { AdminGrades } from './AdminGrades';
import { AdminCms } from './AdminCms';
import { AdminSync } from './AdminSync';
import { AdminFirebaseQuota } from './AdminFirebaseQuota';
import { AdminPassword } from './AdminPassword';
import { AdminActivityLogs } from './AdminActivityLogs';

interface AdminPanelProps {
  cms: CmsSettings;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

type AdminMenu =
  | 'Dasbor'
  | 'Siswa'
  | 'Materi'
  | 'Nilai'
  | 'CMS'
  | 'Sinkronisasi'
  | 'Penggunaan Firebase'
  | 'Kata Sandi'
  | 'Log Aktivitas';

export const AdminPanel: React.FC<AdminPanelProps> = ({ cms, onLogout, onShowToast }) => {
  const storage = StorageService.getInstance();
  const [activeMenu, setActiveMenu] = useState<AdminMenu>('Dasbor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Restore URL hash for menu preservation on refresh
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as AdminMenu;
    const validMenus: AdminMenu[] = [
      'Dasbor',
      'Siswa',
      'Materi',
      'Nilai',
      'CMS',
      'Sinkronisasi',
      'Penggunaan Firebase',
      'Kata Sandi',
      'Log Aktivitas',
    ];
    if (validMenus.includes(hash)) {
      setActiveMenu(hash);
    }
  }, []);

  const handleSelectMenu = (menu: AdminMenu) => {
    setActiveMenu(menu);
    window.location.hash = menu;
    setMobileMenuOpen(false);
  };

  // Touch session on activity
  useEffect(() => {
    const handleTouch = () => storage.touchSession();
    window.addEventListener('click', handleTouch);
    window.addEventListener('scroll', handleTouch);
    return () => {
      window.removeEventListener('click', handleTouch);
      window.removeEventListener('scroll', handleTouch);
    };
  }, [storage]);

  const menuItems: { name: AdminMenu; icon: React.ReactNode }[] = [
    { name: 'Dasbor', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { name: 'Siswa', icon: <Users className="w-5 h-5 shrink-0" /> },
    { name: 'Materi', icon: <BookOpen className="w-5 h-5 shrink-0" /> },
    { name: 'Nilai', icon: <Award className="w-5 h-5 shrink-0" /> },
    { name: 'CMS', icon: <Palette className="w-5 h-5 shrink-0" /> },
    { name: 'Sinkronisasi', icon: <RefreshCw className="w-5 h-5 shrink-0" /> },
    { name: 'Penggunaan Firebase', icon: <Server className="w-5 h-5 shrink-0" /> },
    { name: 'Kata Sandi', icon: <KeyRound className="w-5 h-5 shrink-0" /> },
    { name: 'Log Aktivitas', icon: <History className="w-5 h-5 shrink-0" /> },
  ];

  const logoUrl = cms.logoValue || 'https://i.ibb.co.com/nqfqhc29/kdu.png';

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#ECFEFF] selection:bg-[#2DD4BF] selection:text-[#042F2E]">
      {/* HP STICKY HEADER (56-64px, ONLY logo/short name and hamburger) */}
      <header className="md:hidden sticky top-0 z-40 h-[60px] bg-[#042F2E]/80 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={logoUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-8 h-8 object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-bold text-sm text-[#ECFEFF] truncate">
            {cms.shortName}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#ECFEFF] hover:text-[#2DD4BF] cursor-pointer"
          aria-label={mobileMenuOpen ? 'Tutup' : 'Menu'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE DRAWER BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (Desktop Fixed, Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 md:z-10 h-screen w-[260px] sm:w-[280px] bg-[#0F766E]/50 backdrop-blur-[var(--glass-blur,18px)] border-r border-white/15 flex flex-col justify-between p-4 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar flex-1 pr-1">
          {/* Logo & Institution */}
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
                Admin Panel
              </span>
            </div>
          </div>

          <hr className="border-t border-white/10 my-1" />

          {/* Menu Items (Dasbor, Siswa, Materi, Nilai, CMS, Sinkronisasi, Penggunaan Firebase, Kata Sandi, Log Aktivitas) */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectMenu(item.name)}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2DD4BF] text-[#042F2E] font-semibold shadow-md shadow-[#2DD4BF]/20'
                      : 'text-[#A5D8D3] hover:text-[#ECFEFF] hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Item Keluar at Bottom */}
        <div className="pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onLogout}
            className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl font-medium text-sm text-[#A5D8D3] hover:text-red-400 hover:bg-white/10 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>{cms.labelKeluar}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {activeMenu === 'Dasbor' && <AdminDashboard />}
        {activeMenu === 'Siswa' && <AdminStudents onShowToast={onShowToast} />}
        {activeMenu === 'Materi' && <AdminMaterials cms={cms} onShowToast={onShowToast} />}
        {activeMenu === 'Nilai' && <AdminGrades onShowToast={onShowToast} />}
        {activeMenu === 'CMS' && <AdminCms cms={cms} onShowToast={onShowToast} />}
        {activeMenu === 'Sinkronisasi' && <AdminSync onShowToast={onShowToast} />}
        {activeMenu === 'Penggunaan Firebase' && <AdminFirebaseQuota />}
        {activeMenu === 'Kata Sandi' && <AdminPassword onShowToast={onShowToast} />}
        {activeMenu === 'Log Aktivitas' && <AdminActivityLogs />}
      </main>
    </div>
  );
};
