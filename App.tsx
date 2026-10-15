
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Smartphone, Tablet, Monitor, Code, Play, Plus, Trash2, Menu, Maximize2, Check, Copy, Share, Moon, Sun, PanelLeftClose, ChevronLeft } from 'lucide-react';
import { 
  generateUIUpdate, 
  askArchitect, 
  transcribeAudio, 
  speakText, 
  connectLive, 
  audioUtils 
} from './services/geminiService';
import { CanvasOverlay } from './components/CanvasOverlay';
import { DrawingToolbar } from './components/DrawingToolbar';
import { ChatInterface } from './components/ChatInterface';
import { Button } from './components/Button';
import { LandingPage } from './components/LandingPage';
import { Dashboard, DashboardTab } from './components/Dashboard';
import { StarterTemplate } from './data/templates';
import { buildPreviewDocument, shareHtml, sharePages } from './utils/previewDocument';
import { FullscreenPreview } from './components/FullscreenPreview';
import { BuildTarget } from './components/PromptBox';
import { Logo } from './components/Logo';
import { AppPage, ChatMessage, MessageRole, ViewMode, DrawMode, DrawingSettings, PreviewDevice, Project } from './types';
import { LiveServerMessage } from '@google/genai';

// Initial Template Code
const INITIAL_CODE = `
<div class="flex flex-col items-center justify-center min-h-full bg-gradient-to-br from-indigo-50 to-blue-50 p-6 text-center">
  <div class="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
    <div class="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    </div>
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome to Architect</h1>
    <p class="text-gray-500 mb-6">Start building your dream app by typing a prompt or drawing on this screen.</p>
    <button class="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors">
      Get Started
    </button>
  </div>
</div>
`;

const PROJECTS_STORAGE_KEY = 'architect_projects_v1';
// Single-project storage from before projects existed; migrated on first load
const LEGACY_PAGES_STORAGE_KEY = 'architect_pages_v1';
const THEME_STORAGE_KEY = 'architect_theme_v1';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: MessageRole.MODEL,
  text: "Hi! I'm Architect. Draw on the screen, use voice, or type to build."
};

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const makeProject = (name: string, pages: AppPage[]): Project => {
  const now = Date.now();
  return { id: newId('project'), name, pages, createdAt: now, updatedAt: now, viewedAt: now };
};

const loadProjects = (): Project[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    const legacy = localStorage.getItem(LEGACY_PAGES_STORAGE_KEY);
    if (legacy) {
      const pages: AppPage[] = JSON.parse(legacy);
      if (pages.length) return [makeProject('My first project', pages)];
    }
  } catch (e) {
    console.error("Failed to load projects from storage:", e);
  }
  return [];
};

// Imported files may be full documents; keep only what goes inside <body>
const extractBody = (html: string) => {
  if (!/<body[\s>]/i.test(html)) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script[src*="tailwindcss"]').forEach(el => el.remove());
  return doc.body.innerHTML.trim();
};

function App() {
  // State
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => projects[0]?.id ?? null);
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const pages = activeProject?.pages ?? [];
  const [activePageId, setActivePageId] = useState(() => pages[0]?.id ?? '');

  // Landing for first-time visitors, the dashboard for returning ones
  const [screen, setScreen] = useState<'landing' | 'dashboard' | 'editor'>(() => (projects.length ? 'dashboard' : 'landing'));
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('studio');

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('mobile');
  const [codeCopied, setCodeCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const drawerTouchX = useRef<number | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [drawMode, setDrawMode] = useState<DrawMode>(DrawMode.NONE);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  // Closed by default so phones start on the canvas; opened on desktop after mount
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Below Tailwind's `lg` (phones, iPad portrait) there is no room for split view
  const [isCompact, setIsCompact] = useState(false);
  
  // Auto-save State
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Drawing State
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    tool: 'pen',
    color: '#EF4444', 
    width: 3
  });
  const [clearTrigger, setClearTrigger] = useState(0); 

  // Audio/Voice State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Refs
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 });
  const [pendingSketch, setPendingSketch] = useState<string | null>(null);
  
  // Audio Context Refs
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const activePage: AppPage = pages.find(p => p.id === activePageId) || pages[0] || { id: '', name: '', code: '' };
  const previewDoc = useMemo(() => buildPreviewDocument(activePage.code, activePage.name), [activePage.code, activePage.name]);

  // --- PROJECT STATE HELPERS ---

  const updateProject = (id: string, change: (p: Project) => Partial<Project>) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...change(p), updatedAt: Date.now() } : p)));
  };

  const setActivePages = (change: (pages: AppPage[]) => AppPage[]) => {
    if (activeProject) updateProject(activeProject.id, p => ({ pages: change(p.pages) }));
  };

  // Page ids are unique across projects, so this also lands correctly when the
  // user has switched projects while a generation was in flight
  const setPageCode = (pageId: string, code: string) => {
    setProjects(prev => prev.map(p =>
      p.pages.some(pg => pg.id === pageId)
        ? { ...p, updatedAt: Date.now(), pages: p.pages.map(pg => (pg.id === pageId ? { ...pg, code } : pg)) }
        : p
    ));
  };

  const openProject = (id: string, project = projects.find(p => p.id === id)) => {
    if (!project) return;
    setActiveProjectId(id);
    setActivePageId(project.pages[0]?.id ?? '');
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, viewedAt: Date.now() } : p)));
    setMessages([WELCOME_MESSAGE]);
    setPendingSketch(null);
    setDrawMode(DrawMode.NONE);
    // Give the preview the full width; the code is one tap away
    setViewMode(ViewMode.PREVIEW);
    setScreen('editor');
  };

  // Adds a project and opens it in the editor; returns the first page's id
  const createProject = (name: string, firstPage: Omit<AppPage, 'id'>) => {
    const page: AppPage = { id: newId('page'), ...firstPage };
    const project = makeProject(name, [page]);
    setProjects(prev => [project, ...prev]);
    openProject(project.id, project);
    return page.id;
  };


  const effectiveViewMode = isCompact && viewMode === ViewMode.SPLIT ? ViewMode.PREVIEW : viewMode;

  // Track the mobile (`md`) and compact (`lg`) breakpoints
  useEffect(() => {
    const mobileMql = window.matchMedia('(max-width: 767px)');
    const compactMql = window.matchMedia('(max-width: 1023px)');
    const sync = () => {
      setIsMobile(mobileMql.matches);
      setIsCompact(compactMql.matches);
      setIsSidebarOpen(!compactMql.matches);
    };
    sync();
    mobileMql.addEventListener('change', sync);
    compactMql.addEventListener('change', sync);
    return () => {
      mobileMql.removeEventListener('change', sync);
      compactMql.removeEventListener('change', sync);
    };
  }, []);

  // Size the app to the visible area: on iOS the keyboard and browser chrome
  // change the visual viewport without updating 100vh.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      // Ignore pinch-zoom, which also shrinks the visual viewport
      if (vv.scale > 1.01) return;
      document.documentElement.style.setProperty('--app-height', `${vv.height}px`);
      // iOS scrolls the page to reveal a focused input; keep the layout pinned
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };
    update();
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, []);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auto-save Effect
  useEffect(() => {
    setSaveStatus('saving');
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
        setSaveStatus('saved');
      } catch (error) {
        console.error("Failed to save projects:", error);
        setSaveStatus('unsaved');
      }
    }, 2000); // Debounce save by 2 seconds

    return () => clearTimeout(timeoutId);
  }, [projects]);

  useEffect(() => {
    const updateDimensions = () => {
      if (previewContainerRef.current) {
        setPreviewDimensions({
          width: previewContainerRef.current.clientWidth,
          height: previewContainerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateDimensions);
    // Catches layout changes such as the mobile chat sheet expanding
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateDimensions) : null;
    if (previewContainerRef.current) observer?.observe(previewContainerRef.current);
    updateDimensions();
    const timeoutId = setTimeout(updateDimensions, 350);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      observer?.disconnect();
      clearTimeout(timeoutId);
    };
  }, [effectiveViewMode, isSidebarOpen]);

  // --- AUDIO & LIVE API LOGIC ---

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playAudioBuffer = async (base64Audio: string) => {
    initAudioContext();
    const ctx = audioContextRef.current!;
    const bytes = audioUtils.decode(base64Audio);
    const buffer = await audioUtils.decodeAudioData(bytes, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  };

  const startLiveSession = async () => {
    try {
      setIsLiveActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = audioUtils.createBlob(inputData);
        if (liveSessionRef.current) {
          liveSessionRef.current.then((session: any) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
      processorRef.current = processor;

      initAudioContext(); // Output context

      liveSessionRef.current = connectLive({
        onopen: () => console.log('Live Session Opened'),
        onmessage: async (msg: LiveServerMessage) => {
           const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
           if (base64Audio && audioContextRef.current) {
             const ctx = audioContextRef.current;
             const bytes = audioUtils.decode(base64Audio);
             const buffer = await audioUtils.decodeAudioData(bytes, ctx, 24000, 1);
             
             const outputSource = ctx.createBufferSource();
             outputSource.buffer = buffer;
             outputSource.connect(ctx.destination);
             
             const currentTime = ctx.currentTime;
             // Ensure smooth playback queuing
             if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime;
             }
             outputSource.start(nextStartTimeRef.current);
             nextStartTimeRef.current += buffer.duration;
           }
        },
        onclose: () => {
          console.log('Live Session Closed');
          stopLiveSession();
        },
        onerror: (err: any) => console.error('Live Error', err)
      });

    } catch (err) {
      console.error("Failed to start live session", err);
      setIsLiveActive(false);
    }
  };

  const stopLiveSession = () => {
    setIsLiveActive(false);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    liveSessionRef.current = null;
  };

  // --- VOICE RECORDING (Transcription) ---

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsLoading(true);
          const text = await transcribeAudio(base64Audio);
          setIsLoading(false);
          if (text) {
             handleSendMessage(text);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed", err);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- TTS ---
  const handleSpeak = async (text: string) => {
    setIsPlayingAudio(true);
    const audioData = await speakText(text);
    if (audioData) {
      await playAudioBuffer(audioData);
    }
    setIsPlayingAudio(false);
  };


  // --- CHAT & LOGIC ---

  // `forceBuild` sends the request straight to code generation; `pageId`/`baseCode`
  // target a page created in the same tick, before state has updated.
  const handleSendMessage = async (
    text: string,
    image?: string,
    opts: { forceBuild?: boolean; pageId?: string; baseCode?: string; framing?: string } = {}
  ) => {
    const targetPageId = opts.pageId ?? activePageId;
    const baseCode = opts.baseCode ?? activePage.code;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text,
      image
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const imageContext = image || pendingSketch || undefined;
      const isCodeRequest = 
         opts.forceBuild ||
         imageContext || 
         /change|update|add|remove|style|color|font|layout|button|header|footer|background/i.test(text);

      if (isCodeRequest) {
        const request = opts.framing ? `${opts.framing}. ${text}` : text;
        const updatedCode = await generateUIUpdate(baseCode, request, imageContext);
        setPageCode(targetPageId, updatedCode);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: MessageRole.MODEL,
          text: "I've updated the design based on your request."
        }]);
      } else {
        const history = messages.slice(-5).map(m => ({ role: m.role, text: m.text }));
        const response = await askArchitect(history, text);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: MessageRole.MODEL,
          text: response.text,
          grounding: response.grounding
        }]);
      }

      if (pendingSketch) {
        setPendingSketch(null);
        setClearTrigger(prev => prev + 1); 
      }
      if (drawMode === DrawMode.DRAWING) setDrawMode(DrawMode.NONE);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawingComplete = (dataUrl: string) => {
    setPendingSketch(dataUrl);
  };

  const handleClearCanvas = () => {
    setPendingSketch(null);
    setClearTrigger(prev => prev + 1);
  };

  const createNewPage = () => {
    const page: AppPage = {
      id: newId('page'),
      name: `Page ${pages.length + 1}`,
      code: '<div class="p-10 text-center text-gray-400">New Page</div>'
    };
    setActivePages(prev => [...prev, page]);
    setActivePageId(page.id);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleStartPrompt = (text: string, image?: string, target?: BuildTarget) => {
    const name = text.length > 28 ? `${text.slice(0, 28).trim()}…` : text;
    const baseCode = '<div class="min-h-full grid place-items-center p-10 text-center text-gray-400">Building your page…</div>';
    const pageId = createProject(name || 'Untitled project', { name: 'Home', code: baseCode });
    const wantsMobile = target ? target === 'app' : /\b(app|mobile|phone|ios|android)\b/i.test(text);
    setPreviewDevice(wantsMobile ? 'mobile' : 'desktop');
    // Tell the model what kind of interface to lay out
    const framing = target === 'app'
      ? 'Design this as a mobile app screen (phone-first, bottom navigation where it fits)'
      : target === 'dashboard'
        ? 'Design this as a data dashboard (cards, charts, tables)'
        : target === 'website'
          ? 'Design this as a responsive website'
          : '';
    handleSendMessage(text, image, { forceBuild: true, pageId, baseCode, framing });
  };

  const handleUseTemplate = (template: StarterTemplate) => {
    createProject(template.label, { name: 'Home', code: template.code });
    setPreviewDevice(template.device);
    setMessages([WELCOME_MESSAGE, {
      id: Date.now().toString(),
      role: MessageRole.MODEL,
      text: `The ${template.label} blueprint is ready. Tell me what to change, or circle something on the preview.`
    }]);
  };

  const handleCreateBlank = () => {
    createProject('Untitled project', { name: 'Home', code: INITIAL_CODE });
    setPreviewDevice('mobile');
  };

  const handleImport = (fileName: string, html: string) => {
    createProject(fileName || 'Imported project', { name: 'Home', code: extractBody(html) });
    setPreviewDevice('desktop');
  };

  const duplicateProject = (id: string) => {
    const source = projects.find(p => p.id === id);
    if (!source) return;
    const copy = makeProject(`${source.name} copy`, source.pages.map(pg => ({ ...pg, id: newId('page') })));
    setProjects(prev => [copy, ...prev]);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  };

  const shareProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    sharePages(
      project.pages.map(pg => ({ code: pg.code, name: project.pages.length > 1 ? `${project.name} ${pg.name}` : project.name })),
      project.name
    );
  };

  const handleShare = () => shareHtml(activePage.code, pages.length > 1 ? `${activeProject.name} ${activePage.name}` : activeProject.name);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activePage.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1500);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const selectPage = (id: string) => {
    setActivePageId(id);
    if (isMobile) setIsSidebarOpen(false);
  };

  const deletePage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length <= 1) return;
    const newPages = pages.filter(p => p.id !== id);
    setActivePages(() => newPages);
    if (activePageId === id) setActivePageId(newPages[0].id);
  };

  if (screen === 'landing') {
    return (
      <LandingPage
        onStartPrompt={handleStartPrompt}
        onUseTemplate={handleUseTemplate}
        onOpenEditor={() => setScreen('dashboard')}
        hasProject={projects.length > 0}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (screen === 'dashboard' || !activeProject) {
    return (
      <Dashboard
        projects={projects}
        tab={dashboardTab}
        onTabChange={setDashboardTab}
        onOpenProject={(id) => openProject(id)}
        onStartPrompt={handleStartPrompt}
        onUseTemplate={handleUseTemplate}
        onCreateBlank={handleCreateBlank}
        onImport={handleImport}
        onRenameProject={(id, name) => updateProject(id, () => ({ name }))}
        onDuplicateProject={duplicateProject}
        onDeleteProject={deleteProject}
        onShareProject={shareProject}
        onGoLanding={() => setScreen('landing')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="app-height flex w-full overflow-hidden bg-apple-gray dark:bg-gray-900 text-apple-dark dark:text-gray-100 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">

      {/* Mobile sidebar backdrop */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Sidebar: slide-in drawer on mobile, collapsible column on desktop */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0 md:w-64' : '-translate-x-full md:w-0 md:opacity-0'
        } fixed md:relative inset-y-0 left-0 z-50 md:z-auto w-72 max-w-[85vw] md:max-w-none shrink-0 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-2xl md:shadow-none transition-all duration-300 ease-in-out safe-top safe-left safe-pb`}
        aria-hidden={!isSidebarOpen}
        onTouchStart={(e) => { drawerTouchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          // Swipe left to close the drawer
          if (drawerTouchX.current !== null && drawerTouchX.current - e.changedTouches[0].clientX > 60) setIsSidebarOpen(false);
          drawerTouchX.current = null;
        }}
      >
        <div className="h-14 px-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0">
          <button
            onClick={() => setScreen('dashboard')}
            className="flex items-center space-x-2 font-bold text-gray-800 dark:text-white whitespace-nowrap"
            title="Back to projects"
          >
            <Logo size={24} />
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 -mr-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-1">
          <button
            onClick={() => setScreen('dashboard')}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeft size={16} />
            All projects
          </button>
          <div className="px-2 pt-2 pb-3 border-b border-gray-100 dark:border-gray-700 mb-2">
            <div className="text-xs text-gray-400 dark:text-gray-500">Project</div>
            <div className="font-semibold text-gray-800 dark:text-gray-100 truncate" title={activeProject.name}>{activeProject.name}</div>
          </div>
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2 mt-2">Pages</div>
          {pages.map(page => (
            <div
              key={page.id}
              onClick={() => selectPage(page.id)}
              className={`group flex items-center justify-between px-3 py-3 md:py-2 rounded-lg cursor-pointer transition-colors text-base md:text-sm ${
                activePageId === page.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="truncate">{page.name}</span>
              {pages.length > 1 && (
                <button
                  onClick={(e) => deletePage(page.id, e)}
                  className="p-1 -mr-1 md:opacity-0 md:group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity"
                  aria-label={`Delete ${page.name}`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <button
            onClick={toggleTheme}
            className="md:hidden w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            onClick={createNewPage}
            className="w-full flex items-center justify-center space-x-2 bg-gray-900 dark:bg-black hover:bg-black dark:hover:bg-gray-900 text-white py-3 md:py-2 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            <span>New Page</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col relative min-w-0 min-h-0 safe-right ${isSidebarOpen && !isMobile ? '' : 'safe-left'}`}>

        {/* Top Navigation Bar */}
        <header className="safe-top shrink-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="h-14 flex items-center justify-between gap-2 px-3 md:px-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
             {!isSidebarOpen && (
               <button
                 onClick={() => setIsSidebarOpen(true)}
                 className="p-2 -ml-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg text-gray-600 dark:text-gray-300 shrink-0"
                 aria-label="Open sidebar"
               >
                 <Menu size={20} />
               </button>
             )}

             {/* Page Title & Save Status */}
             <div className="flex flex-col min-w-0">
               <span className="font-medium text-gray-700 dark:text-gray-200 leading-tight truncate">{activeProject.name}</span>
               <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 whitespace-nowrap">
                 <span className="truncate max-w-[8rem]">{activePage.name}</span>
                 <span aria-hidden="true">·</span>
                 {saveStatus === 'saving' ? (
                   <>Saving...</>
                 ) : (
                   <><Check size={10} /> Saved locally</>
                 )}
               </span>
             </div>

             {isLiveActive && (
               <span className="flex items-center text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full animate-pulse shrink-0">
                 <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                 LIVE<span className="hidden sm:inline">&nbsp;SESSION</span>
               </span>
             )}
          </div>

          <div className="flex items-center gap-1 md:gap-2 shrink-0">
             {/* Theme Toggle (in the drawer on phones, to keep the header uncluttered) */}
             <button
              onClick={toggleTheme}
              className="hidden md:block p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>

            <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setViewMode(ViewMode.PREVIEW)}
                className={`p-2 md:p-1.5 rounded-md transition-all ${effectiveViewMode === ViewMode.PREVIEW ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                title="Preview"
                aria-label="Preview"
              >
                <Smartphone size={16} />
              </button>
              <button
                onClick={() => setViewMode(ViewMode.SPLIT)}
                className={`p-1.5 rounded-md transition-all hidden lg:block ${effectiveViewMode === ViewMode.SPLIT ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                title="Split View"
                aria-label="Split View"
              >
                <Maximize2 size={16} className="rotate-45" />
              </button>
              <button
                onClick={() => setViewMode(ViewMode.CODE)}
                className={`p-2 md:p-1.5 rounded-md transition-all ${effectiveViewMode === ViewMode.CODE ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                title="Code"
                aria-label="Code"
              >
                <Code size={16} />
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
              title="Try it full screen"
              aria-label="Try it full screen"
            >
              <Play size={17} />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold p-2 md:px-3 md:py-2 rounded-lg hover:opacity-90 transition-opacity"
              title="Share or export as HTML"
              aria-label="Share or export as HTML"
            >
              <Share size={16} />
              <span className="hidden md:inline">Share</span>
            </button>
          </div>
          </div>
        </header>

        {/* Workspace + chat: stacked on mobile (chat as bottom sheet), side by side on desktop */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">

        <div className="flex-1 flex overflow-hidden relative min-h-0 min-w-0">

          {/* Preview Panel */}
          <div
            className={`flex-1 min-w-0 relative bg-gray-100 dark:bg-gray-900 transition-all duration-300 flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 overflow-hidden
              ${effectiveViewMode === ViewMode.CODE ? 'hidden' : ''}
              ${effectiveViewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'}
            `}
          >
             {/* Device size picker (desktop only; on a phone the real device is the frame) */}
             <div className="hidden md:flex items-center gap-1 mb-4 shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm z-10">
               {([
                 ['mobile', Smartphone, 'Mobile'],
                 ['tablet', Tablet, 'Tablet'],
                 ['desktop', Monitor, 'Desktop'],
               ] as const).map(([device, Icon, label]) => (
                 <button
                   key={device}
                   onClick={() => setPreviewDevice(device)}
                   className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors ${
                     previewDevice === device
                       ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium'
                       : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                   }`}
                   aria-pressed={previewDevice === device}
                 >
                   <Icon size={14} />
                   <span className="hidden lg:inline">{label}</span>
                 </button>
               ))}
             </div>

             {/* Device Frame (full-bleed on phones, where the real device is the frame) */}
             <div className={`relative w-full flex-1 min-h-0 bg-white overflow-hidden shadow-lg md:shadow-2xl rounded-2xl border border-gray-200 transition-all duration-300 ${
               previewDevice === 'mobile'
                 ? 'max-w-[400px] md:max-h-[850px] md:rounded-[3rem] md:border-[8px] md:border-gray-900 md:ring-4 ring-gray-200/50 dark:ring-gray-700/50'
                 : previewDevice === 'tablet'
                   ? 'max-w-[400px] md:max-w-[820px] md:max-h-[1180px] md:rounded-[2rem] md:border-[10px] md:border-gray-900'
                   : 'max-w-[400px] md:max-w-none md:rounded-xl md:border-gray-300 dark:md:border-gray-700 md:pt-8'
             }`}>
                {/* Notch / browser bar */}
                {previewDevice === 'mobile' && (
                  <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-30"></div>
                )}
                {previewDevice === 'desktop' && (
                  <div className="hidden md:flex absolute top-0 inset-x-0 h-8 items-center gap-1.5 px-3 bg-gray-100 border-b border-gray-200 z-30">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400"></span>
                    <span className="ml-3 flex-1 max-w-xs h-5 rounded-md bg-white text-[10px] text-gray-400 flex items-center px-2 truncate">{activePage.name}</span>
                  </div>
                )}
                
                {/* Actual App Content: a sandboxed iframe, so Tailwind breakpoints follow the frame width */}
                <div 
                  ref={previewContainerRef}
                  className="w-full h-full relative"
                >
                  <iframe
                    title={`${activePage.name} preview`}
                    srcDoc={previewDoc}
                    sandbox="allow-scripts allow-forms allow-popups"
                    className="w-full h-full border-0 bg-white"
                  />

                  <CanvasOverlay 
                    mode={drawMode}
                    settings={drawingSettings}
                    width={previewDimensions.width}
                    height={previewDimensions.height}
                    onDrawingComplete={handleDrawingComplete}
                    onClear={handleClearCanvas}
                    triggerClear={clearTrigger}
                  />
                </div>
             </div>

             {/* Drawing Toolbar */}
             {drawMode === DrawMode.DRAWING && (
               <div className="absolute left-8 top-1/2 -translate-y-1/2 z-50 hidden md:block">
                 <DrawingToolbar
                    settings={drawingSettings}
                    onUpdateSettings={setDrawingSettings}
                    onClear={handleClearCanvas}
                 />
               </div>
             )}

             {/* Mobile Toolbar */}
             {drawMode === DrawMode.DRAWING && (
               <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 md:hidden">
                 <DrawingToolbar
                    settings={drawingSettings}
                    onUpdateSettings={setDrawingSettings}
                    onClear={handleClearCanvas}
                    orientation="horizontal"
                 />
               </div>
             )}

             {drawMode === DrawMode.DRAWING && (
               <div className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-4 py-1 rounded-full text-xs font-medium shadow-lg z-50">
                 Drawing Mode Active
               </div>
             )}
          </div>

          {/* Code Panel */}
          <div
             className={`flex-1 min-w-0 bg-[#1e1e1e] overflow-auto overscroll-contain border-l border-gray-800 transition-all duration-300
              ${effectiveViewMode === ViewMode.PREVIEW ? 'hidden' : ''}
              ${effectiveViewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'}
             `}
          >
             <div className="sticky top-0 bg-[#1e1e1e] text-gray-400 text-xs px-4 py-2 border-b border-gray-800 font-mono flex items-center justify-between gap-2">
               <span className="truncate">generated_output.html</span>
               <button
                 onClick={handleCopyCode}
                 className="flex items-center gap-1 font-sans text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors"
               >
                 {codeCopied ? <Check size={12} /> : <Copy size={12} />}
                 {codeCopied ? 'Copied' : 'Copy'}
               </button>
             </div>
             <pre className="p-4 text-xs md:text-sm font-mono text-gray-300 whitespace-pre-wrap break-words">
               {activePage.code}
             </pre>
          </div>

        </div>

          {/* Chat Interface */}
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isDrawMode={drawMode === DrawMode.DRAWING}
            onToggleDrawMode={() => setDrawMode(prev => prev === DrawMode.DRAWING ? DrawMode.NONE : DrawMode.DRAWING)}
            pendingImage={pendingSketch}
            onClearPendingImage={handleClearCanvas}

            // Voice props
            onStartLive={startLiveSession}
            onStopLive={stopLiveSession}
            isLiveActive={isLiveActive}
            onRecordStart={startRecording}
            onRecordStop={stopRecording}
            isRecording={isRecording}
            onSpeak={handleSpeak}
            isPlayingAudio={isPlayingAudio}
          />

        </div>
      </div>

      {isFullscreen && (
        <FullscreenPreview
          code={activePage.code}
          name={activeProject.name}
          onClose={() => setIsFullscreen(false)}
          onShare={handleShare}
        />
      )}
    </div>
  );
}

export default App;
