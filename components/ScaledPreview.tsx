'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PreviewDevice } from '../types';
import { buildPreviewDocument } from '../utils/previewDocument';

const NATURAL_WIDTH: Record<PreviewDevice, number> = {
  mobile: 390,
  tablet: 820,
  desktop: 1280,
};

interface ScaledPreviewProps {
  code: string;
  device: PreviewDevice;
  className?: string;
}

// Renders a page at its real device width inside a sandboxed iframe, scaled down
// to fit the container. Used for template thumbnails on the landing page.
export const ScaledPreview: React.FC<ScaledPreviewProps> = ({ code, device, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const srcDoc = useMemo(() => buildPreviewDocument(code), [code]);
  const naturalWidth = NATURAL_WIDTH[device];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = size.width ? size.width / naturalWidth : 0;

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {scale > 0 && (
        <iframe
          title="Template preview"
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          tabIndex={-1}
          aria-hidden="true"
          loading="lazy"
          className="absolute top-0 left-0 border-0 pointer-events-none origin-top-left bg-white"
          style={{
            width: naturalWidth,
            height: size.height / scale,
            transform: `scale(${scale})`,
          }}
        />
      )}
    </div>
  );
};
