// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface GlassSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  error?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  disabled = false,
  required = false,
  className = '',
  triggerClassName = '',
  error,
  id,
  name,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Position and direction state
  const [coords, setCoords] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    maxHeight: number;
    openUp: boolean;
  }>({
    left: 0,
    width: 0,
    maxHeight: 240,
    openUp: false,
  });

  // Normalize options
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Recalculate coordinates based on available viewport space
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    // If trigger element has scrolled off screen, close dropdown
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsOpen(false);
      return;
    }

    const margin = 8;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    // Decide whether to open down or up
    // Prefer opening down if there's at least ~130px (approx 3 items)
    const openUp = spaceBelow < 130 && spaceAbove > spaceBelow;
    const maxAvailable = openUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(88, Math.min(240, maxAvailable));

    if (openUp) {
      setCoords({
        left: rect.left,
        width: rect.width,
        bottom: window.innerHeight - rect.top + 4,
        maxHeight,
        openUp: true,
      });
    } else {
      setCoords({
        left: rect.left,
        width: rect.width,
        top: rect.bottom + 4,
        maxHeight,
        openUp: false,
      });
    }
  }, []);

  // Handle open/close
  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, updatePosition]);

  const handleSelect = (val: string, optDisabled?: boolean) => {
    if (optDisabled) return;
    onChange(val);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={`relative flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[#ECFEFF] flex items-center gap-1 mb-1.5"
        >
          <span>{label}</span>
          {required && <span className="text-[#FBBF24]">*</span>}
        </label>
      )}

      {/* Hidden input for form submission if needed */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label}
        className={`w-full min-h-[44px] px-3.5 py-2 text-sm bg-white/10 hover:bg-white/15 border border-white/20 focus:border-[#2DD4BF] focus:outline-none rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
          isOpen ? 'border-[#2DD4BF] ring-1 ring-[#2DD4BF]/50' : ''
        } ${error ? 'border-red-400' : ''} ${triggerClassName}`}
      >
        <span
          className={`truncate flex-1 ${
            selectedOption ? 'text-[#ECFEFF] font-medium' : 'text-white/40'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#A5D8D3] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2DD4BF]' : ''
          }`}
        />
      </button>

      {error && (
        <span className="text-xs text-red-400 font-medium px-1 mt-1">{error}</span>
      )}

      {/* Dropdown Menu attached directly to column */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            tabIndex={-1}
            style={{
              position: 'fixed',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              maxHeight: `${coords.maxHeight}px`,
              overscrollBehavior: 'contain',
            }}
            className="z-50 bg-[#042F2E]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl py-1 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150"
          >
            {normalizedOptions.length === 0 ? (
              <div className="min-h-[44px] px-3.5 py-2.5 text-xs text-[#A5D8D3] flex items-center">
                Tidak ada pilihan
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value, opt.disabled)}
                    className={`min-h-[44px] px-3.5 py-2 text-sm flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      opt.disabled
                        ? 'opacity-40 pointer-events-none text-white/40'
                        : isSelected
                        ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-semibold'
                        : 'text-[#ECFEFF]/90 hover:bg-white/10 hover:text-[#ECFEFF]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#2DD4BF] shrink-0" />}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
