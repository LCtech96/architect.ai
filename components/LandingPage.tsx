'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, ArrowLeft, Moon, Sun, Camera, Mic, Type, PenTool, Share, Smartphone, Maximize, Hand, Sparkles, Download,
} from 'lucide-react';
import { STARTER_TEMPLATES, StarterTemplate, TemplateCategory } from '../data/templates';
import { PromptBox, BuildTarget } from './PromptBox';
import { ScaledPreview } from './ScaledPreview';
import { Logo } from './Logo';

interface LandingPageProps {
  onStartPrompt: (text: string, image?: string, target?: BuildTarget) => void;
  onUseTemplate: (template: StarterTemplate) => void;
  onOpenEditor: () => void;
  hasProject: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const PHONE_SHOWCASE = STARTER_TEMPLATES.filter(t => t.device === 'mobile');
const FILTERS: ('All' | TemplateCategory)[] = ['All', 'Sites', 'Apps', 'Dashboards'];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPrompt,
  onUseTemplate,
  onOpenEditor,
  hasProject,
  theme,
  onToggleTheme,
}) => {
  const [filter, setFilter] = useState<'All' | TemplateCategory>('All');
  const carouselRef = useRef<HTMLDivElement>(null);
  const visible = filter === 'All' ? STARTER_TEMPLATES : STARTER_TEMPLATES.filter(t => t.category === filter);

  const scrollCarousel = (dir: 1 | -1) => {
    const el = carouselRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const jumpTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const steps = useMemo(() => [
    { n: '01', title: 'Describe it your way', text: 'Type a sentence, hold the mic and talk, or snap a photo of a paper sketch.', icons: [<Type key="t" size={16} />, <Mic key="m" size={16} />, <Camera key="c" size={16} />] },
    { n: '02', title: 'Refine on the canvas', text: 'Circle what you want changed right on the live preview, or just ask in the chat.', icons: [<PenTool key="p" size={16} />, <Sparkles key="s" size={16} />] },
    { n: '03', title: 'Take it anywhere', text: 'Check it on every screen size, then export clean HTML or send it with AirDrop.', icons: [<Smartphone key="d" size={16} />, <Share key="sh" size={16} />] },
  ], []);

  const mobileFeatures = useMemo(() => [
    { icon: <Camera size={20} />, title: 'Paper to pixels', text: 'Point the camera at a napkin sketch. Architect turns it into a layout.', wide: true },
    { icon: <Mic size={20} />, title: 'Talk while you walk', text: 'Dictate requests or open a live voice session, hands-free.' },
    { icon: <Download size={20} />, title: 'On your Home Screen', text: 'Install Architect and it opens full screen, like a native app.' },
    { icon: <Share size={20} />, title: 'AirDrop your app', text: 'Share any page through the iOS share sheet: Messages, Mail, Files.' },
    { icon: <Maximize size={20} />, title: 'Test it for real', text: 'Open a full-screen preview and use your app as your users will.', wide: true },
    { icon: <Hand size={20} />, title: 'Made for thumbs', text: 'Swipe sheets, big touch targets and a keyboard-aware composer.' },
  ], []);

  return (
    <div className="app-height overflow-y-auto overscroll-contain bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Hero */}
      <div className="bg-blueprint text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-violet-600/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-30%] left-[-10%] h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-3xl" />

        <header className="relative safe-top">
          <div className="max-w-6xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between safe-left safe-right">
            <Logo className="text-white text-lg" />
            <nav className="hidden md:flex items-center gap-7 text-sm text-indigo-100/70">
              <button onClick={() => jumpTo('how')} className="hover:text-white">How it works</button>
              <button onClick={() => jumpTo('blueprints')} className="hover:text-white">Blueprints</button>
              <button onClick={() => jumpTo('mobile')} className="hover:text-white">On your phone</button>
            </nav>
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={onToggleTheme}
                className="p-2 text-indigo-100/70 hover:text-white"
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={onOpenEditor}
                className="rounded-full bg-white text-gray-900 text-sm font-semibold px-4 py-2 hover:bg-indigo-50 transition-colors"
              >
                {hasProject ? 'Your studio' : 'Open studio'}
              </button>
            </div>
          </div>
        </header>

        <section className="relative max-w-6xl mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-16 md:pb-24 grid md:grid-cols-[1.15fr_1fr] gap-12 items-center safe-left safe-right">
          <div className="text-center md:text-left">
            <p className="font-mono text-[11px] tracking-[0.2em] text-indigo-300/80">/ AI APP STUDIO · PUBLIC PREVIEW</p>
            <h1 className="mt-5 text-[2.6rem] leading-[1.05] sm:text-6xl md:text-7xl font-extrabold tracking-tight">
              Sketch it.<br />Say it.<br />
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">Ship it.</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-indigo-100/75 max-w-md mx-auto md:mx-0 leading-relaxed">
              Architect turns a napkin sketch, a voice note or a single sentence into a working, responsive app, right from your phone.
            </p>
            <PromptBox
              onSubmit={onStartPrompt}
              placeholder="A booking app for my yoga studio, calm and minimal…"
              tone="dark"
              showTargets
              align="start"
              className="mt-8"
            />
          </div>

          <PhoneShowcase />
        </section>
      </div>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <p className="font-mono text-xs tracking-[0.2em] text-indigo-600 dark:text-indigo-400">HOW IT WORKS</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">From idea to app in three moves.</h2>
        <ol className="mt-12 grid md:grid-cols-3 gap-6 md:gap-0">
          {steps.map((s, i) => (
            <li key={s.n} className={`relative md:px-8 ${i > 0 ? 'md:border-l md:border-dashed md:border-gray-300 dark:md:border-gray-700' : 'md:pl-0'}`}>
              <span className="font-mono text-5xl font-bold text-indigo-100 dark:text-indigo-950">{s.n}</span>
              <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 leading-relaxed">{s.text}</p>
              <div className="mt-4 flex gap-2">
                {s.icons.map((icon, k) => (
                  <span key={k} className="h-8 w-8 grid place-items-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">{icon}</span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Blueprints carousel */}
      <section id="blueprints" className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-indigo-600 dark:text-indigo-400">BLUEPRINTS</p>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Remix a blueprint.</h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md">Every blueprint is a real, editable app. Open one and reshape it with words, drawings or your voice.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 text-sm">
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      carouselRef.current?.scrollTo({ left: 0 });
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      filter === f ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="hidden md:flex gap-2">
                <button onClick={() => scrollCarousel(-1)} className="h-10 w-10 grid place-items-center rounded-full border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800" aria-label="Previous">
                  <ArrowLeft size={18} />
                </button>
                <button onClick={() => scrollCarousel(1)} className="h-10 w-10 grid place-items-center rounded-full border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800" aria-label="Next">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div ref={carouselRef} className="mt-10 -mx-4 px-4 md:mx-0 md:px-0 flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-px-4 md:scroll-px-0 pb-2">
            {visible.map(t => (
              <BlueprintCard key={t.id} template={t} onRemix={() => onUseTemplate(t)} />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile features */}
      <section id="mobile" className="bg-blueprint text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
          <p className="font-mono text-xs tracking-[0.2em] text-indigo-300/80">ON YOUR PHONE</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">A studio that fits in your pocket.</h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mobileFeatures.map(f => (
              <div key={f.title} className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-6 ${f.wide ? 'lg:col-span-2' : ''}`}>
                <span className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">{f.icon}</span>
                <h3 className="mt-5 font-semibold text-lg">{f.title}</h3>
                <p className="mt-1.5 text-sm text-indigo-100/70 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Your next app starts with a scribble.</h2>
        <button
          onClick={onOpenEditor}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold px-7 py-3.5 shadow-lg shadow-indigo-500/25 hover:opacity-95"
        >
          {hasProject ? 'Back to your studio' : 'Open the studio'} <ArrowRight size={18} />
        </button>
      </section>

      <footer className="safe-pb border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex items-center justify-between text-xs text-gray-400 safe-left safe-right">
          <Logo size={18} className="text-gray-500 dark:text-gray-400 text-sm" />
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};

// Phone mockup that cycles through the app blueprints, with annotation bubbles
// showing the sketch and voice inputs.
const PhoneShowcase: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setIndex(i => (i + 1) % PHONE_SHOWCASE.length), 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto w-[230px] sm:w-[260px] md:w-[280px]">
      <div className="relative aspect-[9/19] rounded-[2.6rem] bg-gray-950 p-2.5 shadow-2xl shadow-indigo-950/60 ring-1 ring-white/10">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 h-5 w-20 rounded-full bg-black z-10" />
        <div className="relative h-full w-full rounded-[2.1rem] overflow-hidden bg-white">
          {PHONE_SHOWCASE.map((t, i) => (
            <div key={t.id} className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}>
              <ScaledPreview code={t.code} device="mobile" className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Annotation bubbles */}
      <div className="absolute -left-6 sm:-left-16 top-[18%] rotate-[-4deg] rounded-xl bg-white text-gray-900 shadow-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5">
        <PenTool size={13} className="text-rose-500" /> make this bolder
      </div>
      <div className="absolute -right-4 sm:-right-14 top-[52%] rotate-[3deg] rounded-xl bg-indigo-600 text-white shadow-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5">
        <Mic size={13} /> “add a dark mode”
      </div>

      <div className="mt-5 flex justify-center gap-1.5">
        {PHONE_SHOWCASE.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}
            aria-label={`Show ${t.label}`}
          />
        ))}
      </div>
    </div>
  );
};

export const BlueprintCard: React.FC<{ template: StarterTemplate; onRemix: () => void; className?: string }> = ({
  template,
  onRemix,
  className = 'snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[31.5%]',
}) => (
  <article className={`${className} rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col`}>
    <div className="relative h-60 overflow-hidden" style={{ backgroundColor: `${template.accent}1f` }}>
      {template.device === 'mobile' ? (
        <div className="absolute left-1/2 top-6 -translate-x-1/2 w-[132px] h-[280px] rounded-[1.6rem] bg-gray-900 p-1.5 shadow-xl">
          <ScaledPreview code={template.code} device="mobile" className="w-full h-full rounded-[1.25rem]" />
        </div>
      ) : (
        <div className="absolute left-6 right-[-10%] top-6 bottom-[-20%] rounded-xl bg-white shadow-xl overflow-hidden border border-black/5">
          <div className="h-5 bg-gray-100 flex items-center gap-1 px-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-300" /><span className="h-1.5 w-1.5 rounded-full bg-gray-300" /><span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          </div>
          <ScaledPreview code={template.code} device="desktop" className="w-full h-full" />
        </div>
      )}
      <span className="absolute top-3 left-3 text-[11px] font-semibold rounded-full bg-white/90 text-gray-800 px-2.5 py-1 shadow-sm">
        {template.category === 'Apps' ? 'App' : template.category === 'Sites' ? 'Site' : 'Dashboard'}
      </span>
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="font-semibold text-lg">{template.label}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex-1">{template.description}</p>
      <button
        onClick={onRemix}
        className="mt-4 self-start inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-2.5 transition-all"
      >
        Remix this <ArrowRight size={16} />
      </button>
    </div>
  </article>
);
