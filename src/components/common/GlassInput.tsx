// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  isPassword = false,
  required,
  className = '',
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#ECFEFF] flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-[#FBBF24]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type={inputType}
          required={required}
          className={`w-full min-h-[48px] px-4 py-2.5 text-base bg-white/10 border ${
            error ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-[#2DD4BF]'
          } rounded-xl text-[#ECFEFF] placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#2DD4BF]/50 transition-all ${
            isPassword ? 'pr-12' : ''
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 p-2 text-[#A5D8D3] hover:text-[#ECFEFF] min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
            aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-400 font-medium px-1">{error}</span>}
    </div>
  );
};
