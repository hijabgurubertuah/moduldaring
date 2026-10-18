// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Download, Upload, RotateCw } from 'lucide-react';
import { Student } from '../../types';
import { StorageService } from '../../services/storageService';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassInput } from '../common/GlassInput';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminStudentsProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminStudents: React.FC<AdminStudentsProps> = ({ onShowToast }) => {
  const storage = StorageService.getInstance();
  const [students, setStudents] = useState<Student[]>(storage.getStudents());
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [sortField, setSortField] = useState<'name' | 'nisn' | 'className'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Dialog & Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formClass, setFormClass] = useState('');
  const [errors, setErrors] = useState<{ name?: string; nisn?: string; className?: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const classes = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.className && s.className.trim()) set.add(s.className.trim());
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtering & Sorting
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchSearch =
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.nisn.includes(search);
        const matchClass = selectedClass === 'Semua' || s.className === selectedClass;
        return matchSearch && matchClass;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [students, search, selectedClass, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const pagedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page]);

  // Open modal for add or edit
  const openForm = (student?: Student) => {
    setErrors({});
    if (student) {
      setEditingStudent(student);
      setFormName(student.name);
      setFormNisn(student.nisn);
      setFormClass(student.className);
    } else {
      setEditingStudent(null);
      setFormName('');
      setFormNisn('');
      setFormClass(classes[0] || 'VII A');
    }
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; nisn?: string; className?: string } = {};

    if (!formName.trim()) newErrors.name = 'Nama wajib diisi';
    if (!/^\d{10}$/.test(formNisn.trim())) {
      newErrors.nisn = 'NISN harus 10 digit angka';
    } else {
      // Check duplicate
      const duplicate = students.find(
        (s) => s.nisn === formNisn.trim() && (!editingStudent || s.id !== editingStudent.id)
      );
      if (duplicate) {
        newErrors.nisn = 'NISN sudah terdaftar';
      }
    }
    if (!formClass.trim()) newErrors.className = 'Kelas wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: formName.trim(),
        nisn: formNisn.trim(),
        className: formClass.trim(),
      };
      storage.updateStudent(updated);
      onShowToast('Berhasil disimpan');
    } else {
      storage.addStudent({
        name: formName.trim(),
        nisn: formNisn.trim(),
        className: formClass.trim(),
      });
      onShowToast('Berhasil disimpan');
    }

    setStudents(storage.getStudents());
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    storage.deleteStudent(deleteTarget.id);
    setStudents(storage.getStudents());
    setDeleteTarget(null);
    onShowToast('Berhasil dihapus');
  };

  // Export CSV
  const handleExportCSV = () => {
    const header = 'Nama,NISN,Kelas\n';
    const rows = students.map((s) => `"${s.name}","'${s.nisn}","${s.className}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data_siswa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Berhasil diunduh');
  };

  // Import CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newImported: Student[] = [...students];
      let added = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map((p) => p.replace(/^["']|["']$/g, '').trim());
        if (parts.length >= 3) {
          const [name, nisn, className] = parts;
          if (name && /^\d{10}$/.test(nisn) && className) {
            const exists = newImported.some((s) => s.nisn === nisn);
            if (!exists) {
              newImported.push({
                id: `std-${Date.now()}-${i}`,
                name,
                nisn,
                className,
              });
              added++;
            }
          }
        }
      }

      if (added > 0) {
        storage.saveStudents(newImported);
        setStudents(newImported);
        onShowToast(`Berhasil menambah ${added} siswa`);
      } else {
        onShowToast('Tidak ada data baru', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReload = () => {
    setStudents(storage.getStudents());
    onShowToast('Data diperbarui');
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto pb-12">
      {/* Header Bar: Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#ECFEFF]">Data Siswa</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Impor CSV"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            <span>Impor</span>
          </GlassButton>
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            aria-label="Ekspor CSV"
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span>Ekspor</span>
          </GlassButton>
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={handleReload}
            aria-label="Muat Ulang"
          >
            <RotateCw className="w-4 h-4" />
          </GlassButton>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => openForm()}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Tambah Siswa</span>
          </GlassButton>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5D8D3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama atau NISN"
            className="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] placeholder-white/30 focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setPage(1);
            }}
            className="min-h-[44px] px-3.5 py-2 text-sm bg-[#0B4F4A] border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
          >
            <option value="Semua">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Students Table / Cards */}
      <GlassCard className="overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-[#A5D8D3]">
            <h3 className="text-base font-semibold">Belum ada data</h3>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-white/10 border-b border-white/15 text-[#2DD4BF] font-semibold select-none">
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-white"
                      onClick={() => {
                        if (sortField === 'name') setSortAsc(!sortAsc);
                        else {
                          setSortField('name');
                          setSortAsc(true);
                        }
                      }}
                    >
                      Nama
                    </th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-white"
                      onClick={() => {
                        if (sortField === 'nisn') setSortAsc(!sortAsc);
                        else {
                          setSortField('nisn');
                          setSortAsc(true);
                        }
                      }}
                    >
                      NISN
                    </th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-white"
                      onClick={() => {
                        if (sortField === 'className') setSortAsc(!sortAsc);
                        else {
                          setSortField('className');
                          setSortAsc(true);
                        }
                      }}
                    >
                      Kelas
                    </th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pagedStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#ECFEFF]">{s.name}</td>
                      <td className="px-4 py-3 text-[#A5D8D3] font-mono tabular-nums">{s.nisn}</td>
                      <td className="px-4 py-3 text-[#2DD4BF] font-semibold">{s.className}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openForm(s)}
                            className="p-1.5 rounded-lg text-[#A5D8D3] hover:text-[#2DD4BF] hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(s)}
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

            {/* Mobile Cards */}
            <div className="block sm:hidden divide-y divide-white/10 p-2">
              {pagedStudents.map((s) => (
                <div key={s.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-semibold text-sm text-[#ECFEFF] truncate">{s.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#A5D8D3] font-mono">{s.nisn}</span>
                      <span className="text-xs font-semibold text-[#2DD4BF]">{s.className}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openForm(s)}
                      className="p-2 text-[#A5D8D3] hover:text-[#2DD4BF] cursor-pointer"
                      aria-label="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(s)}
                      className="p-2 text-[#A5D8D3] hover:text-red-400 cursor-pointer"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-[#A5D8D3]">
                <span>
                  Halaman {page} dari {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-white/10 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/20 text-[#ECFEFF] cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-white/10 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/20 text-[#ECFEFF] cursor-pointer"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>

      {/* Form Modal: Add / Edit Student */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-[#ECFEFF] mb-5">
                {editingStudent ? 'Ubah Siswa' : 'Tambah Siswa'}
              </h3>
              <form onSubmit={handleSaveStudent} className="flex flex-col gap-4">
                <GlassInput
                  label="Nama"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  error={errors.name}
                />

                <GlassInput
                  label="NISN"
                  required
                  value={formNisn}
                  onChange={(e) => setFormNisn(e.target.value)}
                  error={errors.nisn}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#ECFEFF] flex items-center gap-1">
                    <span>Kelas</span>
                    <span className="text-[#FBBF24]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full min-h-[48px] px-4 py-2.5 text-base bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
                  />
                  {errors.className && (
                    <span className="text-xs text-red-400 font-medium px-1">
                      {errors.className}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Hapus siswa ${deleteTarget?.name}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
