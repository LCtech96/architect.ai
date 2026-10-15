'use client';

import React, { useMemo, useState } from 'react';
import { Layout, ArrowRight, Moon, Sun, Code, PenTool, AudioLines, Smartphone } from 'lucide-react';
import { STARTER_TEMPLATES, StarterTemplate } from '../data/templates';
import { PromptBox } from './PromptBox';
import { ScaledPreview } from './ScaledPreview';

interface LandingPageProps {
  onStartPrompt: (text: string, image?: string) => void;
  onUseTemplate: (template: StarterTemplate) => void;
  onOpenEditor: () => void;
  hasProject: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPrompt,
  onUseTemplate,
  onOpenEditor,
  hasProject,
  theme,
  onToggleTheme,
}) => {
  const [selectedId, setSelectedId] = useState(STARTER_TEMPLATES[0].id);
  const selectedIndex = STARTER_TEMPLATES.findIndex(t => t.id === selectedId);
  const selected = STARTER_TEMPLATES[selectedIndex];
  const prev = STARTER_TEMPLATES[(selectedIndex - 1 + STARTER_TEMPLATES.length) % STARTER_TEMPLATES.length];
  const next = STARTER_TEMPLATES[(selectedIndex + 1) % STARTER_TEMPLATES.length];

  const features = useMemo(() => [
    { icon: <Code size={18} />, title: 'Live preview and code', text: 'See the page update as the agent builds, and inspect the generated HTML at any time.' },
    { icon: <PenTool size={18} />, title: 'Draw your changes', text: 'Sketch directly on the preview. Architect reads your markup and edits the layout.' },
    { icon: <AudioLines size={18} />, title: 'Talk to your agent', text: 'Dictate a request, or start a live voice session and design hands-free.' },
    { icon: <Smartphone size={18} />, title: 'Every screen size', text: 'Switch between mobile, tablet and desktop to check the layout is responsive.' },
  ], []);

  return (
    <div className="app-height overflow-y-auto overscroll-contain bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 safe-top bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto h-14 md:h-16 px-4 md:px-6 flex items-center justify-between safe-left safe-right">
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Layout className="text-blue-600" size={22} />
              <span>Architect.ai</span>
            </div>
            <span className="text-[10px] font-medium text-gray-400 mb-0.5">Beta</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={onOpenEditor}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {hasProject ? 'My projects' : 'Start building'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pt-12 md:pt-20 text-center">
        <div className="relative inline-block">
          <span className="absolute -top-7 -left-2 md:-left-10 -rotate-6 whitespace-nowrap bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200 text-[11px] font-semibold px-3 py-1 rounded-md shadow-sm">
            Now in beta
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-[1.1]">
            Build web and mobile apps with AI
          </h1>
        </div>
        <p className="mt-5 text-gray-500 dark:text-gray-400 text-base md:text-lg leading-relaxed">
          Architect turns words, sketches and voice into working interfaces.
          <br className="hidden sm:block" /> Describe your idea. Build it with an AI agent.
        </p>

        <PromptBox onSubmit={onStartPrompt} className="mt-8" />
      </section>

      {/* Starting points */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-20 md:pt-28">
        <h2 className="text-2xl md:text-4xl font-bold text-center tracking-tight">Choose a starting point.</h2>
        <div className="mt-6 -mx-4 px-4 flex md:flex-wrap md:justify-center gap-2 overflow-x-auto no-scrollbar">
          {STARTER_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`shrink-0 text-sm px-4 py-2.5 rounded-full border transition-colors ${
                t.id === selectedId
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white font-medium'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stacked previews */}
        <div className="relative mt-10 h-[340px] sm:h-[400px] md:h-[440px] flex items-center justify-center">
          <div className="hidden md:block absolute left-[6%] top-[18%] w-[30%] h-[58%] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden opacity-90 -rotate-1">
            <ScaledPreview key={`prev-${prev.id}`} code={prev.code} device="desktop" className="w-full h-full" />
          </div>
          <div className="hidden md:block absolute right-[6%] top-[18%] w-[30%] h-[58%] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden opacity-90 rotate-1">
            <ScaledPreview key={`next-${next.id}`} code={next.code} device="desktop" className="w-full h-full" />
          </div>
          <div
            className={`relative z-10 h-full shadow-2xl overflow-hidden bg-white ${
              selected.device === 'mobile'
                ? 'w-[190px] sm:w-[220px] rounded-[1.75rem] border-[6px] border-gray-900'
                : 'w-full md:w-[58%] rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700'
            }`}
          >
            <ScaledPreview key={selected.id} code={selected.code} device={selected.device} className="w-full h-full" />
          </div>
        </div>

        <p className="mt-8 max-w-lg mx-auto text-center text-gray-500 dark:text-gray-400 leading-relaxed">{selected.description}</p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => onUseTemplate(selected)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Use this idea <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="mt-24 md:mt-32 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-6 items-end">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Watch your agent build.<br />Inspect every change.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 md:text-right">
              Live preview and code side by side while you create with your agent.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <div key={f.title} className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 grid place-items-center">{f.icon}</div>
                <p className="mt-4 font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <button onClick={onOpenEditor} className="text-sm font-medium text-blue-600 dark:text-blue-400 underline underline-offset-4">
              {hasProject ? 'Go to my projects' : 'Start building'}
            </button>
          </div>
        </div>
      </section>

      <footer className="safe-pb border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 text-xs text-gray-400 flex justify-between">
          <span>© {new Date().getFullYear()} Architect.ai</span>
          <span>Beta</span>
        </div>
      </footer>
    </div>
  );
};
