// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Video,
  FileCode,
  Table as TableIcon,
  Minus,
  Check,
  Gamepad2,
  HelpCircle,
  Save,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Sliders,
  X,
} from 'lucide-react';
import {
  Material,
  MaterialPage,
  MaterialBlock,
  BlockType,
  PageType,
  QuestionItem,
  QuizOption,
  CmsSettings,
} from '../../types';
import { StorageService } from '../../services/storageService';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassInput } from '../common/GlassInput';
import { GlassSelect } from '../common/GlassSelect';
import { ImageUploader } from '../common/ImageUploader';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MobileSidebarDrawer } from '../common/MobileSidebarDrawer';

interface AdminMaterialsProps {
  cms: CmsSettings;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminMaterials: React.FC<AdminMaterialsProps> = ({ cms, onShowToast }) => {
  const storage = StorageService.getInstance();
  const [materials, setMaterials] = useState<Material[]>(storage.getMaterials());
  const [search, setSearch] = useState('');
  const [activeMaterialId, setActiveMaterialId] = useState<string>(() => {
    const list = storage.getMaterials();
    return list[0]?.id || '';
  });
  const [activePageIdx, setActivePageIdx] = useState<number>(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  // Material Metadata Modal (Add / Edit Metadata)
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [editingMetaMaterialId, setEditingMetaMaterialId] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaSubject, setMetaSubject] = useState('');
  const [metaTargetClasses, setMetaTargetClasses] = useState<string[]>(['Semua Kelas']);
  const [metaStatus, setMetaStatus] = useState<'Tampil' | 'Sembunyi'>('Tampil');
  const [metaOrder, setMetaOrder] = useState<number>(1);

  // Delete Material Confirmation
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

  // Active Material & Active Page
  const activeMaterial = useMemo(() => {
    return materials.find((m) => m.id === activeMaterialId) || materials[0] || null;
  }, [materials, activeMaterialId]);

  const activePage: MaterialPage | null = useMemo(() => {
    if (!activeMaterial || !activeMaterial.pages.length) return null;
    return activeMaterial.pages[activePageIdx] || activeMaterial.pages[0];
  }, [activeMaterial, activePageIdx]);

  const classes = useMemo(() => storage.getClasses(), [storage]);
  const availableClasses = useMemo(() => ['Semua Kelas', ...classes], [classes]);

  // Group materials by subject for sidebar navigation
  const materialsBySubject = useMemo(() => {
    const map: Record<string, Material[]> = {};
    const filtered = materials.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });

    filtered.forEach((m) => {
      if (!map[m.subject]) {
        map[m.subject] = [];
      }
      map[m.subject].push(m);
    });

    return map;
  }, [materials, search]);

  // Auto-expand active subject on load
  useEffect(() => {
    if (activeMaterial?.subject) {
      setExpandedSubjects((prev) => ({ ...prev, [activeMaterial.subject]: true }));
    }
  }, [activeMaterial?.subject]);

  const toggleSubject = (sub: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [sub]: !prev[sub] }));
  };

  // Switch Active Material
  const handleSelectMaterial = (m: Material) => {
    setActiveMaterialId(m.id);
    setActivePageIdx(0);
    setMobileDrawerOpen(false);
  };

  // Open Metadata Modal for Add
  const openAddMaterialModal = () => {
    setEditingMetaMaterialId(null);
    setMetaTitle('');
    setMetaSubject(activeMaterial?.subject || 'Informatika');
    setMetaTargetClasses(['Semua Kelas']);
    setMetaStatus('Tampil');
    setMetaOrder(materials.length + 1);
    setIsMetadataModalOpen(true);
    setMobileDrawerOpen(false);
  };

  // Open Metadata Modal for Edit
  const openEditMaterialModal = (m: Material) => {
    setEditingMetaMaterialId(m.id);
    setMetaTitle(m.title);
    setMetaSubject(m.subject);
    setMetaTargetClasses(m.targetClasses || ['Semua Kelas']);
    setMetaStatus(m.status);
    setMetaOrder(m.order);
    setIsMetadataModalOpen(true);
  };

  // Save Material Metadata
  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaTitle.trim()) {
      onShowToast('Judul materi wajib diisi', 'error');
      return;
    }
    if (!metaSubject.trim()) {
      onShowToast('Mata pelajaran wajib diisi', 'error');
      return;
    }

    if (editingMetaMaterialId) {
      // Update existing
      const updated = materials.map((m) => {
        if (m.id === editingMetaMaterialId) {
          return {
            ...m,
            title: metaTitle.trim(),
            subject: metaSubject.trim(),
            targetClasses: metaTargetClasses,
            status: metaStatus,
            order: metaOrder,
          };
        }
        return m;
      });
      storage.saveMaterials(updated);
      setMaterials(updated);
      onShowToast('Info materi berhasil disimpan');
    } else {
      // Create new
      const newMat: Material = {
        id: 'mat-' + Date.now(),
        title: metaTitle.trim(),
        subject: metaSubject.trim(),
        targetClasses: metaTargetClasses,
        status: metaStatus,
        order: metaOrder,
        pages: [
          {
            id: 'page-' + Date.now() + '-1',
            title: 'Halaman 1',
            type: 'materi',
            blocks: [
              {
                id: 'blk-' + Date.now(),
                type: 'text',
                text: {
                  content: 'Materi pembelajaran baru.',
                  style: 'paragraph',
                },
              },
            ],
          },
        ],
      };
      const updated = [...materials, newMat];
      storage.saveMaterials(updated);
      setMaterials(updated);
      setActiveMaterialId(newMat.id);
      setActivePageIdx(0);
      onShowToast('Materi baru berhasil ditambahkan');
    }

    setIsMetadataModalOpen(false);
  };

  // Delete Material
  const handleDeleteMaterial = () => {
    if (!deleteTarget) return;
    const updated = materials.filter((m) => m.id !== deleteTarget.id);
    storage.saveMaterials(updated);
    setMaterials(updated);
    if (activeMaterialId === deleteTarget.id) {
      setActiveMaterialId(updated[0]?.id || '');
      setActivePageIdx(0);
    }
    setDeleteTarget(null);
    onShowToast('Materi berhasil dihapus');
  };

  // Save current material state to storage
  const saveCurrentMaterial = (updatedMat: Material, toastMsg = 'Perubahan berhasil disimpan') => {
    const updatedList = materials.map((m) => (m.id === updatedMat.id ? updatedMat : m));
    storage.saveMaterials(updatedList);
    setMaterials(updatedList);
    if (toastMsg) onShowToast(toastMsg);
  };

  // Add Page
  const handleAddPage = () => {
    if (!activeMaterial) return;
    const newPageNum = activeMaterial.pages.length + 1;
    const newPage: MaterialPage = {
      id: 'page-' + Date.now() + '-' + newPageNum,
      title: `Halaman ${newPageNum}`,
      type: 'materi',
      blocks: [
        {
          id: 'blk-' + Date.now(),
          type: 'text',
          text: {
            content: '',
            style: 'paragraph',
          },
        },
      ],
    };
    const updatedMat: Material = {
      ...activeMaterial,
      pages: [...activeMaterial.pages, newPage],
    };
    saveCurrentMaterial(updatedMat, 'Halaman ditambahkan');
    setActivePageIdx(updatedMat.pages.length - 1);
  };

  // Delete Page
  const handleDeletePage = (pageIdx: number) => {
    if (!activeMaterial || activeMaterial.pages.length <= 1) {
      onShowToast('Materi minimal memiliki 1 halaman', 'error');
      return;
    }
    const updatedPages = activeMaterial.pages.filter((_, idx) => idx !== pageIdx);
    const updatedMat: Material = {
      ...activeMaterial,
      pages: updatedPages,
    };
    saveCurrentMaterial(updatedMat, 'Halaman dihapus');
    setActivePageIdx(Math.max(0, pageIdx - 1));
  };

  // Update Page Field
  const updateActivePage = (updater: (prev: MaterialPage) => MaterialPage) => {
    if (!activeMaterial || !activePage) return;
    const updatedPages = [...activeMaterial.pages];
    updatedPages[activePageIdx] = updater(activePage);
    const updatedMat: Material = {
      ...activeMaterial,
      pages: updatedPages,
    };
    saveCurrentMaterial(updatedMat, '');
  };

  // Block Mutations for 'materi' page type
  const addBlock = (type: BlockType) => {
    if (!activePage) return;
    const newBlock: MaterialBlock = {
      id: 'blk-' + Date.now(),
      type,
    };

    if (type === 'text') {
      newBlock.text = { content: '', style: 'paragraph' };
    } else if (type === 'image') {
      newBlock.image = { source: 'tautan', value: '' };
    } else if (type === 'video') {
      newBlock.video = { youtubeUrl: '' };
    } else if (type === 'table') {
      newBlock.table = {
        headers: ['Kolom 1', 'Kolom 2'],
        rows: [['Data 1', 'Data 2']],
      };
    }

    updateActivePage((page) => ({
      ...page,
      blocks: [...(page.blocks || []), newBlock],
    }));
  };

  const deleteBlock = (blockIdx: number) => {
    if (!activePage) return;
    const updatedBlocks = (activePage.blocks || []).filter((_, idx) => idx !== blockIdx);
    updateActivePage((page) => ({
      ...page,
      blocks: updatedBlocks,
    }));
  };

  const moveBlock = (blockIdx: number, dir: 'up' | 'down') => {
    if (!activePage) return;
    const blocks = [...(activePage.blocks || [])];
    const targetIdx = dir === 'up' ? blockIdx - 1 : blockIdx + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const temp = blocks[blockIdx];
    blocks[blockIdx] = blocks[targetIdx];
    blocks[targetIdx] = temp;
    updateActivePage((page) => ({ ...page, blocks }));
  };

  // Render Sidebar Content (Identical to Student Sidebar + Admin Controls)
  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full text-[#ECFEFF]">
      <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar flex-1 pr-1">
        {/* Top Header & Tambah Materi Button */}
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="font-bold text-sm text-[#ECFEFF] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2DD4BF]" />
            <span>Materi</span>
          </span>
          <button
            type="button"
            onClick={openAddMaterialModal}
            className="px-3 py-1.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#2DD4BF]/90 transition-all cursor-pointer shadow-md shadow-[#2DD4BF]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative px-1">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5D8D3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi..."
            className="w-full min-h-[38px] pl-9 pr-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] placeholder-white/30 focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        <hr className="border-t border-white/10 my-1" />

        {/* List of Materials Grouped by Subject */}
        {Object.keys(materialsBySubject).length === 0 ? (
          <div className="p-4 text-center text-xs text-[#A5D8D3] italic">
            Belum ada materi
          </div>
        ) : (
          Object.entries(materialsBySubject).map(([sub, mats]) => {
            const isExpanded = !!expandedSubjects[sub];
            return (
              <div key={sub} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleSubject(sub)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl text-sm font-semibold text-[#ECFEFF] flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
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
                  <div className="flex flex-col pl-3 pr-1 py-1 gap-1">
                    {mats.map((m) => {
                      const isActive = activeMaterialId === m.id;
                      return (
                        <div
                          key={m.id}
                          className={`w-full group rounded-xl flex items-center justify-between transition-all ${
                            isActive
                              ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-semibold border border-[#2DD4BF]/40'
                              : 'text-[#ECFEFF]/80 hover:text-[#ECFEFF] hover:bg-white/10'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectMaterial(m)}
                            className="flex-1 min-h-[44px] px-3 py-2 text-left text-sm truncate flex items-center gap-2 cursor-pointer"
                          >
                            <span className="truncate">{m.title}</span>
                            {m.status === 'Sembunyi' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 shrink-0">
                                Sembunyi
                              </span>
                            )}
                          </button>

                          <div className="flex items-center gap-0.5 pr-2 opacity-80 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditMaterialModal(m);
                              }}
                              className="p-1.5 text-[#A5D8D3] hover:text-[#2DD4BF] rounded-lg hover:bg-white/10 cursor-pointer"
                              aria-label="Ubah Info"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(m);
                              }}
                              className="p-1.5 text-[#A5D8D3] hover:text-red-400 rounded-lg hover:bg-white/10 cursor-pointer"
                              aria-label="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
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
  );

  return (
    <div className="min-h-full flex flex-col md:flex-row text-[#ECFEFF] selection:bg-[#2DD4BF] selection:text-[#042F2E]">
      {/* MOBILE DRAWER UNTUK DAFTAR MATERI (Ikon Hamburger di kiri lower) */}
      <MobileSidebarDrawer
        isOpen={mobileDrawerOpen}
        onOpen={() => setMobileDrawerOpen(true)}
        onClose={() => setMobileDrawerOpen(false)}
        icon="hamburger"
        position="lower"
        ariaLabel="Buka daftar materi"
        drawerTitle="Daftar Materi"
      >
        {renderSidebarContent()}
      </MobileSidebarDrawer>

      {/* DESKTOP ASIDE UNTUK DAFTAR MATERI */}
      <aside className="hidden md:flex sticky top-0 left-0 z-10 h-screen w-[280px] bg-[#0F766E]/40 backdrop-blur-[var(--glass-blur,18px)] border-r border-white/15 flex-col justify-between p-3.5 shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* MAIN VIEW / EDITOR (SAMA PERSIS DENGAN TAMPILAN MATERI SISWA) */}
      <div className="flex-1 min-w-0 p-2 sm:p-4 md:p-6 flex flex-col items-center">
        {!activeMaterial ? (
          <GlassCard className="p-8 text-center max-w-md w-full my-auto">
            <BookOpen className="w-12 h-12 text-[#2DD4BF] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#ECFEFF] mb-2">Belum ada materi</h3>
            <GlassButton variant="primary" onClick={openAddMaterialModal} className="mx-auto">
              <Plus className="w-4 h-4" />
              <span>Tambah Materi</span>
            </GlassButton>
          </GlassCard>
        ) : (
          <div className="w-full max-w-4xl flex flex-col gap-3">
            {/* Minimalist Top Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#2DD4BF] uppercase tracking-wider">
                  {activeMaterial.subject}
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-[#ECFEFF] truncate">
                  {activeMaterial.title}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditMaterialModal(activeMaterial)}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#ECFEFF] text-xs font-medium flex items-center gap-1.5 border border-white/15 transition-all cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>Info Materi</span>
                </button>
                <GlassButton
                  variant="primary"
                  onClick={() => {
                    saveCurrentMaterial(activeMaterial, 'Materi berhasil disimpan');
                  }}
                  className="!min-h-[38px] !px-3.5 !py-1.5 !text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </GlassButton>
              </div>
            </div>

            {/* TAB HALAMAN ANGKA (1, 2, 3... SAMA DENGAN SISWA + TOMBOL TAMBAH HALAMAN) */}
            <div className="flex items-center justify-center flex-wrap gap-2 py-1">
              {activeMaterial.pages.map((p, idx) => {
                const isActive = idx === activePageIdx;
                return (
                  <button
                    key={p.id || idx}
                    type="button"
                    onClick={() => setActivePageIdx(idx)}
                    className={`min-h-[38px] rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'min-w-[56px] px-3 bg-[#2DD4BF] text-[#042F2E] shadow-lg shadow-[#2DD4BF]/25 ring-2 ring-[#2DD4BF]/40'
                        : 'min-w-[38px] px-2.5 bg-white/10 hover:bg-white/20 text-[#ECFEFF]'
                    }`}
                  >
                    <span>{idx + 1}</span>
                  </button>
                );
              })}

              {/* Tombol Tambah Halaman */}
              <button
                type="button"
                onClick={handleAddPage}
                aria-label="Tambah Halaman"
                className="min-w-[38px] min-h-[38px] px-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-[#2DD4BF] border border-dashed border-[#2DD4BF]/50 flex items-center justify-center transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* CONTENT CARD (SAMA PERSIS DENGAN KARTU ISI SISWA) */}
            {activePage && (
              <GlassCard className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
                {/* Header Kartu: Jenis Halaman & Hapus Halaman */}
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="w-56">
                    <GlassSelect
                      value={activePage.type || 'materi'}
                      onChange={(val) => {
                        updateActivePage((page) => ({
                          ...page,
                          type: val as PageType,
                        }));
                      }}
                      options={[
                        { value: 'materi', label: 'Materi Pembelajaran' },
                        { value: 'game', label: 'Game Edukatif' },
                        { value: 'kuis_akhir', label: 'Kuis Akhir (CBT)' },
                      ]}
                      ariaLabel="Jenis Halaman"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {activeMaterial.pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePage(activePageIdx)}
                        className="p-2 text-[#A5D8D3] hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Hapus Halaman"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 1. KONTEN UNTUK JENIS: MATERI */}
                {(!activePage.type || activePage.type === 'materi') && (
                  <div className="flex flex-col gap-5">
                    {/* Daftar Blok */}
                    <div className="flex flex-col gap-4">
                      {(!activePage.blocks || activePage.blocks.length === 0) ? (
                        <div className="p-6 text-center text-xs text-[#A5D8D3] border border-dashed border-white/15 rounded-xl">
                          Belum ada blok konten pada halaman ini
                        </div>
                      ) : (
                        activePage.blocks.map((block, bIdx) => (
                          <div
                            key={block.id || bIdx}
                            className="group relative p-3 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-semibold text-[#2DD4BF] uppercase tracking-wider">
                                {block.type === 'text' && 'Teks'}
                                {block.type === 'image' && 'Gambar'}
                                {block.type === 'video' && 'Video YouTube'}
                                {block.type === 'table' && 'Tabel'}
                                {block.type === 'divider' && 'Garis Pemisah'}
                              </span>

                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                <button
                                  type="button"
                                  disabled={bIdx === 0}
                                  onClick={() => moveBlock(bIdx, 'up')}
                                  className="p-1 text-[#A5D8D3] hover:text-[#ECFEFF] disabled:opacity-20 cursor-pointer"
                                  aria-label="Pindah ke atas"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
                                </button>
                                <button
                                  type="button"
                                  disabled={bIdx === (activePage.blocks?.length || 1) - 1}
                                  onClick={() => moveBlock(bIdx, 'down')}
                                  className="p-1 text-[#A5D8D3] hover:text-[#ECFEFF] disabled:opacity-20 cursor-pointer"
                                  aria-label="Pindah ke bawah"
                                >
                                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteBlock(bIdx)}
                                  className="p-1 text-[#A5D8D3] hover:text-red-400 cursor-pointer"
                                  aria-label="Hapus Blok"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Block Editors */}
                            {block.type === 'text' && (
                              <textarea
                                value={block.text?.content || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const blocks = [...(activePage.blocks || [])];
                                  blocks[bIdx] = {
                                    ...blocks[bIdx],
                                    text: {
                                      content: val,
                                      style: blocks[bIdx].text?.style || 'paragraph',
                                    },
                                  };
                                  updateActivePage((page) => ({ ...page, blocks }));
                                }}
                                placeholder="Tulis teks materi di sini..."
                                rows={3}
                                className="w-full p-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-[#ECFEFF] placeholder-white/30 focus:outline-none focus:border-[#2DD4BF]"
                              />
                            )}

                            {block.type === 'image' && (
                              <div className="flex flex-col gap-2">
                                <ImageUploader
                                  source={block.image?.source || 'tautan'}
                                  value={block.image?.value || ''}
                                  onChange={(src, val) => {
                                    const blocks = [...(activePage.blocks || [])];
                                    blocks[bIdx] = {
                                      ...blocks[bIdx],
                                      image: { source: src, value: val },
                                    };
                                    updateActivePage((page) => ({ ...page, blocks }));
                                  }}
                                  onClear={() => {
                                    const blocks = [...(activePage.blocks || [])];
                                    blocks[bIdx] = {
                                      ...blocks[bIdx],
                                      image: { source: 'tautan', value: '' },
                                    };
                                    updateActivePage((page) => ({ ...page, blocks }));
                                  }}
                                />
                                {block.image?.value && (
                                  <img
                                    src={block.image.value}
                                    alt=""
                                    className="max-h-60 rounded-lg object-contain mx-auto mt-2"
                                  />
                                )}
                              </div>
                            )}

                            {block.type === 'video' && (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  value={block.video?.youtubeUrl || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const blocks = [...(activePage.blocks || [])];
                                    blocks[bIdx] = {
                                      ...blocks[bIdx],
                                      video: { youtubeUrl: val },
                                    };
                                    updateActivePage((page) => ({ ...page, blocks }));
                                  }}
                                  placeholder="ID Video YouTube atau URL (contoh: dQw4w9WgXcQ)"
                                  className="w-full p-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-[#ECFEFF] placeholder-white/30 focus:outline-none focus:border-[#2DD4BF]"
                                />
                              </div>
                            )}

                            {block.type === 'table' && (
                              <div className="flex flex-col gap-2">
                                <textarea
                                  value={
                                    block.table
                                      ? JSON.stringify(block.table, null, 2)
                                      : ''
                                  }
                                  onChange={(e) => {
                                    try {
                                      const parsed = JSON.parse(e.target.value);
                                      const blocks = [...(activePage.blocks || [])];
                                      blocks[bIdx] = { ...blocks[bIdx], table: parsed };
                                      updateActivePage((page) => ({ ...page, blocks }));
                                    } catch {
                                      // ignore json parse error while typing
                                    }
                                  }}
                                  rows={4}
                                  className="w-full p-2.5 font-mono text-xs bg-black/40 border border-white/10 rounded-lg text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                                />
                              </div>
                            )}

                            {block.type === 'divider' && (
                              <hr className="border-t border-white/20 my-2" />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Toolbar Tambah Blok */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white/5 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => addBlock('text')}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#ECFEFF] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#2DD4BF]" />
                        <span>Teks</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('image')}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#ECFEFF] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#2DD4BF]" />
                        <span>Gambar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('video')}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#ECFEFF] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-[#2DD4BF]" />
                        <span>Video</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('table')}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#ECFEFF] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <TableIcon className="w-3.5 h-3.5 text-[#2DD4BF]" />
                        <span>Tabel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('divider')}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#ECFEFF] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5 text-[#2DD4BF]" />
                        <span>Pemisah</span>
                      </button>
                    </div>

                    {/* Uji Pemahaman Opsional di Dasar Halaman */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-[#ECFEFF] flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-[#FBBF24]" />
                          <span>Uji Pemahaman Halaman Ini</span>
                        </label>
                        <input
                          type="checkbox"
                          checked={!!activePage.question}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateActivePage((page) => ({
                                ...page,
                                question: {
                                  id: 'q-' + Date.now(),
                                  question: '',
                                  options: [
                                    { id: 'opt-A', label: 'A', text: '' },
                                    { id: 'opt-B', label: 'B', text: '' },
                                    { id: 'opt-C', label: 'C', text: '' },
                                    { id: 'opt-D', label: 'D', text: '' },
                                  ],
                                  correctOptionId: 'opt-A',
                                  delaySeconds: 5,
                                },
                              }));
                            } else {
                              updateActivePage((page) => {
                                const { question, ...rest } = page;
                                return rest as MaterialPage;
                              });
                            }
                          }}
                          className="w-5 h-5 accent-[#2DD4BF] cursor-pointer"
                        />
                      </div>

                      {activePage.question && (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-3">
                          <textarea
                            value={activePage.question.question}
                            onChange={(e) => {
                              const q = e.target.value;
                              updateActivePage((page) => ({
                                ...page,
                                question: page.question
                                  ? { ...page.question, question: q }
                                  : undefined,
                              }));
                            }}
                            placeholder="Pertanyaan uji pemahaman..."
                            rows={2}
                            className="w-full p-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-[#ECFEFF] placeholder-white/30 focus:outline-none focus:border-[#2DD4BF]"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(activePage.question.options || []).map((opt, oIdx) => (
                              <div key={opt.id} className="flex items-center gap-2">
                                <span className="w-6 text-xs font-bold text-[#2DD4BF] text-center">
                                  {opt.label}
                                </span>
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateActivePage((page) => {
                                      if (!page.question) return page;
                                      const opts = [...page.question.options];
                                      opts[oIdx] = { ...opts[oIdx], text: val };
                                      return {
                                        ...page,
                                        question: { ...page.question, options: opts },
                                      };
                                    });
                                  }}
                                  placeholder={`Pilihan ${opt.label}`}
                                  className="flex-1 p-2 bg-black/20 border border-white/10 rounded-lg text-xs text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 pt-1">
                            <div className="w-48">
                              <GlassSelect
                                label="Kunci Jawaban"
                                value={activePage.question.correctOptionId}
                                onChange={(val) => {
                                  updateActivePage((page) => ({
                                    ...page,
                                    question: page.question
                                      ? { ...page.question, correctOptionId: val }
                                      : undefined,
                                  }));
                                }}
                                options={(activePage.question.options || []).map((o) => ({
                                  value: o.id,
                                  label: `Pilihan ${o.label}`,
                                }))}
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm font-medium text-[#ECFEFF]">
                                Jeda Terbuka (Detik)
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={60}
                                value={activePage.question.delaySeconds || 5}
                                onChange={(e) => {
                                  const sec = parseInt(e.target.value, 10) || 0;
                                  updateActivePage((page) => ({
                                    ...page,
                                    question: page.question
                                      ? { ...page.question, delaySeconds: sec }
                                      : undefined,
                                  }));
                                }}
                                className="w-24 min-h-[44px] px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. KONTEN UNTUK JENIS: GAME */}
                {activePage.type === 'game' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[#ECFEFF]">
                        Kode HTML / Canvas Game
                      </label>
                      <textarea
                        value={activePage.gameHtml || ''}
                        onChange={(e) => {
                          const code = e.target.value;
                          updateActivePage((page) => ({ ...page, gameHtml: code }));
                        }}
                        placeholder="<html>...</html>"
                        rows={8}
                        className="w-full p-3 font-mono text-xs bg-black/40 border border-white/15 rounded-xl text-[#2DD4BF] focus:outline-none focus:border-[#2DD4BF]"
                      />
                    </div>

                    {/* Preview Game */}
                    {activePage.gameHtml && (
                      <div className="flex flex-col gap-2 mt-2">
                        <span className="text-xs font-semibold text-[#A5D8D3] uppercase tracking-wider">
                          Pratinjau Game
                        </span>
                        <div className="w-full h-[60vh] rounded-2xl overflow-hidden border border-white/20 bg-black/50">
                          <iframe
                            title="Game Preview"
                            srcDoc={activePage.gameHtml}
                            sandbox="allow-scripts"
                            className="w-full h-full border-0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. KONTEN UNTUK JENIS: KUIS AKHIR (CBT) */}
                {activePage.type === 'kuis_akhir' && (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#ECFEFF]">
                          Maksimal Percobaan
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={activePage.maxAttempts || 3}
                          onChange={(e) => {
                            const att = parseInt(e.target.value, 10) || 1;
                            updateActivePage((page) => ({ ...page, maxAttempts: att }));
                          }}
                          className="w-28 min-h-[44px] px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                        />
                      </div>
                    </div>

                    {/* Daftar Soal Kuis Akhir */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#ECFEFF]">
                          Daftar Soal ({activePage.quizQuestions?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newQ: QuestionItem = {
                              id: 'q-' + Date.now(),
                              question: '',
                              options: [
                                { id: 'opt-A', label: 'A', text: '' },
                                { id: 'opt-B', label: 'B', text: '' },
                                { id: 'opt-C', label: 'C', text: '' },
                                { id: 'opt-D', label: 'D', text: '' },
                              ],
                              correctOptionId: 'opt-A',
                            };
                            updateActivePage((page) => ({
                              ...page,
                              quizQuestions: [...(page.quizQuestions || []), newQ],
                            }));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#2DD4BF] text-[#042F2E] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#2DD4BF]/90 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Soal</span>
                        </button>
                      </div>

                      {(!activePage.quizQuestions || activePage.quizQuestions.length === 0) ? (
                        <div className="p-6 text-center text-xs text-[#A5D8D3] border border-dashed border-white/15 rounded-xl">
                          Belum ada soal pada kuis akhir ini
                        </div>
                      ) : (
                        activePage.quizQuestions.map((q, qIdx) => (
                          <div
                            key={q.id || qIdx}
                            className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#2DD4BF]">
                                Soal {qIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  updateActivePage((page) => ({
                                    ...page,
                                    quizQuestions: (page.quizQuestions || []).filter(
                                      (_, idx) => idx !== qIdx
                                    ),
                                  }));
                                }}
                                className="p-1 text-[#A5D8D3] hover:text-red-400 cursor-pointer"
                                aria-label="Hapus Soal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <textarea
                              value={q.question}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateActivePage((page) => {
                                  const qs = [...(page.quizQuestions || [])];
                                  qs[qIdx] = { ...qs[qIdx], question: val };
                                  return { ...page, quizQuestions: qs };
                                });
                              }}
                              placeholder="Teks pertanyaan..."
                              rows={2}
                              className="w-full p-2.5 bg-black/20 border border-white/10 rounded-lg text-sm text-[#ECFEFF] placeholder-white/30 focus:outline-none focus:border-[#2DD4BF]"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <span className="w-6 text-xs font-bold text-[#2DD4BF] text-center">
                                    {opt.label}
                                  </span>
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateActivePage((page) => {
                                        const qs = [...(page.quizQuestions || [])];
                                        const opts = [...qs[qIdx].options];
                                        opts[oIdx] = { ...opts[oIdx], text: val };
                                        qs[qIdx] = { ...qs[qIdx], options: opts };
                                        return { ...page, quizQuestions: qs };
                                      });
                                    }}
                                    placeholder={`Pilihan ${opt.label}`}
                                    className="flex-1 p-2 bg-black/20 border border-white/10 rounded-lg text-xs text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="w-48 pt-1">
                              <GlassSelect
                                label="Kunci Jawaban"
                                value={q.correctOptionId}
                                onChange={(val) => {
                                  updateActivePage((page) => {
                                    const qs = [...(page.quizQuestions || [])];
                                    qs[qIdx] = { ...qs[qIdx], correctOptionId: val };
                                    return { ...page, quizQuestions: qs };
                                  });
                                }}
                                options={q.options.map((o) => ({
                                  value: o.id,
                                  label: `Pilihan ${o.label}`,
                                }))}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>
            )}
          </div>
        )}
      </div>

      {/* METADATA MODAL (Tambah / Ubah Info Materi) */}
      {isMetadataModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMetadataModalOpen(false)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#ECFEFF]">
                  {editingMetaMaterialId ? 'Ubah Info Materi' : 'Tambah Materi Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMetadataModalOpen(false)}
                  className="p-1 text-[#A5D8D3] hover:text-[#ECFEFF] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMetadata} className="flex flex-col gap-4">
                <GlassInput
                  label="Judul Materi"
                  required
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />

                <GlassInput
                  label="Mata Pelajaran"
                  required
                  value={metaSubject}
                  onChange={(e) => setMetaSubject(e.target.value)}
                />

                <GlassSelect
                  label="Status"
                  value={metaStatus}
                  onChange={(val) => setMetaStatus(val as 'Tampil' | 'Sembunyi')}
                  options={[
                    { value: 'Tampil', label: 'Tampil' },
                    { value: 'Sembunyi', label: 'Sembunyi' },
                  ]}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#ECFEFF]">Kelas Tujuan</label>
                  <div className="flex flex-wrap gap-2">
                    {availableClasses.map((cls) => {
                      const isSelected = metaTargetClasses.includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => {
                            if (cls === 'Semua Kelas') {
                              setMetaTargetClasses(['Semua Kelas']);
                            } else {
                              let next = metaTargetClasses.filter((c) => c !== 'Semua Kelas');
                              if (next.includes(cls)) {
                                next = next.filter((c) => c !== cls);
                                if (next.length === 0) next = ['Semua Kelas'];
                              } else {
                                next.push(cls);
                              }
                              setMetaTargetClasses(next);
                            }
                          }}
                          className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#2DD4BF] text-[#042F2E]'
                              : 'bg-white/10 hover:bg-white/20 text-[#ECFEFF]'
                          }`}
                        >
                          {cls}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <GlassButton
                    type="button"
                    variant="ghost"
                    onClick={() => setIsMetadataModalOpen(false)}
                  >
                    Batal
                  </GlassButton>
                  <GlassButton type="submit" variant="primary">
                    Simpan
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Hapus materi "${deleteTarget?.title}"?`}
        confirmLabel="Hapus"
        onConfirm={handleDeleteMaterial}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
