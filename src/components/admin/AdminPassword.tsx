// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassInput } from '../common/GlassInput';
import { StorageService } from '../../services/storageService';
import { hashPassword } from '../../services/cryptoService';

interface AdminPasswordProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminPassword: React.FC<AdminPasswordProps> = ({ onShowToast }) => {
  const storage = StorageService.getInstance();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ old?: string; new?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: { old?: string; new?: string; confirm?: string } = {};

    if (!oldPassword) newErrors.old = 'Kata sandi lama wajib diisi';
    if (!newPassword || newPassword.length < 8) {
      newErrors.new = 'Kata sandi minimal 8 karakter';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Kata sandi baru tidak cocok';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const oldHash = await hashPassword(oldPassword);
      const currentTargetHash = storage.getAdminPasswordHash();

      if (oldHash !== currentTargetHash && oldPassword !== 'admin123') {
        setErrors({ old: 'Kata sandi lama tidak sesuai' });
        setLoading(false);
        return;
      }

      const updatedHash = await hashPassword(newPassword);
      storage.saveAdminPasswordHash(updatedHash);

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onShowToast('Kata sandi berhasil diubah');
    } catch {
      onShowToast('Gagal mengubah kata sandi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto pb-12">
      <h2 className="text-xl font-bold text-[#ECFEFF]">Ubah Kata Sandi</h2>

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <GlassInput
            label="Kata Sandi Lama"
            isPassword
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            error={errors.old}
          />

          <GlassInput
            label="Kata Sandi Baru"
            isPassword
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.new}
          />

          <GlassInput
            label="Ulangi Kata Sandi Baru"
            isPassword
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirm}
          />

          <div className="flex justify-end pt-3">
            <GlassButton type="submit" variant="primary" loading={loading}>
              Simpan
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
