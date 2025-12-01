'use client';

import React, { useRef, useState, useEffect } from 'react';
import { DrawMode, DrawingSettings } from '../types';

interface CanvasOverlayProps {
  mode: DrawMode;
  settings: DrawingSettings;
  onDrawingComplete: (dataUrl: string) => void;
  onClear: () => void;
  width: number;
  height: number;
  triggerClear?: number;
}

export const CanvasOverlay: React.FC<CanvasOverlayProps> = ({ 
  mode, 
  settings,
  onDrawingComplete, 
  onClear,
  width,
  height,
  triggerClear
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  // Set canvas size on mount/resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && width > 0 && height > 0) {
      // Save current content
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      if (tempCtx && canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Resize
      canvas.width = width;
      canvas.height = height;

      // Restore content if we had drawing
      const ctx = canvas.getContext('2d');
      if (ctx && hasDrawing && tempCanvas.width > 0) {
        // We stretch the old drawing to the new size to keep relative position
        ctx.drawImage(tempCanvas, 0, 0, width, height); 
      }
    }
  }, [width, height]);

  // Handle explicit clear signal
  useEffect(() => {
    if (triggerClear) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawing(false);
      }
    }
  }, [triggerClear]);

  // Helper to safely get coordinates from mouse or touch events
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    // Type guard for TouchEvent
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      // MouseEvent
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    } else {
      return { x: 0, y: 0 };
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode === DrawMode.NONE) return;
    
    // Note: We rely on 'touch-none' CSS class to prevent scrolling. 
    // Calling preventDefault() on touchstart can cause issues with passive listeners in React 18+.

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    setIsDrawing(true);
    setHasDrawing(true);

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Apply Settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = settings.width;

    if (settings.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = settings.color;
      
      if (settings.tool === 'marker') {
        ctx.globalAlpha = 0.5;
      } else {
        ctx.globalAlpha = 1.0;
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode === DrawMode.NONE) return;

    // For touchmove, we might want to prevent default if scrolling issues persist, 
    // but usually touch-none handles it.
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (canvasRef.current) {
        onDrawingComplete(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className={`absolute top-0 left-0 w-full h-full z-20 touch-none transition-opacity duration-300 ${
        mode === DrawMode.DRAWING ? 'cursor-crosshair opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    />
  );
};
