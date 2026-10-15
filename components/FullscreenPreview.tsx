'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Share, RotateCw } from 'lucide-react';
import { buildPreviewDocument } from '../utils/previewDocument';

interface FullscreenPreviewProps {
  code: string;
  name: string;
  onClose: () => void;
  onShare: () => void;
}

// Runs the page edge to edge so it can be tried like the finished app. The
// floating bar fades after a moment; tap the handle to bring it back.
export const FullscreenPreview: React.FC<FullscreenPreviewProps> = ({ code, name, onClose, onShare }) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [barVisible, setBarVisible] = useState(true);
  const srcDoc = useMemo(() => buildPreviewDocument(code, name), [code, name]);

  useEffect(() => {
    if (!barVisible) return;
    const id = setTimeout(() => setBarVisible(false), 3500);
    return () => clearTimeout(id);
  }, [barVisible]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] bg-black animate-fade-in" role="dialog" aria-modal="true" aria-label={`${name} full-screen preview`}>
      <iframe
        key={reloadKey}
        title={`${name} full-screen preview`}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-forms allow-popups"
        className="absolute inset-0 w-full h-full border-0 bg-white"
      />

      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-0 safe-bottom transition-all duration-300 ${
          barVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1 rounded-full bg-gray-900/85 backdrop-blur-xl text-white p-1.5 shadow-2xl ring-1 ring-white/10">
          <button onClick={onClose} className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium hover:bg-white/10">
            <X size={16} /> Close
          </button>
          <button onClick={() => setReloadKey(k => k + 1)} className="h-10 w-10 grid place-items-center rounded-full hover:bg-white/10" aria-label="Restart">
            <RotateCw size={16} />
          </button>
          <button onClick={onShare} className="h-10 w-10 grid place-items-center rounded-full hover:bg-white/10" aria-label="Share">
            <Share size={16} />
          </button>
        </div>
      </div>

      {!barVisible && (
        <button
          onClick={() => setBarVisible(true)}
          className="absolute left-1/2 -translate-x-1/2 bottom-0 safe-bottom px-10 pt-4"
          aria-label="Show controls"
        >
          <span className="block h-1.5 w-24 rounded-full bg-gray-900/40 ring-1 ring-white/40" />
        </button>
      )}
    </div>
  );
};
