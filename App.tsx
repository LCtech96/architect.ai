
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Smartphone, Code, Play, Plus, Trash2, Menu, Maximize2, Check, Moon, Sun, PanelLeftClose } from 'lucide-react';
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
import { AppPage, ChatMessage, MessageRole, ViewMode, DrawMode, DrawingSettings } from './types';
import { LiveServerMessage } from '@google/genai';

// Initial Template Code
const INITIAL_CODE = `
<div class="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-blue-50 p-6 text-center">
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

const LOCAL_STORAGE_KEY = 'architect_pages_v1';
const THEME_STORAGE_KEY = 'architect_theme_v1';

function App() {
  // State
  const [pages, setPages] = useState<AppPage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to load pages from storage:", e);
      }
    }
    return [{ id: 'home', name: 'Home', code: INITIAL_CODE }];
  });

  const [activePageId, setActivePageId] = useState(() => {
     if (typeof window !== 'undefined') {
       return 'home';
     }
     return 'home';
  });

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

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [drawMode, setDrawMode] = useState<DrawMode>(DrawMode.NONE);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: MessageRole.MODEL,
    text: "Hi! I'm Architect. Draw on the screen, use voice, or type to build."
  }]);
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

  const activePage = pages.find(p => p.id === activePageId) || pages[0];

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
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pages));
        setSaveStatus('saved');
      } catch (error) {
        console.error("Failed to save pages:", error);
        setSaveStatus('unsaved');
      }
    }, 2000); // Debounce save by 2 seconds

    return () => clearTimeout(timeoutId);
  }, [pages]);

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

  const handleSendMessage = async (text: string, image?: string) => {
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
         imageContext || 
         /change|update|add|remove|style|color|font|layout|button|header|footer|background/i.test(text);

      if (isCodeRequest) {
        const updatedCode = await generateUIUpdate(activePage.code, text, imageContext);
        setPages(prev => prev.map(p => p.id === activePageId ? { ...p, code: updatedCode } : p));
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
    const newId = `page-${Date.now()}`;
    const newPage: AppPage = {
      id: newId,
      name: `Page ${pages.length + 1}`,
      code: '<div class="p-10 text-center text-gray-400">New Page</div>'
    };
    setPages([...pages, newPage]);
    setActivePageId(newId);
    if (isMobile) setIsSidebarOpen(false);
  };

  const selectPage = (id: string) => {
    setActivePageId(id);
    if (isMobile) setIsSidebarOpen(false);
  };

  const deletePage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length <= 1) return;
    const newPages = pages.filter(p => p.id !== id);
    setPages(newPages);
    if (activePageId === id) setActivePageId(newPages[0].id);
  };

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
      >
        <div className="h-14 px-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 font-bold text-gray-800 dark:text-white whitespace-nowrap">
            <Layout className="text-blue-600" size={20} />
            <span>Architect.ai</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 -mr-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-1">
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

        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
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
               <span className="font-medium text-gray-700 dark:text-gray-200 leading-tight truncate">{activePage.name}</span>
               <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 whitespace-nowrap">
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
             {/* Theme Toggle */}
             <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
             {/* Device Frame (full-bleed on phones, where the real device is the frame) */}
             <div className="relative w-full max-w-[400px] h-full md:max-h-[850px] bg-white rounded-2xl md:rounded-[3rem] shadow-lg md:shadow-2xl border border-gray-200 md:border-[8px] md:border-gray-900 overflow-hidden md:ring-4 ring-gray-200/50 dark:ring-gray-700/50">
                {/* Notch */}
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-50"></div>

                {/* Actual App Content Container */}
                <div
                  ref={previewContainerRef}
                  className="w-full h-full overflow-y-auto overscroll-contain bg-white relative no-scrollbar"
                >
                  <div
                     className="w-full min-h-full"
                     dangerouslySetInnerHTML={{ __html: activePage.code }}
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
             <div className="sticky top-0 bg-[#1e1e1e] text-gray-400 text-xs px-4 py-2 border-b border-gray-800 font-mono">
               generated_output.html
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
    </div>
  );
}

export default App;
