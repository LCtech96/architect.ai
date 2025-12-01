'use client';

import React from 'react';
import { Pen, Eraser, Highlighter, Trash2 } from 'lucide-react';
import { DrawingSettings, DrawingToolType } from '../types';

interface DrawingToolbarProps {
  settings: DrawingSettings;
  onUpdateSettings: (settings: DrawingSettings) => void;
  onClear: () => void;
}

const COLORS = [
  '#000000', // Black
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#FFFFFF', // White
];

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  settings,
  onUpdateSettings,
  onClear
}) => {
  const handleToolChange = (tool: DrawingToolType) => {
    // Set default widths based on tool
    let width = settings.width;
    if (tool === 'marker') width = 15;
    if (tool === 'pen') width = 3;
    if (tool === 'eraser') width = 20;

    onUpdateSettings({ ...settings, tool, width });
  };

  return (
    <div className="flex flex-col gap-4 p-3 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl w-16 items-center transition-all duration-300 transform translate-x-0">
      
      {/* Tools */}
      <div className="flex flex-col gap-2 pb-4 border-b border-gray-200">
        <button
          onClick={() => handleToolChange('pen')}
          className={`p-2 rounded-xl transition-all ${
            settings.tool === 'pen' 
              ? 'bg-black text-white shadow-md' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Pen"
        >
          <Pen size={20} />
        </button>
        <button
          onClick={() => handleToolChange('marker')}
          className={`p-2 rounded-xl transition-all ${
            settings.tool === 'marker' 
              ? 'bg-black text-white shadow-md' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Marker"
        >
          <Highlighter size={20} />
        </button>
        <button
          onClick={() => handleToolChange('eraser')}
          className={`p-2 rounded-xl transition-all ${
            settings.tool === 'eraser' 
              ? 'bg-black text-white shadow-md' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Eraser"
        >
          <Eraser size={20} />
        </button>
      </div>

      {/* Colors */}
      {settings.tool !== 'eraser' && (
        <div className="flex flex-col gap-2 pb-4 border-b border-gray-200 items-center">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onUpdateSettings({ ...settings, color })}
              className={`w-6 h-6 rounded-full border border-gray-200 transition-transform ${
                settings.color === color ? 'scale-125 ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {/* Stroke Width Slider (Vertical) */}
      <div className="h-24 py-2 flex items-center justify-center">
        <input
          type="range"
          min={settings.tool === 'marker' ? 10 : 1}
          max={settings.tool === 'marker' ? 40 : 20}
          value={settings.width}
          onChange={(e) => onUpdateSettings({ ...settings, width: parseInt(e.target.value) })}
          className="h-full -rotate-90 w-20 accent-black cursor-pointer"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={onClear}
          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Clear All"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
