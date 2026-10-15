'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Plus, Mic, ArrowUp, RefreshCw, X } from 'lucide-react';
import { PROMPT_SUGGESTIONS } from '../data/templates';

interface PromptBoxProps {
  onSubmit: (text: string, image?: string) => void;
  placeholder?: string;
  className?: string;
}

const pickSuggestions = (count: number) =>
  [...PROMPT_SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, count);

// Prompt input with image attachment, browser dictation and idea chips.
// Shared by the landing page and the dashboard home.
export const PromptBox: React.FC<PromptBoxProps> = ({
  onSubmit,
  placeholder = 'Create a dashboard with charts',
  className = '',
}) => {
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
    onSubmit(text || 'Build a page based on this image', image || undefined);
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

  return (
    <div className={className}>
      <div className="max-w-xl mx-auto text-left rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg shadow-gray-200/60 dark:shadow-black/30 focus-within:border-blue-400 transition-colors">
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
              className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
              aria-label="Start building"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Idea chips */}
      <div className="mt-4 max-w-2xl mx-auto flex flex-wrap justify-center gap-2">
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => applySuggestion(s)}
            className="text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => setSuggestions(pickSuggestions(5))}
          className="h-[30px] w-[30px] grid place-items-center text-gray-500 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
          aria-label="More ideas"
          title="More ideas"
        >
          <RefreshCw size={12} />
        </button>
      </div>
    </div>
  );
};
