// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useRef } from 'react';
import { Trash2, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { GlassButton } from './GlassButton';

interface ImageUploaderProps {
  label?: string;
  source: 'drive' | 'tautan';
  value: string;
  onChange: (source: 'drive' | 'tautan', value: string) => void;
  onClear: () => void;
  isDocument?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  source,
  value,
  onChange,
  onClear,
  isDocument = false,
}) => {
  const [activeTab, setActiveTab] = useState<'Unggah' | 'Tautan'>(
    source === 'drive' ? 'Unggah' : 'Tautan'
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');

    if (isDocument) {
      if (file.type !== 'application/pdf') {
        setErrorMsg('Format file tidak didukung');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ukuran file melebihi batas');
        return;
      }
    } else {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        setErrorMsg('Format file tidak didukung');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file melebihi batas');
        return;
      }
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = () => {
      setLoading(false);
      onChange('drive', reader.result as string);
    };
    reader.onerror = () => {
      setLoading(false);
      setErrorMsg('Gagal memuat file');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <span className="text-sm font-medium text-[#ECFEFF]">{label}</span>}

      {/* Segmented Tab */}
      <div className="flex items-center gap-1 p-1 bg-black/20 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('Unggah')}
          className={`min-h-[36px] px-3.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'Unggah'
              ? 'bg-[#2DD4BF] text-[#042F2E] font-semibold'
              : 'text-[#A5D8D3] hover:text-[#ECFEFF]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Unggah</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('Tautan')}
          className={`min-h-[36px] px-3.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'Tautan'
              ? 'bg-[#2DD4BF] text-[#042F2E] font-semibold'
              : 'text-[#A5D8D3] hover:text-[#ECFEFF]'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Tautan</span>
        </button>
      </div>

      {activeTab === 'Unggah' ? (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={isDocument ? '.pdf' : 'image/jpeg,image/png,image/webp'}
            onChange={handleFileChange}
            className="hidden"
          />
          <GlassButton
            type="button"
            variant="secondary"
            loading={loading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isDocument ? 'Pilih Dokumen' : 'Pilih Gambar'}
          </GlassButton>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={source === 'tautan' ? value : ''}
            onChange={(e) => onChange('tautan', e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-[#ECFEFF] focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>
      )}

      {errorMsg && <span className="text-xs text-red-400 font-medium">{errorMsg}</span>}

      {/* Preview with Delete Button */}
      {value ? (
        <div className="flex items-center gap-3 mt-1 p-2 bg-black/20 rounded-xl border border-white/10 w-fit max-w-full">
          {isDocument ? (
            <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-xs text-[#2DD4BF] font-mono">
              PDF
            </div>
          ) : (
            <img
              src={value}
              alt=""
              referrerPolicy="no-referrer"
              className="w-16 h-16 object-contain rounded-lg bg-black/30 p-1"
              onError={(e) => {
                // Neutral fallback without error text
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
          <GlassButton
            type="button"
            variant="danger"
            size="sm"
            onClick={onClear}
            className="px-3"
            aria-label="Hapus Gambar"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Hapus Gambar</span>
          </GlassButton>
        </div>
      ) : (
        <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
          <div className="w-6 h-6 rounded border border-dashed border-white/30" />
        </div>
      )}
    </div>
  );
};
