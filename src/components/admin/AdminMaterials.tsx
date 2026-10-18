// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Copy,
  Layers,
  FileText,
  Image as ImageIcon,
  Video,
  FileCode,
  Table as TableIcon,
  Minus,
  Check,
  Gamepad2,
  HelpCircle,
  Award,
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
import { ImageUploader } from '../common/ImageUploader';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MaterialViewer } from '../student/MaterialViewer';

interface AdminMaterialsProps {
  cms: CmsSettings;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminMaterials: React.FC<AdminMaterialsProps> = ({ cms, onShowToast }) => {
  const storage = StorageService.getInstance();
  const [materials, setMaterials] = useState<Material[]>(storage.getMaterials());
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

  // Editor form state
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formTargetClasses, setFormTargetClasses] = useState<string[]>(['Semua Kelas']);
  const [formStatus, setFormStatus] = useState<'Tampil' | 'Sembunyi'>('Tampil');
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formPages, setFormPages] = useState<MaterialPage[]>([]);
  const [activePageIdx, setActivePageIdx] = useState<number>(0);
  const [errors, setErrors] = useState<{ title?: string; subject?: string }>({});

  const classes = useMemo(() => storage.getClasses(), [storage]);
  const availableClasses = useMemo(() => ['Semua Kelas', ...classes], [classes]);

  const existingSubjects = useMemo(() => {
    const set = new Set<string>();
    materials.forEach((m) => {
      if (m.subject) set.add(m.subject);
    });
    return Array.from(set).sort();
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((m) => {
        const matchSearch =
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.subject.toLowerCase().includes(search.toLowerCase());
        const matchSub = subjectFilter === 'Semua' || m.subject === subjectFilter;
        const matchStat = statusFilter === 'Semua' || m.status === statusFilter;
        return matchSearch && matchSub && matchStat;
      })
      .sort((a, b) => a.order - b.order);
  }, [materials, search, subjectFilter, statusFilter]);

  // Open editor
  const openEditor = (m?: Material) => {
    setErrors({});
    if (m) {
      setEditingMaterial(m);
      setFormTitle(m.title);
      setFormSubject(m.subject);
      setFormTargetClasses(m.targetClasses.length > 0 ? m.targetClasses : ['Semua Kelas']);
      setFormStatus(m.status);
      setFormOrder(m.order);
      setFormPages(JSON.parse(JSON.stringify(m.pages)));
      setActivePageIdx(0);
    } else {
      setEditingMaterial(null);
      setFormTitle('');
      setFormSubject(existingSubjects[0] || 'Matematika');
      setFormTargetClasses(['Semua Kelas']);
      setFormStatus('Tampil');
      setFormOrder(materials.length + 1);
      setFormPages([
        {
          id: `p-${Date.now()}`,
          type: 'materi',
          title: 'Halaman 1',
          blocks: [
            {
              id: `b-${Date.now()}`,
              type: 'text',
              text: {
                style: 'heading',
                content: 'Judul Bagian',
              },
            },
            {
              id: `b-${Date.now() + 1}`,
              type: 'text',
              text: {
                style: 'paragraph',
                content: 'Tuliskan isi materi pelajaran di sini.',
              },
            },
          ],
        },
      ]);
      setActivePageIdx(0);
    }
    setIsEditorOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; subject?: string } = {};
    if (!formTitle.trim()) newErrors.title = 'Judul materi wajib diisi';
    if (!formSubject.trim()) newErrors.subject = 'Mata pelajaran wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: Material = {
      id: editingMaterial ? editingMaterial.id : `mat-${Date.now()}`,
      title: formTitle.trim(),
      subject: formSubject.trim(),
      targetClasses: formTargetClasses.length > 0 ? formTargetClasses : ['Semua Kelas'],
      status: formStatus,
      order: formOrder,
      pages: formPages,
    };

    storage.saveMaterial(payload);
    setMaterials(storage.getMaterials());
    setIsEditorOpen(false);
    onShowToast('Berhasil disimpan');
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    storage.deleteMaterial(deleteTarget.id);
    setMaterials(storage.getMaterials());
    setDeleteTarget(null);
    onShowToast('Berhasil dihapus');
  };

  // Reordering in table
  const handleMoveOrder = (material: Material, direction: 'up' | 'down') => {
    const list = [...materials].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((m) => m.id === material.id);
    if (direction === 'up' && idx > 0) {
      const prev = list[idx - 1];
      const temp = material.order;
      material.order = prev.order;
      prev.order = temp;
      storage.saveMaterials(list);
      setMaterials(storage.getMaterials());
    } else if (direction === 'down' && idx < list.length - 1) {
      const next = list[idx + 1];
      const temp = material.order;
      material.order = next.order;
      next.order = temp;
      storage.saveMaterials(list);
      setMaterials(storage.getMaterials());
    }
  };

  // Page Operations in Editor
  const addPage = () => {
    const newPage: MaterialPage = {
      id: `p-${Date.now()}`,
      type: 'materi',
      title: `Halaman ${formPages.length + 1}`.slice(0, 20),
      blocks: [
        {
          id: `b-${Date.now()}`,
          type: 'text',
          text: {
            style: 'paragraph',
            content: '',
          },
        },
      ],
    };
    setFormPages([...formPages, newPage]);
    setActivePageIdx(formPages.length);
  };

  const duplicatePage = (idx: number) => {
    const source = formPages[idx];
    const cloned: MaterialPage = {
      ...JSON.parse(JSON.stringify(source)),
      id: `p-${Date.now()}`,
      title: `${source.title || 'Halaman'} (Salinan)`.slice(0, 20),
    };
    const updated = [...formPages];
    updated.splice(idx + 1, 0, cloned);
    setFormPages(updated);
    setActivePageIdx(idx + 1);
  };

  const deletePage = (idx: number) => {
    if (formPages.length <= 1) return;
    const updated = formPages.filter((_, i) => i !== idx);
    setFormPages(updated);
    setActivePageIdx(Math.max(0, idx - 1));
  };

  const movePage = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx > 0) {
      const updated = [...formPages];
      const temp = updated[idx - 1];
      updated[idx - 1] = updated[idx];
      updated[idx] = temp;
      setFormPages(updated);
      setActivePageIdx(idx - 1);
    } else if (direction === 'down' && idx < formPages.length - 1) {
      const updated = [...formPages];
      const temp = updated[idx + 1];
      updated[idx + 1] = updated[idx];
      updated[idx] = temp;
      setFormPages(updated);
      setActivePageIdx(idx + 1);
    }
  };

  const setPageType = (idx: number, newType: PageType) => {
    const updated = [...formPages];
    const page = updated[idx];
    if (!page) return;
    page.type = newType;
    if (newType === 'materi' && !page.blocks) {
      page.blocks = [
        {
          id: `b-${Date.now()}`,
          type: 'text',
          text: { style: 'paragraph', content: '' },
        },
      ];
    } else if (newType === 'game' && page.gameHtml === undefined) {
      page.gameHtml = '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#042f2e;color:#ecfeff;font-family:sans-serif;}</style>\n</head>\n<body>\n  <h2>Game Pembelajaran</h2>\n</body>\n</html>';
    } else if (newType === 'kuis_akhir') {
      if (!page.quizQuestions || page.quizQuestions.length === 0) {
        page.quizQuestions = [
          {
            id: `qk-${Date.now()}`,
            question: '',
            options: [
              { id: 'opt-a', label: 'A', text: '' },
              { id: 'opt-b', label: 'B', text: '' },
              { id: 'opt-c', label: 'C', text: '' },
              { id: 'opt-d', label: 'D', text: '' },
            ],
            correctOptionId: 'opt-a',
          },
        ];
      }
      if (page.maxAttempts === undefined) page.maxAttempts = 0;
    }
    setFormPages(updated);
  };

  // Block Operations on current page
  const currentPage = formPages[activePageIdx];

  const addBlock = (type: BlockType) => {
    if (!currentPage) return;
    let newBlock: MaterialBlock = {
      id: `b-${Date.now()}`,
      type,
    };

    if (type === 'text') {
      newBlock.text = { style: 'paragraph', content: '' };
    } else if (type === 'image') {
      newBlock.image = { source: 'tautan', value: '' };
    } else if (type === 'video') {
      newBlock.video = { youtubeUrl: '' };
    } else if (type === 'pdf') {
      newBlock.pdf = { source: 'tautan', value: '' };
    } else if (type === 'table') {
      newBlock.table = {
        headers: ['Kolom 1', 'Kolom 2'],
        rows: [['Baris 1A', 'Baris 1B']],
      };
    }

    const updatedPages = [...formPages];
    if (!updatedPages[activePageIdx].blocks) updatedPages[activePageIdx].blocks = [];
    updatedPages[activePageIdx].blocks!.push(newBlock);
    setFormPages(updatedPages);
  };

  const updateBlock = (blockIdx: number, patch: Partial<MaterialBlock>) => {
    const updatedPages = [...formPages];
    if (!updatedPages[activePageIdx].blocks) return;
    updatedPages[activePageIdx].blocks![blockIdx] = {
      ...updatedPages[activePageIdx].blocks![blockIdx],
      ...patch,
    };
    setFormPages(updatedPages);
  };

  const removeBlock = (blockIdx: number) => {
    const updatedPages = [...formPages];
    if (!updatedPages[activePageIdx].blocks) return;
    updatedPages[activePageIdx].blocks!.splice(blockIdx, 1);
    setFormPages(updatedPages);
  };

  const moveBlock = (blockIdx: number, direction: 'up' | 'down') => {
    const blocks = formPages[activePageIdx]?.blocks || [];
    if (direction === 'up' && blockIdx > 0) {
      const updatedPages = [...formPages];
      const temp = blocks[blockIdx - 1];
      blocks[blockIdx - 1] = blocks[blockIdx];
      blocks[blockIdx] = temp;
      setFormPages(updatedPages);
    } else if (direction === 'down' && blockIdx < blocks.length - 1) {
      const updatedPages = [...formPages];
      const temp = blocks[blockIdx + 1];
      blocks[blockIdx + 1] = blocks[blockIdx];
      blocks[blockIdx] = temp;
      setFormPages(updatedPages);
    }
  };

  // Toggle class selection for targetClasses
  const handleToggleClass = (c: string) => {
    if (c === 'Semua Kelas') {
      setFormTargetClasses(['Semua Kelas']);
      return;
    }
    let updated = formTargetClasses.filter((item) => item !== 'Semua Kelas');
    if (updated.includes(c)) {
      updated = updated.filter((item) => item !== c);
      if (updated.length === 0) updated = ['Semua Kelas'];
    } else {
      updated.push(c);
    }
    setFormTargetClasses(updated);
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#ECFEFF]">Materi Pembelajaran</h2>
        <GlassButton variant="primary" size="sm" onClick={() => openEditor()}>
          <Plus className="w-4 h-4 mr-1" />
          <span>Tambah Materi</span>
        </GlassButton>
      </div>

      {/* Filter and Search */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5D8D3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi"
            className="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] placeholder-white/30 focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="min-h-[44px] px-3.5 py-2 text-sm bg-[#0B4F4A] border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
          >
            <option value="Semua">Semua Mapel</option>
            {existingSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] px-3.5 py-2 text-sm bg-[#0B4F4A] border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Tampil">Tampil</option>
            <option value="Sembunyi">Sembunyi</option>
          </select>
        </div>
      </GlassCard>

      {/* Material List */}
      <GlassCard className="overflow-hidden">
        {filteredMaterials.length === 0 ? (
          <div className="p-12 text-center text-[#A5D8D3]">
            <h3 className="text-base font-semibold">Belum ada materi</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-white/10 border-b border-white/15 text-[#2DD4BF] font-semibold">
                  <th className="px-4 py-3.5 w-16 text-center">Urutan</th>
                  <th className="px-4 py-3.5">Judul</th>
                  <th className="px-4 py-3.5">Mata Pelajaran</th>
                  <th className="px-4 py-3.5">Kelas Tujuan</th>
                  <th className="px-4 py-3.5 text-center">Halaman</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredMaterials.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(m, 'up')}
                          className="p-1 text-[#A5D8D3] hover:text-[#2DD4BF] disabled:opacity-20 cursor-pointer"
                          aria-label="Naik"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredMaterials.length - 1}
                          onClick={() => handleMoveOrder(m, 'down')}
                          className="p-1 text-[#A5D8D3] hover:text-[#2DD4BF] disabled:opacity-20 cursor-pointer"
                          aria-label="Turun"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#ECFEFF]">{m.title}</td>
                    <td className="px-4 py-3 text-[#A5D8D3]">{m.subject}</td>
                    <td className="px-4 py-3 text-xs text-[#ECFEFF]/80">
                      {m.targetClasses.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-[#A5D8D3]">
                      {m.pages?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          m.status === 'Tampil'
                            ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40'
                            : 'bg-white/10 text-[#A5D8D3]'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditor(m)}
                          className="p-1.5 rounded-lg text-[#A5D8D3] hover:text-[#2DD4BF] hover:bg-white/10 transition-colors cursor-pointer"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(m)}
                          className="p-1.5 rounded-lg text-[#A5D8D3] hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                          aria-label="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsEditorOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard isContent className="p-5 sm:p-7 flex flex-col gap-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <h3 className="text-lg font-bold text-[#ECFEFF]">
                  {editingMaterial ? 'Ubah Materi' : 'Tambah Materi'}
                </h3>
                <GlassButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  <span>Pratinjau</span>
                </GlassButton>
              </div>

              {/* Form Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Judul Materi"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  error={errors.title}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#ECFEFF] flex items-center gap-1">
                    <span>Mata Pelajaran</span>
                    <span className="text-[#FBBF24]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="subject-list"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full min-h-[48px] px-4 py-2.5 text-base bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                  />
                  <datalist id="subject-list">
                    {existingSubjects.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  {errors.subject && (
                    <span className="text-xs text-red-400 font-medium px-1">
                      {errors.subject}
                    </span>
                  )}
                </div>

                {/* Target Classes (Multi-select) */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-[#ECFEFF] flex items-center gap-1">
                    <span>Kelas Tujuan</span>
                    <span className="text-[#FBBF24]">*</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {availableClasses.map((c) => {
                      const isSelected = formTargetClasses.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleToggleClass(c)}
                          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#2DD4BF] text-[#042F2E] font-bold'
                              : 'bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-[#ECFEFF]">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="min-h-[48px] px-4 py-2.5 text-sm bg-[#0B4F4A] border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
                    >
                      <option value="Tampil">Tampil</option>
                      <option value="Sembunyi">Sembunyi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Page Tabs Manager */}
              <div className="flex flex-col gap-3 pt-4 border-t border-white/15">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#ECFEFF] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#2DD4BF]" />
                    <span>Daftar Halaman</span>
                  </span>
                  <GlassButton type="button" variant="secondary" size="sm" onClick={addPage}>
                    <Plus className="w-4 h-4 mr-1" />
                    <span>Tambah Halaman</span>
                  </GlassButton>
                </div>

                {/* Tabs Strip in Editor */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {formPages.map((page, pIdx) => {
                    const isActive = pIdx === activePageIdx;
                    return (
                      <div
                        key={page.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                          isActive
                            ? 'bg-[#2DD4BF]/20 border-[#2DD4BF] text-[#2DD4BF]'
                            : 'bg-white/5 border-white/10 text-[#A5D8D3]'
                        }`}
                      >
                        <input
                          type="text"
                          maxLength={20}
                          value={page.title}
                          onChange={(e) => {
                            const updated = [...formPages];
                            updated[pIdx].title = e.target.value.slice(0, 20);
                            setFormPages(updated);
                          }}
                          onClick={() => setActivePageIdx(pIdx)}
                          className="bg-transparent text-xs font-semibold focus:outline-none w-28 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => movePage(pIdx, 'up')}
                          disabled={pIdx === 0}
                          className="p-1 disabled:opacity-20 cursor-pointer"
                          aria-label="Pindah Kiri"
                        >
                          <ArrowUp className="w-3 h-3 rotate-[-90deg]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePage(pIdx, 'down')}
                          disabled={pIdx === formPages.length - 1}
                          className="p-1 disabled:opacity-20 cursor-pointer"
                          aria-label="Pindah Kanan"
                        >
                          <ArrowDown className="w-3 h-3 rotate-[-90deg]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicatePage(pIdx)}
                          className="p-1 hover:text-white cursor-pointer"
                          aria-label="Duplikat"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {formPages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deletePage(pIdx)}
                            className="p-1 hover:text-red-400 cursor-pointer"
                            aria-label="Hapus Halaman"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Page Editor for Active Page */}
              {currentPage && (
                <div className="flex flex-col gap-4 pt-3 border-t border-white/10">
                  {/* Page Type Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/20 p-3 rounded-xl border border-white/10">
                    <span className="text-xs font-bold text-[#A5D8D3] uppercase tracking-wider">
                      Jenis Halaman {activePageIdx + 1}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setPageType(activePageIdx, 'materi')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                          (!currentPage.type || currentPage.type === 'materi')
                            ? 'bg-[#2DD4BF] text-[#042F2E] font-bold'
                            : 'bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF]'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Materi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageType(activePageIdx, 'game')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                          currentPage.type === 'game'
                            ? 'bg-[#2DD4BF] text-[#042F2E] font-bold'
                            : 'bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF]'
                        }`}
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>Game</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageType(activePageIdx, 'kuis_akhir')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                          currentPage.type === 'kuis_akhir'
                            ? 'bg-[#2DD4BF] text-[#042F2E] font-bold'
                            : 'bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF]'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Kuis Akhir</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. MATERI EDITOR */}
                  {(!currentPage.type || currentPage.type === 'materi') && (
                    <div className="flex flex-col gap-4">
                      {/* Blocks Header & Actions */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-bold text-[#A5D8D3] uppercase tracking-wider">
                          Blok Konten
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => addBlock('text')}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-[#ECFEFF] flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-[#2DD4BF]" />
                            <span>Teks</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addBlock('image')}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-[#ECFEFF] flex items-center gap-1 cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3 text-[#2DD4BF]" />
                            <span>Gambar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addBlock('video')}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-[#ECFEFF] flex items-center gap-1 cursor-pointer"
                          >
                            <Video className="w-3 h-3 text-[#2DD4BF]" />
                            <span>Video</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addBlock('pdf')}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-[#ECFEFF] flex items-center gap-1 cursor-pointer"
                          >
                            <FileCode className="w-3 h-3 text-[#2DD4BF]" />
                            <span>PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addBlock('table')}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-[#ECFEFF] flex items-center gap-1 cursor-pointer"
                          >
                            <TableIcon className="w-3 h-3 text-[#2DD4BF]" />
                            <span>Tabel</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addBlock('divider')}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-[#ECFEFF] flex items-center gap-1 cursor-pointer"
                          >
                            <Minus className="w-3 h-3 text-[#2DD4BF]" />
                            <span>Pemisah</span>
                          </button>
                        </div>
                      </div>

                      {/* List of Blocks */}
                      <div className="flex flex-col gap-3">
                        {(currentPage.blocks || []).map((block, bIdx) => (
                          <div
                            key={block.id}
                            className="p-4 bg-black/20 rounded-xl border border-white/10 flex flex-col gap-3"
                          >
                            <div className="flex items-center justify-between text-xs text-[#A5D8D3] pb-2 border-b border-white/5">
                              <span className="font-semibold uppercase tracking-wide">
                                {block.type}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={bIdx === 0}
                                  onClick={() => moveBlock(bIdx, 'up')}
                                  className="p-1 disabled:opacity-20 cursor-pointer"
                                  aria-label="Naik"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={bIdx === (currentPage.blocks?.length || 0) - 1}
                                  onClick={() => moveBlock(bIdx, 'down')}
                                  className="p-1 disabled:opacity-20 cursor-pointer"
                                  aria-label="Turun"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeBlock(bIdx)}
                                  className="p-1 text-red-400 hover:text-red-300 cursor-pointer ml-1"
                                  aria-label="Hapus Blok"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Block Type Forms */}
                            {block.type === 'text' && (
                              <div className="flex flex-col gap-2">
                                <select
                                  value={block.text?.style || 'paragraph'}
                                  onChange={(e) =>
                                    updateBlock(bIdx, {
                                      text: {
                                        content: block.text?.content || '',
                                        style: e.target.value as any,
                                      },
                                    })
                                  }
                                  className="w-36 px-2.5 py-1 text-xs bg-[#0B4F4A] border border-white/20 rounded-lg text-[#ECFEFF] focus:outline-none"
                                >
                                  <option value="heading">Judul</option>
                                  <option value="subheading">Subjudul</option>
                                  <option value="paragraph">Paragraf</option>
                                  <option value="quote">Kutipan</option>
                                </select>
                                <textarea
                                  rows={3}
                                  value={block.text?.content || ''}
                                  onChange={(e) =>
                                    updateBlock(bIdx, {
                                      text: {
                                        style: block.text?.style || 'paragraph',
                                        content: e.target.value,
                                      },
                                    })
                                  }
                                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                                />
                              </div>
                            )}

                            {block.type === 'image' && (
                              <ImageUploader
                                source={block.image?.source || 'tautan'}
                                value={block.image?.value || ''}
                                onChange={(source, value) =>
                                  updateBlock(bIdx, {
                                    image: { source, value, caption: block.image?.caption },
                                  })
                                }
                                onClear={() =>
                                  updateBlock(bIdx, {
                                    image: { source: 'tautan', value: '', caption: '' },
                                  })
                                }
                              />
                            )}

                            {block.type === 'video' && (
                              <div className="flex flex-col gap-2">
                                <label className="text-xs text-[#A5D8D3]">Tautan YouTube</label>
                                <input
                                  type="url"
                                  value={block.video?.youtubeUrl || ''}
                                  onChange={(e) =>
                                    updateBlock(bIdx, { video: { youtubeUrl: e.target.value } })
                                  }
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                                />
                              </div>
                            )}

                            {block.type === 'pdf' && (
                              <ImageUploader
                                isDocument
                                source={block.pdf?.source || 'tautan'}
                                value={block.pdf?.value || ''}
                                onChange={(source, value) =>
                                  updateBlock(bIdx, {
                                    pdf: { source, value, name: 'Dokumen' },
                                  })
                                }
                                onClear={() =>
                                  updateBlock(bIdx, {
                                    pdf: { source: 'tautan', value: '' },
                                  })
                                }
                              />
                            )}

                            {block.type === 'table' && (
                              <div className="flex flex-col gap-2">
                                <div className="text-xs text-[#A5D8D3]">
                                  Header (pisahkan dengan koma):
                                </div>
                                <input
                                  type="text"
                                  value={(block.table?.headers || []).join(', ')}
                                  onChange={(e) => {
                                    const headers = e.target.value.split(',').map((h) => h.trim());
                                    updateBlock(bIdx, {
                                      table: {
                                        headers,
                                        rows: block.table?.rows || [],
                                      },
                                    });
                                  }}
                                  className="w-full px-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF]"
                                />
                              </div>
                            )}

                            {block.type === 'divider' && (
                              <div className="py-2 text-center text-xs text-[#A5D8D3]">
                                Pemisah Garis
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Uji Pemahaman Section */}
                      <div className="p-4 bg-black/25 rounded-xl border border-white/15 flex flex-col gap-3 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4" />
                            <span>Uji Pemahaman Halaman Ini</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formPages];
                              if (currentPage.question) {
                                delete updated[activePageIdx].question;
                              } else {
                                updated[activePageIdx].question = {
                                  id: `q-${Date.now()}`,
                                  question: '',
                                  options: [
                                    { id: 'opt-a', label: 'A', text: '' },
                                    { id: 'opt-b', label: 'B', text: '' },
                                    { id: 'opt-c', label: 'C', text: '' },
                                    { id: 'opt-d', label: 'D', text: '' },
                                  ],
                                  correctOptionId: 'opt-a',
                                  delaySeconds: 10,
                                };
                              }
                              setFormPages(updated);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              currentPage.question
                                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                : 'bg-[#2DD4BF]/20 text-[#2DD4BF] hover:bg-[#2DD4BF]/30'
                            }`}
                          >
                            {currentPage.question ? 'Hapus Pertanyaan' : 'Tambah Pertanyaan'}
                          </button>
                        </div>

                        {currentPage.question && (
                          <div className="flex flex-col gap-3 pt-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-[#A5D8D3]">Teks Pertanyaan</label>
                              <textarea
                                rows={2}
                                value={currentPage.question.question}
                                onChange={(e) => {
                                  const updated = [...formPages];
                                  if (updated[activePageIdx].question) {
                                    updated[activePageIdx].question!.question = e.target.value;
                                  }
                                  setFormPages(updated);
                                }}
                                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {currentPage.question.options.map((opt, oIdx) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...formPages];
                                      if (updated[activePageIdx].question) {
                                        updated[activePageIdx].question!.correctOptionId = opt.id;
                                      }
                                      setFormPages(updated);
                                    }}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 cursor-pointer border ${
                                      currentPage.question?.correctOptionId === opt.id
                                        ? 'bg-[#34D399] text-[#042F2E] border-[#34D399]'
                                        : 'bg-white/10 text-[#A5D8D3] border-white/20'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                      const updated = [...formPages];
                                      if (updated[activePageIdx].question) {
                                        updated[activePageIdx].question!.options[oIdx].text = e.target.value;
                                      }
                                      setFormPages(updated);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                              <label className="text-xs text-[#A5D8D3]">Jeda Waktu (Detik):</label>
                              <input
                                type="number"
                                min={0}
                                max={120}
                                value={currentPage.question.delaySeconds ?? 10}
                                onChange={(e) => {
                                  const updated = [...formPages];
                                  if (updated[activePageIdx].question) {
                                    updated[activePageIdx].question!.delaySeconds = parseInt(e.target.value, 10) || 0;
                                  }
                                  setFormPages(updated);
                                }}
                                className="w-20 px-2 py-1 text-xs text-center bg-white/10 border border-white/20 rounded-lg text-[#ECFEFF]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. GAME EDITOR */}
                  {currentPage.type === 'game' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#A5D8D3] uppercase tracking-wider">
                          Kode HTML Permainan
                        </span>
                      </div>
                      <textarea
                        rows={10}
                        value={currentPage.gameHtml || ''}
                        onChange={(e) => {
                          const updated = [...formPages];
                          updated[activePageIdx].gameHtml = e.target.value;
                          setFormPages(updated);
                        }}
                        className="w-full px-3 py-2 text-xs font-mono bg-black/40 border border-white/20 rounded-xl text-[#2DD4BF] focus:outline-none focus:border-[#2DD4BF]"
                      />
                      {currentPage.gameHtml && (
                        <div className="flex flex-col gap-1.5 pt-2">
                          <span className="text-xs text-[#A5D8D3]">Pratinjau Permainan</span>
                          <div className="w-full h-64 rounded-xl overflow-hidden border border-white/20 bg-black/20">
                            <iframe
                              srcDoc={currentPage.gameHtml}
                              title="Pratinjau Game"
                              sandbox="allow-scripts"
                              className="w-full h-full border-0"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. KUIS AKHIR CBT EDITOR */}
                  {currentPage.type === 'kuis_akhir' && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-[#A5D8D3]">Batas Percobaan:</label>
                          <input
                            type="number"
                            min={0}
                            max={10}
                            value={currentPage.maxAttempts ?? 0}
                            onChange={(e) => {
                              const updated = [...formPages];
                              updated[activePageIdx].maxAttempts = parseInt(e.target.value, 10) || 0;
                              setFormPages(updated);
                            }}
                            className="w-20 px-2 py-1 text-xs text-center bg-white/10 border border-white/20 rounded-lg text-[#ECFEFF]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formPages];
                            if (!updated[activePageIdx].quizQuestions) {
                              updated[activePageIdx].quizQuestions = [];
                            }
                            updated[activePageIdx].quizQuestions!.push({
                              id: `qk-${Date.now()}`,
                              question: '',
                              options: [
                                { id: 'opt-a', label: 'A', text: '' },
                                { id: 'opt-b', label: 'B', text: '' },
                                { id: 'opt-c', label: 'C', text: '' },
                                { id: 'opt-d', label: 'D', text: '' },
                              ],
                              correctOptionId: 'opt-a',
                            });
                            setFormPages(updated);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#2DD4BF]/20 hover:bg-[#2DD4BF]/30 text-xs text-[#2DD4BF] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Soal</span>
                        </button>
                      </div>

                      {/* List of Quiz Questions */}
                      <div className="flex flex-col gap-3">
                        {(currentPage.quizQuestions || []).map((q, qIdx) => (
                          <div
                            key={q.id}
                            className="p-4 bg-black/20 rounded-xl border border-white/10 flex flex-col gap-3"
                          >
                            <div className="flex items-center justify-between text-xs text-[#A5D8D3] pb-2 border-b border-white/5">
                              <span className="font-bold text-[#ECFEFF]">Soal #{qIdx + 1}</span>
                              {(currentPage.quizQuestions?.length || 0) > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formPages];
                                    updated[activePageIdx].quizQuestions!.splice(qIdx, 1);
                                    setFormPages(updated);
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-[#A5D8D3]">Teks Soal</label>
                              <textarea
                                rows={2}
                                value={q.question}
                                onChange={(e) => {
                                  const updated = [...formPages];
                                  updated[activePageIdx].quizQuestions![qIdx].question = e.target.value;
                                  setFormPages(updated);
                                }}
                                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...formPages];
                                      updated[activePageIdx].quizQuestions![qIdx].correctOptionId = opt.id;
                                      setFormPages(updated);
                                    }}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 cursor-pointer border ${
                                      q.correctOptionId === opt.id
                                        ? 'bg-[#34D399] text-[#042F2E] border-[#34D399]'
                                        : 'bg-white/10 text-[#A5D8D3] border-white/20'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                      const updated = [...formPages];
                                      updated[activePageIdx].quizQuestions![qIdx].options[oIdx].text = e.target.value;
                                      setFormPages(updated);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Modal: Batal and Satu Tombol Simpan per materi */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/15">
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditorOpen(false)}
                >
                  Batal
                </GlassButton>
                <GlassButton type="button" variant="primary" onClick={handleSaveMaterial}>
                  Simpan
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Preview Modal: Exactly what students see */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-2">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
              >
                Tutup Pratinjau
              </GlassButton>
            </div>
            <MaterialViewer
              material={{
                id: 'preview',
                title: formTitle || 'Judul Materi',
                subject: formSubject || 'Mata Pelajaran',
                targetClasses: formTargetClasses,
                status: formStatus,
                order: formOrder,
                pages: formPages,
              }}
              cms={cms}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Hapus materi ${deleteTarget?.title}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
