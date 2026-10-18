// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2600);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B4F4A] border border-[#2DD4BF]/40 text-[#ECFEFF] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-[#2DD4BF] shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export const OfflineBadge: React.FC<{ label?: string }> = ({ label = 'Offline' }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-medium backdrop-blur-md shadow-lg">
      <WifiOff className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
};
