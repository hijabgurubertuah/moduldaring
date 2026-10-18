// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const base =
    'min-h-[44px] inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] select-none rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-[#2DD4BF] text-[#042F2E] font-semibold hover:bg-[#20c4af] shadow-md shadow-[#2DD4BF]/20',
    secondary:
      'bg-white/10 text-[#ECFEFF] border border-white/20 hover:bg-white/15',
    danger:
      'bg-red-500/80 text-white border border-red-500/30 hover:bg-red-600',
    ghost:
      'text-[#A5D8D3] hover:text-[#ECFEFF] hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
};
