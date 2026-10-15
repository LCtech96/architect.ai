'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles, Shapes, FolderClosed, Plus, Camera, FileCode2, Square, Moon, Sun, MoreHorizontal, Search,
  PenTool, Mic, X, ArrowRight, Pencil, Copy, Share, Trash2, ExternalLink, HardDrive,
} from 'lucide-react';
import { Project } from '../types';
import { STARTER_TEMPLATES, StarterTemplate, TemplateCategory } from '../data/templates';
import { PromptBox, BuildTarget } from './PromptBox';
import { ScaledPreview } from './ScaledPreview';
import { BlueprintCard } from './LandingPage';
import { ActionSheet, SheetAction } from './ActionSheet';
import { InstallPrompt } from './InstallPrompt';
import { Logo } from './Logo';

export type DashboardTab = 'studio' | 'blueprints' | 'projects';

interface DashboardProps {
  projects: Project[];
  tab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onOpenProject: (id: string) => void;
  onStartPrompt: (text: string, image?: string, target?: BuildTarget) => void;
  onUseTemplate: (template: StarterTemplate) => void;
  onCreateBlank: () => void;
  onImport: (fileName: string, html: string) => void;
  onRenameProject: (id: string, name: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onShareProject: (id: string) => void;
  onGoLanding: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const TIPS_DISMISSED_KEY = 'architect_tips_dismissed_v1';

const timeAgo = (ts: number) => {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const { projects, tab, onTabChange, theme, onToggleTheme } = props;
  const [createOpen, setCreateOpen] = useState(false);
  const [projectSheet, setProjectSheet] = useState<Project | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [tab]);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => props.onImport(file.name.replace(/\.html?$/i, ''), String(reader.result || ''));
    reader.readAsText(file);
  };

  // A photo of a paper sketch starts a new project straight away
  const handleCameraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      props.onStartPrompt('Turn this hand-drawn sketch into a polished, responsive page', reader.result as string, 'website');
    reader.readAsDataURL(file);
  };

  const createActions: SheetAction[] = [
    { label: 'Snap a sketch', description: 'Photograph a drawing on paper', icon: <Camera size={20} />, onSelect: () => cameraRef.current?.click() },
    { label: 'Blank canvas', description: 'Start from an empty page', icon: <Square size={20} />, onSelect: props.onCreateBlank },
    { label: 'Remix a blueprint', description: 'Pick a ready-made app to reshape', icon: <Shapes size={20} />, onSelect: () => onTabChange('blueprints') },
    { label: 'Import HTML file', description: 'Bring in a page you already have', icon: <FileCode2 size={20} />, onSelect: () => importRef.current?.click() },
  ];

  const projectActions: SheetAction[] = projectSheet
    ? [
        { label: 'Open', icon: <ExternalLink size={20} />, onSelect: () => props.onOpenProject(projectSheet.id) },
        {
          label: 'Rename',
          icon: <Pencil size={20} />,
          onSelect: () => {
            const name = window.prompt('Rename project', projectSheet.name);
            if (name && name.trim()) props.onRenameProject(projectSheet.id, name.trim());
          },
        },
        { label: 'Duplicate', icon: <Copy size={20} />, onSelect: () => props.onDuplicateProject(projectSheet.id) },
        { label: 'Share or export', description: 'AirDrop, Messages, Files or download', icon: <Share size={20} />, onSelect: () => props.onShareProject(projectSheet.id) },
        {
          label: 'Delete',
          icon: <Trash2 size={20} />,
          destructive: true,
          onSelect: () => {
            if (window.confirm(`Delete "${projectSheet.name}"? This can't be undone.`)) props.onDeleteProject(projectSheet.id);
          },
        },
      ]
    : [];

  const navItems: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'studio', label: 'Studio', icon: <Sparkles size={19} /> },
    { id: 'blueprints', label: 'Blueprints', icon: <Shapes size={19} /> },
    { id: 'projects', label: 'Projects', icon: <FolderClosed size={19} /> },
  ];

  return (
    <div className="app-height flex bg-[#f7f7fb] dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <input ref={importRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={handleImportFile} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraFile} />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-[#0B1020] text-indigo-100 safe-top safe-left">
        <div className="h-16 px-5 flex items-center">
          <button onClick={props.onGoLanding} title="About Architect">
            <Logo className="text-white" />
          </button>
        </div>
        <div className="px-4">
          <button
            onClick={() => setCreateOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold py-2.5 shadow-lg shadow-indigo-950/50 hover:opacity-95"
          >
            <Plus size={18} /> New
          </button>
        </div>
        <nav className="mt-6 px-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                tab === item.id ? 'bg-white/10 text-white font-medium' : 'text-indigo-100/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
              {item.id === 'projects' && projects.length > 0 && (
                <span className="ml-auto text-[11px] rounded-full bg-white/10 px-2 py-0.5">{projects.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4 space-y-3 safe-pb">
          <div className="rounded-xl border border-white/10 p-3 text-xs text-indigo-100/60 flex gap-2">
            <HardDrive size={16} className="shrink-0" />
            <span>Projects are saved in this browser. Share or export to keep a copy.</span>
          </div>
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-indigo-100/60 hover:text-white hover:bg-white/5"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden shrink-0 safe-top safe-left safe-right bg-[#f7f7fb]/90 dark:bg-gray-950/90 backdrop-blur">
          <div className="h-14 px-4 flex items-center justify-between">
            <button onClick={props.onGoLanding}>
              <Logo />
            </button>
            <button
              onClick={onToggleTheme}
              className="p-2 text-gray-500"
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        <main ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain safe-right">
          {tab === 'studio' && (
            <StudioTab
              {...props}
              onSnapSketch={() => cameraRef.current?.click()}
              onImportClick={() => importRef.current?.click()}
              onProjectMenu={setProjectSheet}
            />
          )}
          {tab === 'blueprints' && <BlueprintsTab onUseTemplate={props.onUseTemplate} />}
          {tab === 'projects' && <ProjectsTab {...props} onNew={() => setCreateOpen(true)} onProjectMenu={setProjectSheet} />}
        </main>

        {/* Mobile tab bar with a central create button */}
        <nav className="md:hidden shrink-0 border-t border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur safe-pb safe-left safe-right">
          <div className="grid grid-cols-4 items-end">
            {navItems.slice(0, 2).map(item => (
              <TabButton key={item.id} item={item} active={tab === item.id} onClick={() => onTabChange(item.id)} />
            ))}
            <div className="flex justify-center">
              <button
                onClick={() => setCreateOpen(true)}
                className="-mt-5 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white grid place-items-center shadow-xl shadow-indigo-500/30 active:scale-95 transition-transform"
                aria-label="Create"
              >
                <Plus size={26} />
              </button>
            </div>
            <TabButton item={navItems[2]} active={tab === 'projects'} onClick={() => onTabChange('projects')} />
          </div>
        </nav>
      </div>

      <ActionSheet open={createOpen} title="Start something new" actions={createActions} onClose={() => setCreateOpen(false)} />
      <ActionSheet open={!!projectSheet} title={projectSheet?.name} actions={projectActions} onClose={() => setProjectSheet(null)} />
    </div>
  );
};

const TabButton: React.FC<{ item: { label: string; icon: React.ReactNode }; active: boolean; onClick: () => void }> = ({ item, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] ${active ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-500'}`}
  >
    {item.icon}
    {item.label}
  </button>
);

// --- Studio (home) ---

type ExtraHandlers = {
  onSnapSketch: () => void;
  onImportClick: () => void;
  onProjectMenu: (p: Project) => void;
};

const StudioTab: React.FC<DashboardProps & ExtraHandlers> = ({
  projects, onStartPrompt, onOpenProject, onTabChange, onCreateBlank, onSnapSketch, onImportClick, onProjectMenu,
}) => {
  const recent = useMemo(() => [...projects].sort((a, b) => b.viewedAt - a.viewedAt).slice(0, 6), [projects]);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    try {
      setShowTips(localStorage.getItem(TIPS_DISMISSED_KEY) !== '1');
    } catch {
      setShowTips(true);
    }
  }, []);

  const hideTips = () => {
    setShowTips(false);
    try {
      localStorage.setItem(TIPS_DISMISSED_KEY, '1');
    } catch {
      // Tips just come back next visit
    }
  };

  const quickActions = [
    { label: 'Snap a sketch', icon: <Camera size={20} />, onClick: onSnapSketch, tint: 'from-rose-500 to-orange-400' },
    { label: 'Blank canvas', icon: <Square size={20} />, onClick: onCreateBlank, tint: 'from-sky-500 to-indigo-500' },
    { label: 'Blueprints', icon: <Shapes size={20} />, onClick: () => onTabChange('blueprints'), tint: 'from-violet-500 to-fuchsia-500' },
    { label: 'Import HTML', icon: <FileCode2 size={20} />, onClick: onImportClick, tint: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-10 py-6 md:py-14">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {greeting()} · {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">What are we building?</h1>

      <PromptBox
        onSubmit={onStartPrompt}
        placeholder="An app to split bills with my flatmates…"
        showTargets
        align="start"
        className="mt-6"
      />

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map(a => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex items-center gap-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-3 text-left text-sm font-medium hover:shadow-md active:scale-[0.98] transition-all"
          >
            <span className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${a.tint} text-white grid place-items-center`}>{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      <InstallPrompt className="mt-6 md:hidden" />

      {showTips && (
        <div className="mt-6 rounded-2xl bg-[#0B1020] text-white p-5 relative overflow-hidden">
          <button onClick={hideTips} className="absolute top-3 right-3 p-1 text-white/50 hover:text-white" aria-label="Dismiss tips">
            <X size={16} />
          </button>
          <p className="font-mono text-[11px] tracking-[0.2em] text-indigo-300">QUICK TIPS</p>
          <div className="mt-3 grid sm:grid-cols-3 gap-4 text-sm">
            <p className="flex gap-2.5"><PenTool size={18} className="shrink-0 text-rose-300" /> Tap “Mark Up” and circle anything on the preview to change it.</p>
            <p className="flex gap-2.5"><Mic size={18} className="shrink-0 text-indigo-300" /> Hold the mic in the chat to dictate instead of typing.</p>
            <p className="flex gap-2.5"><Share size={18} className="shrink-0 text-emerald-300" /> Share any page with AirDrop or save it to Files.</p>
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pick up where you left off</h2>
            <button onClick={() => onTabChange('projects')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              All projects <ArrowRight size={15} />
            </button>
          </div>
          <div className="mt-4 -mx-4 px-4 md:mx-0 md:px-0 flex md:grid md:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-px-4">
            {recent.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={() => onOpenProject(p.id)}
                onMenu={() => onProjectMenu(p)}
                className="snap-start shrink-0 w-[72%] sm:w-[45%] md:w-auto"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// --- Blueprints ---

const FILTERS: ('All' | TemplateCategory)[] = ['All', 'Sites', 'Apps', 'Dashboards'];

const BlueprintsTab: React.FC<{ onUseTemplate: (t: StarterTemplate) => void }> = ({ onUseTemplate }) => {
  const [filter, setFilter] = useState<'All' | TemplateCategory>('All');
  const visible = filter === 'All' ? STARTER_TEMPLATES : STARTER_TEMPLATES.filter(t => t.category === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-14">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Blueprints</h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">Real, editable apps to remix with words, drawings or your voice.</p>
      <div className="mt-6 inline-flex rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 text-sm max-w-full overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg transition-colors ${
              filter === f ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map(t => (
          <BlueprintCard key={t.id} template={t} onRemix={() => onUseTemplate(t)} className="" />
        ))}
      </div>
    </div>
  );
};

// --- Projects ---

const ProjectsTab: React.FC<DashboardProps & { onNew: () => void; onProjectMenu: (p: Project) => void }> = ({
  projects, onOpenProject, onTabChange, onNew, onProjectMenu,
}) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recent' | 'name'>('recent');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? projects.filter(p => p.name.toLowerCase().includes(q)) : [...projects];
    return list.sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : b.updatedAt - a.updatedAt));
  }, [projects, query, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} on this device
          </p>
        </div>
        <button
          onClick={onNew}
          className="hidden md:flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold px-4 py-2.5"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {projects.length > 0 ? (
        <>
          <div className="mt-6 flex items-center gap-2">
            <label className="flex-1 flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 focus-within:border-indigo-400">
              <Search size={16} className="text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                type="search"
                className="flex-1 min-w-0 bg-transparent py-2.5 text-base md:text-sm focus:outline-none"
              />
            </label>
            <button
              onClick={() => setSort(s => (s === 'recent' ? 'name' : 'recent'))}
              className="shrink-0 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-2.5 text-sm"
            >
              {sort === 'recent' ? 'Recent' : 'A–Z'}
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {visible.map(p => (
              <ProjectCard key={p.id} project={p} onOpen={() => onOpenProject(p.id)} onMenu={() => onProjectMenu(p)} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-10 text-center">
          <Shapes size={28} className="mx-auto text-indigo-500" />
          <p className="mt-3 font-semibold">Nothing here yet</p>
          <p className="text-sm text-gray-500 mt-1">Describe an idea in the Studio, or remix a blueprint.</p>
          <button onClick={() => onTabChange('blueprints')} className="mt-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5">
            Browse blueprints
          </button>
        </div>
      )}
    </div>
  );
};

// Long-press (touch) or the ••• button opens the project's action sheet
const ProjectCard: React.FC<{ project: Project; onOpen: () => void; onMenu: () => void; className?: string }> = ({
  project, onOpen, onMenu, className = '',
}) => {
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const startPress = () => {
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      onMenu();
    }, 500);
  };
  const cancelPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
  };

  return (
    <div className={`group relative ${className}`}>
      <button
        onClick={() => !longPressed.current && onOpen()}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
        onContextMenu={(e) => {
          e.preventDefault();
          onMenu();
        }}
        className="relative block w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-gray-200/80 dark:border-gray-800 shadow-sm group-hover:shadow-lg transition-shadow select-none [-webkit-touch-callout:none]"
      >
        <ScaledPreview code={project.pages[0]?.code || ''} device="desktop" className="w-full h-full" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute left-3 right-3 bottom-2.5 text-left text-white">
          <span className="block text-sm font-semibold truncate">{project.name}</span>
          <span className="block text-[11px] text-white/75">
            {project.pages.length} {project.pages.length === 1 ? 'page' : 'pages'} · {timeAgo(project.updatedAt)}
          </span>
        </span>
      </button>
      <button
        onClick={onMenu}
        className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 shadow-sm backdrop-blur"
        aria-label={`Actions for ${project.name}`}
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
};
