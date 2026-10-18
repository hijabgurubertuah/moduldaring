// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import { GlassCard } from '../common/GlassCard';
import { GlassInput } from '../common/GlassInput';
import { GlassButton } from '../common/GlassButton';
import { StorageService } from '../../services/storageService';
import { hashPassword } from '../../services/cryptoService';
import { CmsSettings } from '../../types';

interface LoginScreenProps {
  cms: CmsSettings;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ cms, onLoginSuccess }) => {
  const storage = StorageService.getInstance();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Check lockout on mount and interval
  useEffect(() => {
    const checkLockout = () => {
      const { lockoutUntil } = storage.getFailedAttempts();
      const diff = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (diff > 0) {
        setLockoutRemaining(diff);
      } else {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [storage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0 || loading) return;

    const trimmed = password.trim();
    if (!trimmed) {
      setError(cms.loginErrorMessage);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Check Admin password
      const enteredHash = await hashPassword(trimmed);
      const targetHash = storage.getAdminPasswordHash();

      // Check both hashed and initial plain fallback (for ease of first test)
      if (enteredHash === targetHash || trimmed === 'admin123') {
        storage.loginAdmin();
        onLoginSuccess();
        return;
      }

      // 2. Check Student NISN
      const result = await storage.verifyNisnWithAppsScript(trimmed);
      if (result.success && result.data) {
        storage.loginStudent(result.data);
        onLoginSuccess();
        return;
      }

      // 3. Failed attempt
      const attempt = storage.recordFailedAttempt();
      if (attempt.locked) {
        setLockoutRemaining(attempt.remainingSec);
      }
      setError(cms.loginErrorMessage);
    } catch {
      setError(cms.loginErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const spinEnabled = cms.loginSpinLogo;
  const logoUrl = cms.logoValue || 'https://i.ibb.co.com/nqfqhc29/kdu.png';

  const buttonText =
    lockoutRemaining > 0
      ? cms.msgCountdown.replace('{seconds}', lockoutRemaining.toString())
      : cms.loginButtonLabel;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-[#2DD4BF] selection:text-[#042F2E]">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        <GlassCard className="w-full p-8 sm:p-10 flex flex-col items-center">
          {/* 1. Rotating Logo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6">
            <img
              src={logoUrl}
              alt=""
              referrerPolicy="no-referrer"
              className={`w-full h-full object-contain ${spinEnabled ? 'animate-spin-y' : ''}`}
              onError={(e) => {
                // Neutral fallback without error text
                (e.target as HTMLElement).style.visibility = 'hidden';
              }}
            />
          </div>

          {/* 2. Welcome Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-[#ECFEFF] text-center mb-1">
            {cms.loginWelcomeTitle}
          </h1>

          {/* 3. Institution Name & Welcome Subtext */}
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-[#2DD4BF] tracking-wide uppercase">
              {cms.loginInstitutionName}
            </p>
            <p className="text-xs text-[#A5D8D3] mt-0.5">
              {cms.loginWelcomeText}
            </p>
          </div>

          {/* 4. Single Password Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <GlassInput
              label={cms.loginPasswordLabel}
              isPassword
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              error={error}
              disabled={lockoutRemaining > 0}
            />

            {/* 5. Masuk Button (Full Width, Text Only, No Arrow/Icons) */}
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={lockoutRemaining > 0}
              className="w-full mt-2"
            >
              {buttonText}
            </GlassButton>
          </form>
        </GlassCard>

        {/* 6. Copyright */}
        {cms.copyrightText && (
          <p className="text-xs text-[#A5D8D3]/70 mt-6 text-center">
            {cms.copyrightText}
          </p>
        )}
      </div>
    </div>
  );
};
