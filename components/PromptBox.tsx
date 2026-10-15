'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Plus, Mic, ArrowUp, RefreshCw, X, Camera, Globe, Smartphone, BarChart3 } from 'lucide-react';
import { PROMPT_SUGGESTIONS } from '../data/templates';

export type BuildTarget = 'website' | 'app' | 'dashboard';

interface PromptBoxProps {
  onSubmit: (text: string, image?: string, target?: BuildTarget) => void;
  placeholder?: string;
  className?: string;
  // 'dark' restyles the idea chips for dark backgrounds
  tone?: 'light' | 'dark';
  showTargets?: boolean;
  align?: 'center' | 'start';
}

const TARGETS: { id: BuildTarget; label: string; icon: React.ReactNode }[] = [
  { id: 'website', label: 'Website', icon: <Globe size={14} /> },
  { id: 'app', label: 'Mobile app', icon: <Smartphone size={14} /> },
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={14} /> },
];

const pickSuggestions = (count: number) =>
  [...PROMPT_SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, count);

// Prompt input with image attachment, browser dictation and idea chips.
// Shared by the landing page and the dashboard home.
export const PromptBox: React.FC<PromptBoxProps> = ({
  onSubmit,
  placeholder = 'Describe the app you have in mind…',
  className = '',
  tone = 'light',
  showTargets = false,
  align = 'center',
}) => {
  // Centered everywhere, or left-aligned from md up (landing hero)
  const blockAlign = align === 'start' ? 'mx-auto md:mx-0' : 'mx-auto';
  const rowAlign = align === 'start' ? 'justify-center md:justify-start' : 'justify-center';
  const [target, setTarget] = useState<BuildTarget>('website');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(() => PROMPT_SUGGESTIONS.slice(0, 5));
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSuggestions(pickSuggestions(5));
    setSpeechSupported(!!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    return () => recognitionRef.current?.abort?.();
  }, []);

  // Grow the prompt box with its content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [prompt]);

  const submit = () => {
    const text = prompt.trim();
    if (!text && !image) return;
    onSubmit(text || 'Build a page based on this sketch', image || undefined, showTargets ? target : undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const toggleDictation = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    const base = prompt ? `${prompt} ` : '';
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setPrompt(base + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const applySuggestion = (s: string) => {
    setPrompt(`Create a ${s.toLowerCase()}`);
    textareaRef.current?.focus();
  };

  const chipClass = tone === 'dark'
    ? 'text-indigo-100/90 border-white/15 bg-white/5 hover:bg-white/10'
    : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800';

  return (
    <div className={className}>
      {showTargets && (
        <div className={`max-w-xl ${blockAlign} mb-3 flex ${rowAlign} gap-2 overflow-x-auto no-scrollbar`} role="radiogroup" aria-label="What are you building?">
          {TARGETS.map(t => (
            <button
              key={t.id}
              role="radio"
              aria-checked={target === t.id}
              onClick={() => setTarget(t.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
                target === t.id
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : tone === 'dark'
                    ? 'border-white/15 text-indigo-100/90 hover:bg-white/10'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className={`max-w-xl ${blockAlign} text-left rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg shadow-gray-200/60 dark:shadow-black/30 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-colors`}>
        {image && (
          <div className="px-4 pt-4">
            <div className="relative inline-block">
              <img src={image} alt="Attached" className="h-16 rounded-lg border border-gray-200 dark:border-gray-600" />
              <button
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder={placeholder}
          enterKeyHint="send"
          className="w-full resize-none bg-transparent px-4 pt-4 text-base md:text-sm placeholder:text-gray-400 focus:outline-none"
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Attach an image or sketch"
            aria-label="Attach an image or sketch"
          >
            <Plus size={18} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {/* capture opens the rear camera directly on phones: snap a paper sketch */}
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="md:hidden mr-auto flex items-center gap-1.5 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
            title="Snap a sketch"
            aria-label="Snap a sketch with the camera"
          >
            <Camera size={18} />
            <span>Sketch</span>
          </button>
          <div className="flex items-center gap-2">
            {speechSupported && (
              <button
                onClick={toggleDictation}
                className={`p-2 rounded-lg transition-colors ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={isListening ? 'Stop dictation' : 'Dictate'}
                aria-label={isListening ? 'Stop dictation' : 'Dictate'}
              >
                <Mic size={18} />
              </button>
            )}
            <button
              onClick={submit}
              disabled={!prompt.trim() && !image}
              className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              aria-label="Start building"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Idea chips */}
      <div className={`mt-4 max-w-2xl ${blockAlign} flex flex-wrap ${rowAlign} gap-2`}>
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => applySuggestion(s)}
            className={`text-xs border rounded-full px-3 py-1.5 transition-colors ${chipClass}`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => setSuggestions(pickSuggestions(5))}
          className={`h-[30px] w-[30px] grid place-items-center border rounded-full ${chipClass}`}
          aria-label="More ideas"
          title="More ideas"
        >
          <RefreshCw size={12} />
        </button>
      </div>
    </div>
  );
};
