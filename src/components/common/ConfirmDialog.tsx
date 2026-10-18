// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#ECFEFF] text-center mb-6">
            {title}
          </h3>
          <div className="flex items-center gap-3 justify-end">
            <GlassButton
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              {cancelLabel}
            </GlassButton>
            <GlassButton
              variant={variant}
              onClick={onConfirm}
              className="flex-1"
            >
              {confirmLabel}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
