'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Layout, Home, LayoutTemplate, FolderOpen, FileUp, Plus, ChevronLeft, ChevronRight, ArrowRight,
  Info, X, Moon, Sun, MoreHorizontal, Search, HardDrive,
} from 'lucide-react';
import { Project } from '../types';
import { STARTER_TEMPLATES, StarterTemplate, TemplateCategory } from '../data/templates';
import { PromptBox } from './PromptBox';
import { ScaledPreview } from './ScaledPreview';

export type DashboardTab = 'home' | 'templates' | 'projects';

interface DashboardProps {
  projects: Project[];
  tab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onOpenProject: (id: string) => void;
  onStartPrompt: (text: string, image?: string) => void;
  onUseTemplate: (template: StarterTemplate) => void;
  onCreateBlank: () => void;
  onImport: (fileName: string, html: string) => void;
  onRenameProject: (id: string, name: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onExportProject: (id: string) => void;
  onGoLanding: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const WELCOME_DISMISSED_KEY = 'architect_welcome_dismissed_v1';
const SIDEBAR_COLLAPSED_KEY = 'architect_dashboard_sidebar_collapsed_v1';

const timeAgo = (ts: number) => {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d ago`;
  return new Date(ts).toLocaleDateString();
};

const readFlag = (key: string) => {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

const writeFlag = (key: string, value: boolean) => {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // Storage unavailable (private mode); the flag just won't persist
  }
};

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const { projects, tab, onTabChange, theme, onToggleTheme } = props;
  const [showWelcome, setShowWelcome] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowWelcome(!readFlag(WELCOME_DISMISSED_KEY));
    setCollapsed(readFlag(SIDEBAR_COLLAPSED_KEY));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [tab]);

  const dismissWelcome = () => {
    setShowWelcome(false);
    writeFlag(WELCOME_DISMISSED_KEY, true);
  };

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      writeFlag(SIDEBAR_COLLAPSED_KEY, !prev);
      return !prev;
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => props.onImport(file.name.replace(/\.html?$/i, ''), String(reader.result || ''));
    reader.readAsText(file);
  };

  const navItems: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'templates', label: 'Templates', icon: <LayoutTemplate size={18} /> },
    { id: 'projects', label: 'My Projects', icon: <FolderOpen size={18} /> },
  ];

  return (
    <div className="app-height flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <input ref={importRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={handleImportFile} />

      {/* Welcome banner */}
      {showWelcome && (
        <div className="safe-top shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start md:items-center gap-3 px-4 py-2.5 text-xs md:text-sm safe-left safe-right">
            <Info size={16} className="shrink-0 mt-0.5 md:mt-0 text-gray-500" />
            <p className="flex-1 text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">Welcome to Architect!</span>{' '}
              Describe an idea, start from a template or import an HTML file. Your projects are saved in this browser and can be exported any time.
            </p>
            <button
              onClick={dismissWelcome}
              className="shrink-0 flex items-center gap-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 hover:bg-white dark:hover:bg-gray-700"
            >
              <X size={12} /> Hide
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Desktop sidebar */}
        <aside
          className={`hidden md:flex flex-col shrink-0 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 safe-left ${
            collapsed ? 'w-[68px]' : 'w-64'
          } ${showWelcome ? '' : 'safe-top'}`}
        >
          <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
            {!collapsed && (
              <button onClick={props.onGoLanding} className="flex items-center gap-2 font-bold" title="About Architect">
                <Layout className="text-blue-600" size={22} />
                <span>Architect.ai</span>
              </button>
            )}
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="px-3 space-y-1">
            <SidebarButton collapsed={collapsed} icon={<FileUp size={18} />} label="Import project" onClick={() => importRef.current?.click()} />
            <div className="h-3" />
            {navItems.map(item => (
              <SidebarButton
                key={item.id}
                collapsed={collapsed}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                onClick={() => onTabChange(item.id)}
              />
            ))}
          </nav>

          <div className="mt-auto p-3 space-y-2 safe-pb">
            <button
              onClick={props.onCreateBlank}
              className={`w-full flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${
                collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
              }`}
              title="New blank project"
            >
              <Plus size={18} className="text-gray-500 shrink-0" />
              {!collapsed && (
                <span className="min-w-0">
                  <span className="block text-sm font-medium">New project</span>
                  <span className="block text-xs text-gray-500">Start from a blank page</span>
                </span>
              )}
            </button>
            <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
              <HardDrive size={18} className="text-gray-400 shrink-0" />
              {!collapsed && (
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium">Local workspace</span>
                  <span className="block text-xs text-gray-500">{projects.length} {projects.length === 1 ? 'project' : 'projects'} in this browser</span>
                </span>
              )}
              {!collapsed && (
                <button
                  onClick={onToggleTheme}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile header */}
          <header className={`md:hidden shrink-0 border-b border-gray-100 dark:border-gray-800 safe-left safe-right ${showWelcome ? '' : 'safe-top'}`}>
            <div className="h-14 px-4 flex items-center justify-between">
              <button onClick={props.onGoLanding} className="flex items-center gap-2 font-bold">
                <Layout className="text-blue-600" size={20} />
                <span>Architect.ai</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleTheme}
                  className="p-2 text-gray-500"
                  aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button onClick={props.onCreateBlank} className="p-2 text-gray-700 dark:text-gray-200" aria-label="New project">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </header>

          <main ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain safe-right">
            {tab === 'home' && <HomeTab {...props} />}
            {tab === 'templates' && <TemplatesTab onUseTemplate={props.onUseTemplate} />}
            {tab === 'projects' && <ProjectsTab {...props} />}
          </main>

          {/* Mobile tab bar */}
          <nav className="md:hidden shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur safe-pb safe-left safe-right">
            <div className="grid grid-cols-4">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center gap-1 pt-2 pb-1.5 text-[11px] ${
                    tab === item.id ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500'
                  }`}
                >
                  {item.icon}
                  {item.label === 'My Projects' ? 'Projects' : item.label}
                </button>
              ))}
              <button
                onClick={() => importRef.current?.click()}
                className="flex flex-col items-center gap-1 pt-2 pb-1.5 text-[11px] text-gray-500"
              >
                <FileUp size={18} />
                Import
              </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

const SidebarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  collapsed: boolean;
}> = ({ icon, label, onClick, active, collapsed }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center gap-3 rounded-lg text-sm transition-colors ${
      collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
    } ${
      active
        ? 'bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'
    }`}
  >
    <span className="shrink-0">{icon}</span>
    {!collapsed && <span className="truncate">{label}</span>}
  </button>
);

// --- Home ---

const HomeTab: React.FC<DashboardProps> = ({ projects, onStartPrompt, onOpenProject, onTabChange, onUseTemplate, ...rest }) => {
  const recent = useMemo(() => [...projects].sort((a, b) => b.viewedAt - a.viewedAt).slice(0, 3), [projects]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-20">
      <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
        Build anything{' '}
        <em className="not-italic md:italic bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent uppercase">imaginable</em>
        {' '}with Architect
      </h1>

      <PromptBox onSubmit={onStartPrompt} placeholder="Build me a very good website" className="mt-8 md:mt-10" />

      <section className="mt-14 md:mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{recent.length ? 'Recently viewed' : 'Start from a template'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {recent.length ? 'Your latest project activity.' : 'Pick a starting point and make it yours.'}
            </p>
          </div>
          <button
            onClick={() => onTabChange(recent.length ? 'projects' : 'templates')}
            className="shrink-0 flex items-center gap-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Browse all <ArrowRight size={16} />
          </button>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recent.length
            ? recent.map(p => <ProjectCard key={p.id} project={p} onOpen={() => onOpenProject(p.id)} {...rest} />)
            : STARTER_TEMPLATES.slice(0, 3).map(t => <TemplateCard key={t.id} template={t} onUse={() => onUseTemplate(t)} />)}
        </div>
      </section>
    </div>
  );
};

// --- Templates ---

const CATEGORIES: ('All' | TemplateCategory)[] = ['All', 'Website', 'App', 'Dashboard'];

const TemplatesTab: React.FC<{ onUseTemplate: (t: StarterTemplate) => void }> = ({ onUseTemplate }) => {
  const [category, setCategory] = useState<'All' | TemplateCategory>('All');
  const visible = category === 'All' ? STARTER_TEMPLATES : STARTER_TEMPLATES.filter(t => t.category === category);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <h1 className="text-2xl font-bold">Templates</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Starting points you can open, edit with the agent and export.</p>

      <p className="mt-8 text-xs text-gray-400">Categories</p>
      <div className="mt-2 -mx-4 px-4 md:mx-0 md:px-0 flex gap-3 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(c => {
          const count = c === 'All' ? STARTER_TEMPLATES.length : STARTER_TEMPLATES.filter(t => t.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 w-40 md:w-48 text-left rounded-xl border px-4 py-3 transition-colors ${
                category === c
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="block text-sm font-medium">{c === 'All' ? 'All templates' : c}</span>
              <span className="block text-xs text-gray-500 mt-0.5">{count} available</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map(t => <TemplateCard key={t.id} template={t} onUse={() => onUseTemplate(t)} />)}
      </div>
    </div>
  );
};

const TemplateCard: React.FC<{ template: StarterTemplate; onUse: () => void }> = ({ template, onUse }) => (
  <button onClick={onUse} className="group text-left">
    <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
      <ScaledPreview code={template.code} device={template.device === 'mobile' ? 'tablet' : 'desktop'} className="w-full h-full" />
      <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold lowercase bg-white/90 text-gray-700 rounded-md px-2 py-0.5 shadow-sm">
        {template.category}
      </span>
      <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold bg-gray-900/80 text-white rounded-md px-2 py-0.5">Free</span>
    </div>
    <p className="mt-3 text-sm font-semibold">{template.label}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{template.description}</p>
  </button>
);

// --- Projects ---

type ProjectActions = Pick<DashboardProps, 'onRenameProject' | 'onDuplicateProject' | 'onDeleteProject' | 'onExportProject'>;

const ProjectsTab: React.FC<DashboardProps> = ({ projects, onOpenProject, onCreateBlank, onTabChange, ...rest }) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recent' | 'name'>('recent');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? projects.filter(p => p.name.toLowerCase().includes(q)) : [...projects];
    return list.sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : b.updatedAt - a.updatedAt));
  }, [projects, query, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} saved in this browser.
          </p>
        </div>
        <button
          onClick={onCreateBlank}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
        >
          <Plus size={16} /> New project
        </button>
      </div>

      {projects.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="flex-1 min-w-[200px] flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 focus-within:border-blue-400">
            <Search size={16} className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects"
              className="flex-1 bg-transparent py-2.5 text-base md:text-sm focus:outline-none"
            />
          </label>
          <div className="flex items-center rounded-full border border-gray-200 dark:border-gray-700 p-1 text-xs">
            {(['recent', 'name'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 rounded-full ${sort === s ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
              >
                {s === 'recent' ? 'Recent' : 'Name'}
              </button>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
          <p className="font-medium">No projects yet</p>
          <p className="text-sm text-gray-500 mt-1">Describe an idea on the Home tab or start from a template.</p>
          <button onClick={() => onTabChange('templates')} className="mt-4 text-sm font-medium text-blue-600 underline underline-offset-4">
            Browse templates
          </button>
        </div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map(p => <ProjectCard key={p.id} project={p} onOpen={() => onOpenProject(p.id)} {...rest} />)}
        </div>
      )}
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project; onOpen: () => void } & ProjectActions> = ({
  project, onOpen, onRenameProject, onDuplicateProject, onDeleteProject, onExportProject,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  const run = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  const rename = () => {
    const name = window.prompt('Rename project', project.name);
    if (name && name.trim()) onRenameProject(project.id, name.trim());
  };

  const remove = () => {
    if (window.confirm(`Delete "${project.name}"? This can't be undone.`)) onDeleteProject(project.id);
  };

  return (
    <div className="group relative">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="aspect-[16/10] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
          <ScaledPreview code={project.pages[0]?.code || ''} device="desktop" className="w-full h-full" />
        </div>
      </button>
      <div className="mt-3 flex items-start justify-between gap-2">
        <button onClick={onOpen} className="min-w-0 text-left">
          <p className="text-sm font-semibold truncate">{project.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {project.pages.length} {project.pages.length === 1 ? 'page' : 'pages'} · edited {timeAgo(project.updatedAt)}
          </p>
        </button>
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={`Actions for ${project.name}`}
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 bottom-full mb-1 z-20 w-40 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl py-1 text-sm">
              <MenuItem onClick={run(onOpen)}>Open</MenuItem>
              <MenuItem onClick={run(rename)}>Rename</MenuItem>
              <MenuItem onClick={run(() => onDuplicateProject(project.id))}>Duplicate</MenuItem>
              <MenuItem onClick={run(() => onExportProject(project.id))}>Export HTML</MenuItem>
              <MenuItem onClick={run(remove)} danger>Delete</MenuItem>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuItem: React.FC<{ onClick: () => void; danger?: boolean; children: React.ReactNode }> = ({ onClick, danger, children }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${danger ? 'text-red-600' : ''}`}
  >
    {children}
  </button>
);
