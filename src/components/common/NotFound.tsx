// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

interface NotFoundProps {
  onBack: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="p-8 sm:p-12 max-w-md w-full text-center flex flex-col items-center">
        <span className="text-6xl font-extrabold text-[#2DD4BF] font-mono mb-2">404</span>
        <h2 className="text-xl font-bold text-[#ECFEFF] mb-6">Halaman Tidak Ditemukan</h2>
        <GlassButton variant="primary" onClick={onBack}>
          Kembali
        </GlassButton>
      </GlassCard>
    </div>
  );
};
