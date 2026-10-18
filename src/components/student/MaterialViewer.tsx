// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect, useRef } from 'react';
import { Material, MaterialPage, MaterialBlock, CmsSettings } from '../../types';
import { GlassCard } from '../common/GlassCard';

interface MaterialViewerProps {
  material: Material;
  initialPageId?: string;
  cms: CmsSettings;
  onPageChange?: (pageId: string) => void;
}

export const MaterialViewer: React.FC<MaterialViewerProps> = ({
  material,
  initialPageId,
  cms,
  onPageChange,
}) => {
  const [activePageId, setActivePageId] = useState<string>(
    initialPageId || material.pages[0]?.id || ''
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const tabStripRef = useRef<HTMLDivElement>(null);

  // Sync active page when material changes
  useEffect(() => {
    const validPageId = material.pages.some((p) => p.id === initialPageId)
      ? initialPageId!
      : material.pages[0]?.id || '';
    setActivePageId(validPageId);
  }, [material, initialPageId]);

  const activePage: MaterialPage | undefined =
    material.pages.find((p) => p.id === activePageId) || material.pages[0];

  const handleSelectTab = (pageId: string) => {
    setActivePageId(pageId);
    onPageChange?.(pageId);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Auto scroll active tab into view in the horizontal strip
  useEffect(() => {
    if (tabStripRef.current) {
      const activeEl = tabStripRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activePageId]);

  if (!material.pages || material.pages.length === 0) {
    return (
      <GlassCard className="p-12 text-center text-[#A5D8D3]">
        <h3 className="text-lg font-semibold">{cms.emptyMaterialText}</h3>
      </GlassCard>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-5 w-full max-w-[860px] mx-auto pb-12">
      {/* 1. Sticky Tab Strip */}
      <div className="sticky top-[60px] sm:top-0 z-20 py-2 -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#042F2E]/70 backdrop-blur-md">
        <div
          ref={tabStripRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {material.pages.map((page, idx) => {
            const isActive = page.id === activePage?.id;
            return (
              <button
                key={page.id}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => handleSelectTab(page.id)}
                className={`min-h-[44px] px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  cms.tabStyle === 'pill'
                    ? isActive
                      ? 'bg-[#2DD4BF] text-[#042F2E] font-semibold rounded-full shadow-md shadow-[#2DD4BF]/20 scale-100'
                      : 'bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF] hover:bg-white/15 rounded-full'
                    : isActive
                    ? 'border-b-2 border-[#2DD4BF] text-[#2DD4BF] font-semibold px-2'
                    : 'text-[#A5D8D3] hover:text-[#ECFEFF] px-2'
                }`}
              >
                {page.title || `Halaman ${idx + 1}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Content Card (Strictly NO buttons on page) */}
      <GlassCard isContent className="p-6 sm:p-10 transition-opacity duration-200">
        {activePage && (
          <div className="flex flex-col gap-6" style={{ fontSize: `${cms.contentFontSize || 16}px` }}>
            {activePage.blocks.map((block) => (
              <BlockItem key={block.id} block={block} />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

// Render individual material content block
const BlockItem: React.FC<{ block: MaterialBlock }> = ({ block }) => {
  switch (block.type) {
    case 'text': {
      if (!block.text) return null;
      const { content, style } = block.text;

      if (style === 'heading') {
        return (
          <h2 className="text-xl sm:text-2xl font-bold text-[#ECFEFF] tracking-tight pt-2 border-b border-white/10 pb-2">
            {content}
          </h2>
        );
      }
      if (style === 'subheading') {
        return (
          <h3 className="text-lg font-semibold text-[#2DD4BF] pt-1">
            {content}
          </h3>
        );
      }
      if (style === 'quote') {
        return (
          <blockquote className="px-5 py-3.5 bg-white/5 rounded-xl border border-white/15 text-[#ECFEFF] italic">
            {content}
          </blockquote>
        );
      }
      return (
        <p className="text-[#ECFEFF]/90 leading-relaxed font-normal">
          {content}
        </p>
      );
    }

    case 'image': {
      if (!block.image || !block.image.value) return null;
      return (
        <div className="w-full my-2 flex flex-col items-center">
          <div className="relative w-full rounded-2xl overflow-hidden bg-black/30 border border-white/10 flex items-center justify-center min-h-[160px]">
            <img
              src={block.image.value}
              alt={block.image.caption || ''}
              referrerPolicy="no-referrer"
              className="w-full max-h-[480px] object-contain rounded-2xl"
              onError={(e) => {
                // Neutral gray skeleton without error text
                const el = e.target as HTMLElement;
                el.style.display = 'none';
              }}
            />
          </div>
          {block.image.caption && (
            <span className="text-xs text-[#A5D8D3] mt-1.5 text-center">
              {block.image.caption}
            </span>
          )}
        </div>
      );
    }

    case 'video': {
      if (!block.video?.youtubeUrl) return null;
      // Convert YouTube URL to embed
      let embedUrl = block.video.youtubeUrl;
      const match = block.video.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${match[1]}`;
      }

      return (
        <div className="w-full my-2 aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10">
          <iframe
            src={embedUrl}
            title="Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      );
    }

    case 'pdf': {
      if (!block.pdf?.value) return null;
      return (
        <div className="w-full my-2 h-[450px] rounded-2xl overflow-hidden bg-black/40 border border-white/10">
          <iframe
            src={block.pdf.value}
            title={block.pdf.name || 'Dokumen'}
            className="w-full h-full border-0"
          />
        </div>
      );
    }

    case 'table': {
      if (!block.table || !block.table.headers) return null;
      return (
        <div className="w-full my-3 overflow-x-auto rounded-xl border border-white/15">
          <table className="w-full text-left text-sm border-collapse min-w-[360px]">
            <thead>
              <tr className="bg-white/10 border-b border-white/15">
                {block.table.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-semibold text-[#2DD4BF]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {block.table.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 text-[#ECFEFF]/90">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'divider':
      return <hr className="border-t border-white/15 my-3" />;

    default:
      return null;
  }
};
