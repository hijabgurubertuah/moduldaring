// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect, useRef } from 'react';
import { Check, CheckCircle2, AlertCircle } from 'lucide-react';
import { Material, MaterialPage, MaterialBlock, CmsSettings, QuestionItem } from '../../types';
import { StorageService } from '../../services/storageService';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error', e);
  }
}

interface MaterialViewerProps {
  material: Material;
  initialPageId?: string;
  cms: CmsSettings;
  studentNisn?: string;
  isPreview?: boolean;
  onPageChange?: (pageId: string) => void;
}

export const MaterialViewer: React.FC<MaterialViewerProps> = ({
  material,
  initialPageId,
  cms,
  studentNisn,
  isPreview = false,
  onPageChange,
}) => {
  const storage = StorageService.getInstance();
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Sync active page from initialPageId or reset when material changes
  useEffect(() => {
    const idx = material.pages.findIndex((p) => p.id === initialPageId);
    setActivePageIndex(idx >= 0 ? idx : 0);
  }, [material.id, initialPageId]);

  const activePage: MaterialPage | undefined = material.pages[activePageIndex];

  const handleSelectPage = (idx: number) => {
    setActivePageIndex(idx);
    const targetPage = material.pages[idx];
    if (targetPage) {
      onPageChange?.(targetPage.id);
    }
  };

  const handleAdvanceToNextPage = () => {
    if (activePageIndex < material.pages.length - 1) {
      handleSelectPage(activePageIndex + 1);
    }
  };

  if (!material.pages || material.pages.length === 0) {
    return (
      <GlassCard className="p-8 text-center text-[#A5D8D3]">
        <h3 className="text-base font-semibold">{cms.emptyMaterialText}</h3>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-[6px] w-full max-w-[820px] mx-auto pb-12">
      {/* 1. Baris Tab Angka (Selalu terlihat semua, tidak digeser mendatar, rata tengah) */}
      <div className="w-full flex flex-wrap items-center justify-center gap-1 py-1">
        {material.pages.map((page, idx) => {
          const isActive = idx === activePageIndex;
          const pageNum = idx + 1;

          return (
            <button
              key={page.id}
              type="button"
              onClick={() => handleSelectPage(idx)}
              className={`h-[36px] rounded-[12px] flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer select-none border ${
                isActive
                  ? 'w-[68px] sm:w-[72px] bg-[#2DD4BF]/55 text-[#ECFEFF] border-[#2DD4BF]/60 shadow-md shadow-[#2DD4BF]/20 scale-100 font-bold'
                  : 'w-[40px] sm:w-[44px] bg-[#0F766E]/40 text-[#A5D8D3] hover:text-[#ECFEFF] hover:bg-[#0F766E]/60 border-white/10'
              }`}
              style={{
                minWidth: '32px',
              }}
              aria-label={`Halaman ${pageNum}`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* 2. Kartu Isi Halaman Berdasarkan Jenis Halaman */}
      {activePage && (
        <div key={activePage.id} className="w-full">
          {activePage.type === 'game' ? (
            <GamePageContent gameHtml={activePage.gameHtml} />
          ) : activePage.type === 'kuis_akhir' ? (
            <KuisAkhirCbtContent
              page={activePage}
              materialId={material.id}
              cms={cms}
              studentNisn={studentNisn}
              isPreview={isPreview}
            />
          ) : (
            <MateriPageContent
              page={activePage}
              materialId={material.id}
              cms={cms}
              studentNisn={studentNisn}
              isPreview={isPreview}
              isLastPage={activePageIndex === material.pages.length - 1}
              onAdvance={handleAdvanceToNextPage}
            />
          )}
        </div>
      )}
    </div>
  );
};

// --- Halaman Materi Standar + Uji Pemahaman di bawah ---
const MateriPageContent: React.FC<{
  page: MaterialPage;
  materialId: string;
  cms: CmsSettings;
  studentNisn?: string;
  isPreview?: boolean;
  isLastPage: boolean;
  onAdvance: () => void;
}> = ({ page, materialId, cms, studentNisn, isPreview, isLastPage, onAdvance }) => {
  return (
    <GlassCard isContent className="p-[14px] sm:p-6 transition-opacity duration-200">
      {/* Blok-blok Isi Materi */}
      <div className="flex flex-col gap-5" style={{ fontSize: `${cms.contentFontSize || 16}px` }}>
        {page.blocks && page.blocks.map((block) => (
          <BlockItem key={block.id} block={block} />
        ))}
      </div>

      {/* Uji Pemahaman di bagian bawah kartu isi, dipisah garis tipis */}
      {page.question && (
        <div className="mt-8 pt-6 border-t border-white/15">
          <UjiPemahamanSection
            question={page.question}
            pageId={page.id}
            materialId={materialId}
            cms={cms}
            studentNisn={studentNisn}
            isPreview={isPreview}
            isLastPage={isLastPage}
            onAdvance={onAdvance}
          />
        </div>
      )}
    </GlassCard>
  );
};

// --- Komponen Uji Pemahaman Interaktif ---
const UjiPemahamanSection: React.FC<{
  question: QuestionItem;
  pageId: string;
  materialId: string;
  cms: CmsSettings;
  studentNisn?: string;
  isPreview?: boolean;
  isLastPage: boolean;
  onAdvance: () => void;
}> = ({ question, pageId, materialId, cms, studentNisn, isPreview, isLastPage, onAdvance }) => {
  const storage = StorageService.getInstance();
  const nisn = studentNisn || 'anon';

  // Check saved status
  const savedStatus = !isPreview ? storage.getUjiStatus(nisn, materialId, pageId) : { isAnswered: false, attempts: 0, score: 0 };

  const [isVisible, setIsVisible] = useState<boolean>(savedStatus.isAnswered);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    savedStatus.isAnswered ? (savedStatus.selectedOptionId || question.correctOptionId) : null
  );
  const [wrongOptionIds, setWrongOptionIds] = useState<Set<string>>(new Set());
  const [shakingOptionId, setShakingOptionId] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

  // Timer for delayed question appearance
  useEffect(() => {
    if (savedStatus.isAnswered) {
      setIsVisible(true);
      return;
    }

    let delaySeconds = question.delaySeconds !== undefined ? question.delaySeconds : cms.questionDelaySeconds || 10;
    if (delaySeconds <= 0) {
      setIsVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [pageId, materialId, savedStatus.isAnswered, question.delaySeconds, cms.questionDelaySeconds]);

  // Handle Answer Selection
  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId === question.correctOptionId) return; // already solved
    if (wrongOptionIds.has(optionId)) return; // disabled

    const isCorrect = optionId === question.correctOptionId;

    if (!isPreview) {
      storage.recordUjiAttempt(nisn, materialId, pageId, isCorrect, optionId);
    }

    if (isCorrect) {
      setSelectedOptionId(optionId);
      setShowSuccessPopup(true);

      // Popup stays for popupDuration (~1.8s) then auto advances
      const duration = (cms.popupDuration || 1.8) * 1000;
      setTimeout(() => {
        setShowSuccessPopup(false);
        if (!isLastPage) {
          onAdvance();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, duration);
    } else {
      setShakingOptionId(optionId);
      setWrongOptionIds((prev) => new Set(prev).add(optionId));
      setTimeout(() => {
        setShakingOptionId(null);
      }, 350);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Pertanyaan */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-[#ECFEFF]">
          {question.question}
        </h3>
        {question.image?.value && (
          <img
            src={question.image.value}
            alt=""
            referrerPolicy="no-referrer"
            className="max-h-60 rounded-xl object-contain bg-black/20 p-1"
          />
        )}
      </div>

      {/* Kartu Opsi Pilihan Ganda */}
      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => {
          const isSelectedCorrect = selectedOptionId === opt.id && opt.id === question.correctOptionId;
          const isWrong = wrongOptionIds.has(opt.id);
          const isShaking = shakingOptionId === opt.id;

          let btnStyle = 'bg-white/10 border-white/20 hover:bg-white/15 text-[#ECFEFF]';
          if (isSelectedCorrect) {
            btnStyle = 'bg-[#34D399]/25 border-[#34D399] text-[#34D399] font-bold shadow-md shadow-[#34D399]/20';
          } else if (isWrong) {
            btnStyle = 'bg-red-500/20 border-red-500/40 text-red-300 opacity-60 cursor-not-allowed';
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isWrong || selectedOptionId === question.correctOptionId}
              onClick={() => handleSelectOption(opt.id)}
              className={`w-full min-h-[48px] p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer select-none ${btnStyle} ${
                isShaking ? 'translate-x-[-4px] animate-pulse' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center font-bold text-xs shrink-0">
                  {opt.label}
                </span>
                <span className="text-sm font-medium leading-relaxed truncate">{opt.text}</span>
              </div>
              {isSelectedCorrect && (
                <Check className="w-5 h-5 text-[#34D399] shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Popup Kaca Jawaban Benar di Tengah Layar */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="p-6 bg-[#0B4F4A]/90 border border-[#2DD4BF]/50 rounded-2xl shadow-2xl flex flex-col items-center gap-3 text-center max-w-xs animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#34D399]/20 flex items-center justify-center text-[#34D399]">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <p className="text-base font-bold text-[#ECFEFF]">
              {cms.popupSuccessText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Halaman Game (HTML Terisolasi Iframe Sandbox) ---
const GamePageContent: React.FC<{ gameHtml?: string }> = ({ gameHtml }) => {
  return (
    <GlassCard isContent className="p-0 overflow-hidden rounded-2xl border border-white/15">
      <div className="w-full h-[75vh] min-h-[420px] bg-black/40">
        <iframe
          srcDoc={gameHtml || '<div style="color:#A5D8D3;padding:20px;text-align:center;">Game belum dimuat</div>'}
          title="Game"
          sandbox="allow-scripts"
          className="w-full h-full border-0"
        />
      </div>
    </GlassCard>
  );
};

// --- Halaman Kuis Akhir (CBT) ---
const KuisAkhirCbtContent: React.FC<{
  page: MaterialPage;
  materialId: string;
  cms: CmsSettings;
  studentNisn?: string;
  isPreview?: boolean;
}> = ({ page, materialId, cms, studentNisn, isPreview }) => {
  const storage = StorageService.getInstance();
  const nisn = studentNisn || 'anon';
  const questions = page.quizQuestions || [];

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    return getStored<Record<number, string>>(`smpn1_kuis_answers_${nisn}_${materialId}`, {});
  });
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; correctCount: number; total: number } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Check attempt limit
  const attemptsCount = !isPreview ? storage.getKuisAttempts(nisn, materialId) : 0;
  const maxAttempts = page.maxAttempts || 0;
  const isLimitReached = maxAttempts > 0 && attemptsCount >= maxAttempts;

  // Persist answers
  useEffect(() => {
    if (!isPreview) {
      setStored(`smpn1_kuis_answers_${nisn}_${materialId}`, answers);
    }
  }, [answers, nisn, materialId, isPreview]);

  if (questions.length === 0) {
    return (
      <GlassCard isContent className="p-8 text-center text-[#A5D8D3]">
        <h3 className="text-base font-semibold">Kuis akhir belum memiliki soal.</h3>
      </GlassCard>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const handleSelectOption = (optId: string) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: optId }));
  };

  const handleFinish = () => {
    if (unansweredCount > 0) {
      setShowConfirmModal(true);
    } else {
      finalizeEvaluation();
    }
  };

  const finalizeEvaluation = () => {
    setShowConfirmModal(false);
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionId) {
        correct++;
      }
    });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScoreResult({ score: finalScore, correctCount: correct, total: questions.length });
    setIsFinished(true);

    if (!isPreview) {
      storage.recordKuisAkhirScore(nisn, materialId, finalScore);
      localStorage.removeItem(`smpn1_kuis_answers_${nisn}_${materialId}`);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setIsFinished(false);
    setScoreResult(null);
    setCurrentIdx(0);
  };

  if (isFinished && scoreResult) {
    return (
      <GlassCard isContent className="p-8 text-center flex flex-col items-center gap-4">
        <h3 className="text-lg font-bold text-[#ECFEFF]">{cms.quizResultTitle}</h3>
        <div className="w-24 h-24 rounded-full bg-[#2DD4BF]/20 border border-[#2DD4BF] flex items-center justify-center my-2">
          <span className="text-4xl font-extrabold text-[#2DD4BF] tabular-nums">
            {scoreResult.score}
          </span>
        </div>
        <p className="text-sm text-[#A5D8D3]">
          {scoreResult.correctCount} benar dari {scoreResult.total} soal
        </p>

        {!isLimitReached && (
          <GlassButton type="button" variant="secondary" onClick={handleRetake} className="mt-2">
            Ulangi Kuis
          </GlassButton>
        )}
      </GlassCard>
    );
  }

  return (
    <GlassCard isContent className="p-[14px] sm:p-6 flex flex-col gap-6">
      {/* 1. Soal & Nomor */}
      <div className="flex flex-col gap-3">
        <div className="text-xs font-semibold text-[#2DD4BF] tracking-wide">
          Soal {currentIdx + 1} dari {questions.length}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#ECFEFF] leading-relaxed">
          {currentQ.question}
        </h3>
        {currentQ.image?.value && (
          <img
            src={currentQ.image.value}
            alt=""
            referrerPolicy="no-referrer"
            className="max-h-60 rounded-xl object-contain bg-black/20 p-1"
          />
        )}
      </div>

      {/* 2. Daftar Opsi */}
      <div className="flex flex-col gap-2.5">
        {currentQ.options.map((opt) => {
          const isSelected = answers[currentIdx] === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectOption(opt.id)}
              className={`w-full min-h-[48px] p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#2DD4BF]/25 border-[#2DD4BF] text-[#2DD4BF] font-bold shadow-md shadow-[#2DD4BF]/20'
                  : 'bg-white/10 border-white/20 hover:bg-white/15 text-[#ECFEFF]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center font-bold text-xs shrink-0">
                  {opt.label}
                </span>
                <span className="text-sm font-medium leading-relaxed truncate">{opt.text}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-[#2DD4BF] shrink-0 ml-2" />}
            </button>
          );
        })}
      </div>

      {/* 3. Dua Tombol Sebaris: Mundur & Lanjut / Selesai */}
      <div className="flex items-center justify-between pt-2">
        <GlassButton
          type="button"
          variant="secondary"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(currentIdx - 1)}
        >
          {cms.btnPrev}
        </GlassButton>

        {currentIdx === questions.length - 1 ? (
          <GlassButton type="button" variant="primary" onClick={handleFinish}>
            {cms.btnFinish}
          </GlassButton>
        ) : (
          <GlassButton
            type="button"
            variant="primary"
            onClick={() => setCurrentIdx(currentIdx + 1)}
          >
            {cms.btnNext}
          </GlassButton>
        )}
      </div>

      {/* 4. Deretan Nomor Soal 6 Kolom */}
      <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
        <div className="grid grid-cols-6 gap-2 w-full max-w-[320px] mx-auto">
          {questions.map((_, idx) => {
            const isAnswered = answers[idx] !== undefined;
            const isCurrent = idx === currentIdx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer select-none text-white ${
                  isAnswered ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                } ${isCurrent ? 'ring-2 ring-white scale-105' : 'opacity-85 hover:opacity-100'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal Konfirmasi Masih Ada Soal Belum Terjawab */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowConfirmModal(false)}
        >
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <GlassCard className="p-6 text-center flex flex-col gap-4">
              <AlertCircle className="w-10 h-10 text-[#FBBF24] mx-auto" />
              <p className="text-sm font-semibold text-[#ECFEFF]">
                {cms.confirmUnansweredText.replace('{count}', unansweredCount.toString())}
              </p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <GlassButton variant="secondary" onClick={() => setShowConfirmModal(false)}>
                  {cms.btnBack}
                </GlassButton>
                <GlassButton variant="primary" onClick={finalizeEvaluation}>
                  {cms.btnConfirmFinish}
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

// --- Render Blok Isi Standar ---
const BlockItem: React.FC<{ block: MaterialBlock }> = ({ block }) => {
  switch (block.type) {
    case 'text': {
      if (!block.text) return null;
      const { content, style } = block.text;

      if (style === 'heading') {
        return (
          <h2 className="text-lg sm:text-xl font-bold text-[#ECFEFF] tracking-tight border-b border-white/10 pb-2">
            {content}
          </h2>
        );
      }
      if (style === 'subheading') {
        return (
          <h3 className="text-base font-semibold text-[#2DD4BF]">
            {content}
          </h3>
        );
      }
      if (style === 'quote') {
        return (
          <blockquote className="px-4 py-3 bg-white/5 rounded-xl border border-white/15 text-[#ECFEFF] italic">
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
              className="w-full max-h-[440px] object-contain rounded-2xl"
              onError={(e) => {
                const el = e.target as HTMLElement;
                el.style.display = 'none';
              }}
            />
          </div>
          {block.image.caption && (
            <span className="text-xs text-[#A5D8D3] mt-1 text-center">
              {block.image.caption}
            </span>
          )}
        </div>
      );
    }

    case 'video': {
      if (!block.video?.youtubeUrl) return null;
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
        <div className="w-full my-2 h-[420px] rounded-2xl overflow-hidden bg-black/40 border border-white/10">
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
        <div className="w-full my-2 overflow-x-auto rounded-xl border border-white/15">
          <table className="w-full text-left text-sm border-collapse min-w-[320px]">
            <thead>
              <tr className="bg-white/10 border-b border-white/15">
                {block.table.headers.map((h, i) => (
                  <th key={i} className="px-3.5 py-2.5 font-semibold text-[#2DD4BF]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {block.table.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-[#ECFEFF]/90">
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
      return <hr className="border-t border-white/15 my-2" />;

    default:
      return null;
  }
};
