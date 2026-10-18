// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  isContent?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  isContent = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-[var(--border-radius,20px)] border border-white/15 backdrop-blur-[var(--glass-blur,18px)] shadow-xl transition-all duration-200 ${
        isContent ? 'bg-[#0F766E]/55' : 'bg-[#0F766E]/40'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
