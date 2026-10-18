// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import { SessionUser, CmsSettings } from './types';
import { LoginScreen } from './components/auth/LoginScreen';
import { StudentSpace } from './components/student/StudentSpace';
import { AdminPanel } from './components/admin/AdminPanel';
import { Toast, OfflineBadge } from './components/common/Toast';

export default function App() {
  const storage = StorageService.getInstance();
  const [session, setSession] = useState<SessionUser | null>(storage.getSession());
  const [cms, setCms] = useState<CmsSettings>(storage.getCmsSettings());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setSession(storage.getSession());
      setCms(storage.getCmsSettings());
    });
    return () => unsubscribe();
  }, [storage]);

  // Touch session on user interaction (scroll, click, keydown)
  useEffect(() => {
    const handleActivity = () => {
      if (session) storage.touchSession();
    };
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [session, storage]);

  const handleShowToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleLogout = () => {
    storage.logout();
    window.location.hash = '';
    setSession(null);
  };

  // If not logged in, show LoginScreen
  if (!session) {
    return (
      <>
        <OfflineBadge label={cms.msgOfflineBadge} />
        <LoginScreen
          cms={cms}
          onLoginSuccess={() => {
            setSession(storage.getSession());
          }}
        />
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      </>
    );
  }

  // If Admin
  if (session.role === 'Admin') {
    return (
      <>
        <OfflineBadge label={cms.msgOfflineBadge} />
        <AdminPanel
          cms={cms}
          onLogout={handleLogout}
          onShowToast={handleShowToast}
        />
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      </>
    );
  }

  // If Student
  if (session.role === 'Siswa' && session.student) {
    return (
      <>
        <OfflineBadge label={cms.msgOfflineBadge} />
        <StudentSpace
          student={session.student}
          cms={cms}
          onLogout={handleLogout}
        />
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      </>
    );
  }

  return null;
}
