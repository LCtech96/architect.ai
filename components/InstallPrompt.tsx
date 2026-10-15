'use client';

import React, { useEffect, useState } from 'react';
import { Share, PlusSquare, X, Download } from 'lucide-react';
import { isIOS, isStandalone } from '../utils/device';

const DISMISSED_KEY = 'architect_install_dismissed_v1';

// Suggests installing Architect as a Home Screen app. iOS has no install API, so
// it shows the Share → Add to Home Screen steps; Chrome/Android get a real button.
export const InstallPrompt: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [mode, setMode] = useState<'hidden' | 'ios' | 'native'>('hidden');
  const [deferred, setDeferred] = useState<any>(null);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      // Storage unavailable: show the hint for this visit
    }
    if (dismissed || isStandalone()) return;
    if (isIOS()) {
      setMode('ios');
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setMode('native');
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => {
    setMode('hidden');
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Ignore: the card simply comes back next visit
    }
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
    setMode('hidden');
  };

  if (mode === 'hidden') return null;

  return (
    <div className={`relative rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/40 p-4 pr-10 ${className}`}>
      <button onClick={dismiss} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600" aria-label="Dismiss">
        <X size={16} />
      </button>
      <div className="flex gap-3">
        <img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-xl shadow-sm shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-sm">Install Architect on your {mode === 'ios' ? 'iPhone' : 'device'}</p>
          {mode === 'ios' ? (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              Tap <Share size={13} className="inline -mt-0.5 text-indigo-600" /> <b>Share</b> in Safari, then{' '}
              <PlusSquare size={13} className="inline -mt-0.5 text-indigo-600" /> <b>Add to Home Screen</b>. It opens full screen, like a native app.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Open it from your home screen, full screen.</p>
              <button
                onClick={install}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5"
              >
                <Download size={14} /> Install app
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
