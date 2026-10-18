// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  children: React.ReactNode;
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  children,
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Touch drag state for smooth swipe-to-close
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchStartX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const lastTouchX = useRef<number>(0);

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Lock body scroll and restore focus
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
        setTimeout(() => {
          triggerRef.current?.focus();
        }, 50);
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Touch gestures on drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    lastTouchX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartX.current;
    lastTouchX.current = currentX;

    // Only allow dragging to the left (closing)
    if (deltaX < 0) {
      setDragOffset(deltaX);
    } else {
      setDragOffset(0);
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const drawerWidth = drawerRef.current?.offsetWidth || 260;
    const deltaX = lastTouchX.current - touchStartX.current;
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(deltaX) / (deltaTime || 1);

    // Close if dragged past 1/3 width or fast flick to the left
    if (deltaX < -drawerWidth / 3 || (deltaX < -30 && velocity > 0.4)) {
      onClose();
    }
    setDragOffset(0);
  }, [isDragging, onClose]);

  // Calculate drawer transform
  let drawerTransform = '';
  let drawerTransition = '';
  let backdropOpacity = isOpen ? 1 : 0;

  if (prefersReducedMotion) {
    drawerTransform = isOpen ? 'translateX(0)' : 'translateX(-100%)';
    drawerTransition = 'opacity 150ms ease';
  } else {
    if (isDragging) {
      drawerTransform = `translateX(${dragOffset}px)`;
      drawerTransition = 'none';
      const drawerWidth = drawerRef.current?.offsetWidth || 260;
      backdropOpacity = Math.max(0, Math.min(1, (drawerWidth + dragOffset) / drawerWidth));
    } else {
      drawerTransform = isOpen ? 'translateX(0)' : 'translateX(-100%)';
      drawerTransition = isOpen
        ? 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)'
        : 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)';
    }
  }

  return (
    <>
      {/* --- TOMBOL PEGANGAN SIDEBAR HP (25px x 120px, HAMPIR TRANSPARAN) --- */}
      <button
        ref={triggerRef}
        type="button"
        onClick={onOpen}
        aria-label="Buka menu"
        aria-expanded={isOpen}
        className={`md:hidden fixed top-1/2 -translate-y-1/2 z-30 select-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2DD4BF] ${
          isOpen
            ? '-translate-x-full opacity-0 pointer-events-none'
            : 'translate-x-0 opacity-100 pointer-events-auto'
        } transition-all ${
          prefersReducedMotion ? 'duration-150' : 'duration-300'
        } ease-[cubic-bezier(0.4,0,0.2,1)]`}
        style={{
          left: 'env(safe-area-inset-left, 0px)',
          width: '25px', // Exact display size
          height: '120px',
        }}
      >
        <div className="w-[25px] h-[120px] bg-[#0F766E]/12 backdrop-blur-[4px] rounded-r-[14px] border-t border-r border-b border-white/[0.08] border-l-0 shadow-md shadow-black/10 flex flex-col items-center justify-between py-3 transition-all duration-150 active:bg-[#0F766E]/40 active:scale-[0.96] hover:bg-[#0F766E]/25">
          {/* Top vertical accent line (22px, 2px, #2DD4BF ~50% opacity) */}
          <div className="w-[2px] h-[22px] bg-[#2DD4BF]/50 rounded-full shrink-0" />

          {/* Middle 3-line hamburger icon (14px, #ECFEFF ~50% opacity) */}
          <div className="w-[14px] flex flex-col justify-center items-center gap-[3px] py-1 opacity-50">
            <span className="w-[14px] h-[2px] bg-[#ECFEFF] rounded-full block" />
            <span className="w-[14px] h-[2px] bg-[#ECFEFF] rounded-full block" />
            <span className="w-[14px] h-[2px] bg-[#ECFEFF] rounded-full block" />
          </div>

          {/* Bottom vertical accent line (22px, 2px, #2DD4BF ~50% opacity) */}
          <div className="w-[2px] h-[22px] bg-[#2DD4BF]/50 rounded-full shrink-0" />
        </div>
      </button>

      {/* --- BACKDROP (Lapisan gelap toska transparan dengan blur ringan ~6px) --- */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-[#042F2E]/55 backdrop-blur-[6px] transition-opacity ${
          prefersReducedMotion ? 'duration-150' : isOpen ? 'duration-300' : 'duration-[240ms]'
        } ${isOpen ? 'pointer-events-auto' : 'pointer-events-none opacity-0'}`}
        style={{ opacity: isOpen ? backdropOpacity : 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* --- DRAWER (Mobile: 72vw, max 280px) --- */}
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`md:hidden fixed top-0 left-0 z-40 h-screen w-[72vw] max-w-[280px] bg-[#0F766E]/50 backdrop-blur-[var(--glass-blur,18px)] border-r border-white/15 flex flex-col justify-between p-3.5 shadow-2xl`}
        style={{
          transform: drawerTransform,
          transition: drawerTransition,
          paddingLeft: 'max(0.875rem, env(safe-area-inset-left))',
          paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Navigasi"
      >
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </>
  );
};
