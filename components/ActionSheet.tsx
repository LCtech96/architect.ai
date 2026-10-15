'use client';

import React, { useEffect, useRef } from 'react';

export interface SheetAction {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  open: boolean;
  title?: string;
  actions: SheetAction[];
  onClose: () => void;
}

// iOS-style action sheet: slides up from the bottom on phones, a small dialog on
// larger screens. Swipe the sheet down or tap outside to dismiss.
export const ActionSheet: React.FC<ActionSheetProps> = ({ open, title, actions, onClose }) => {
  const startY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null || !sheetRef.current) return;
    const dy = Math.max(0, e.touches[0].clientY - startY.current);
    sheetRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null || !sheetRef.current) return;
    const dy = e.changedTouches[0].clientY - startY.current;
    startY.current = null;
    if (dy > 80) onClose();
    else sheetRef.current.style.transform = '';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        ref={sheetRef}
        className="relative w-full md:w-96 px-2 md:px-0 safe-bottom md:pb-0 animate-sheet-up md:animate-pop-in transition-transform"
      >
        <div className="rounded-2xl overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl">
          <div
            className="pt-2 pb-1 md:hidden touch-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
          {title && (
            <p className="px-4 pt-2 pb-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              {title}
            </p>
          )}
          {actions.map((a, i) => (
            <button
              key={a.label}
              onClick={() => {
                onClose();
                a.onSelect();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60 active:bg-gray-100 dark:active:bg-gray-700 ${
                i > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''
              } ${a.destructive ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}
            >
              {a.icon && <span className={`shrink-0 ${a.destructive ? '' : 'text-indigo-600 dark:text-indigo-400'}`}>{a.icon}</span>}
              <span className="min-w-0">
                <span className="block text-[15px] font-medium">{a.label}</span>
                {a.description && <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.description}</span>}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-2xl bg-white dark:bg-gray-800 py-3.5 text-[15px] font-semibold text-indigo-600 dark:text-indigo-400 shadow-2xl md:hidden"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
