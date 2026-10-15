// Small platform checks for iOS-specific behaviour (install hint, share sheet).

export const isIOS = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac with touch
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

// True when launched from the Home Screen as an installed web app
export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true);

export const canShareFiles = () => {
  if (typeof navigator === 'undefined' || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [new File([''], 'test.html', { type: 'text/html' })] });
  } catch {
    return false;
  }
};
