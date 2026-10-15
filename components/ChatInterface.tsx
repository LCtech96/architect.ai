'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, PenTool, X, Mic, AudioLines, Volume2, Globe, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { ChatMessage, MessageRole } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, image?: string) => void;
  isLoading: boolean;
  onToggleDrawMode: () => void;
  isDrawMode: boolean;
  pendingImage?: string | null;
  onClearPendingImage: () => void;

  // Voice Props
  onStartLive: () => void;
  onStopLive: () => void;
  isLiveActive: boolean;
  onRecordStart: () => void;
  onRecordStop: () => void;
  isRecording: boolean;
  onSpeak: (text: string) => void;
  isPlayingAudio: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onToggleDrawMode,
  isDrawMode,
  pendingImage,
  onClearPendingImage,
  onStartLive,
  onStopLive,
  isLiveActive,
  onRecordStart,
  onRecordStop,
  isRecording,
  onSpeak,
  isPlayingAudio
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  // Mobile only: the chat is a bottom sheet that can be collapsed to just the composer
  const [isExpanded, setIsExpanded] = useState(false);
  const prevMessageCount = useRef(messages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    // Reveal the conversation on mobile when a new message arrives
    if (messages.length > prevMessageCount.current) setIsExpanded(true);
    prevMessageCount.current = messages.length;
    scrollToBottom();
  }, [messages]);

  // Hide the conversation while drawing so the preview stays visible
  useEffect(() => {
    if (isDrawMode) setIsExpanded(false);
  }, [isDrawMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !pendingImage && !uploadedImage) || isLoading) return;

    const imageToSend = pendingImage || uploadedImage;
    onSendMessage(inputText, imageToSend || undefined);

    setInputText('');
    setUploadedImage(null);
    onClearPendingImage();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Allow selecting the same file again
    e.target.value = '';
  };

  // Pointer events cover mouse and touch once, avoiding the double start iOS
  // produces when both touch and emulated mouse handlers are attached.
  const handleMicDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onRecordStart();
  };

  const handleMicUp = () => {
    if (isRecording) onRecordStop();
  };

  const activeImage = pendingImage || uploadedImage;
  const lastMessage = messages[messages.length - 1];

  return (
    <div className="flex flex-col w-full md:w-96 md:h-full shrink-0 bg-white/95 dark:bg-gray-800/95 md:bg-white/80 md:dark:bg-gray-800/90 backdrop-blur-xl border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] md:shadow-2xl z-30 transition-colors duration-300 rounded-t-2xl md:rounded-none">
      {/* Header */}
      <div className="px-4 py-2 [@media(max-height:500px)]:py-1 md:p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center gap-3">
        {/* Mobile: tapping the header toggles the sheet */}
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="md:hidden flex-1 min-w-0 flex items-center gap-2 text-left py-1"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse chat' : 'Expand chat'}
        >
          {isExpanded ? (
            <ChevronDown size={18} className="shrink-0 text-gray-400" />
          ) : (
            <ChevronUp size={18} className="shrink-0 text-gray-400" />
          )}
          <span className="min-w-0">
            <span className="block font-semibold text-sm text-gray-800 dark:text-gray-100">Architect Assistant</span>
            {!isExpanded && lastMessage && (
              <span className="block text-xs text-gray-500 dark:text-gray-400 truncate [@media(max-height:500px)]:hidden">
                {isLoading ? 'Thinking...' : lastMessage.text}
              </span>
            )}
          </span>
        </button>

        <div className="hidden md:block">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Architect Assistant</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini 3 Pro & 2.5 Flash</p>
        </div>

        {/* Live Mode Toggle */}
        <button
          onClick={isLiveActive ? onStopLive : onStartLive}
          className={`p-2.5 [@media(max-height:500px)]:p-1.5 md:p-2 rounded-full transition-all shrink-0 ${
            isLiveActive
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={isLiveActive ? "Stop Live Session" : "Start Live Session"}
          aria-label={isLiveActive ? "Stop Live Session" : "Start Live Session"}
        >
          <AudioLines size={18} />
        </button>
      </div>

      {/* Messages */}
      <div
        className={`${isExpanded ? 'block' : 'hidden'} md:block h-[40dvh] [@media(max-height:500px)]:h-[30dvh] md:h-auto md:flex-1 overflow-y-auto overscroll-contain p-4 space-y-4`}
      >
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm relative group break-words ${
                msg.role === MessageRole.USER
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-bl-none'
              }`}
            >
              {msg.image && (
                <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                  <img src={msg.image} alt="User upload" className="max-w-full h-auto" />
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Grounding/Search Sources */}
              {msg.grounding && msg.grounding.length > 0 && (
                 <div className="mt-3 pt-2 border-t border-gray-100/20">
                    <p className="text-[10px] font-semibold opacity-70 mb-1 flex items-center gap-1">
                      <Globe size={10} /> Sources
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {msg.grounding.map((g, idx) => (
                        <a
                          key={idx}
                          href={g.uri}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-[10px] underline opacity-80 hover:opacity-100 ${
                             msg.role === MessageRole.USER ? 'text-white' : 'text-blue-500 dark:text-blue-300'
                          }`}
                        >
                          {g.title || 'Source'}
                        </a>
                      ))}
                    </div>
                 </div>
              )}

              {/* Read Aloud Button (Footer for AI messages) */}
              {msg.role === MessageRole.MODEL && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-600 flex items-center">
                  <button
                    onClick={() => onSpeak(msg.text)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-600 px-2 py-1.5 -ml-2 rounded-md transition-colors"
                    title="Read Aloud"
                  >
                    <Volume2 size={14} />
                    <span>Read Aloud</span>
                  </button>
                </div>
              )}
            </div>
            {msg.role === MessageRole.MODEL && idx === messages.length -1 && isLoading && (
                <span className="text-xs text-gray-400 mt-1 ml-2">Thinking...</span>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-3 pt-2 md:p-4 safe-bottom bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        {activeImage && (
          <div className="relative mb-2 inline-block">
            <img src={activeImage} alt="Preview" className="h-16 md:h-20 w-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm" />
            <button
              onClick={() => {
                setUploadedImage(null);
                onClearPendingImage();
              }}
              className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
           <div className="flex items-center justify-between md:mb-2">
             <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
                <Button
                  type="button"
                  variant="ghost"
                  active={isDrawMode}
                  onClick={onToggleDrawMode}
                  title="Draw on Preview"
                  className="text-xs whitespace-nowrap !py-1.5 md:!py-2 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <PenTool size={16} className="mr-1" />
                  {isDrawMode ? 'Done' : 'Mark Up'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Image"
                  className="text-xs whitespace-nowrap !py-1.5 md:!py-2 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ImageIcon size={16} className="mr-1" />
                  Upload
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
             </div>
           </div>

          <div className="flex gap-2 relative">
            {/* text-base on mobile keeps iOS Safari from zooming in on focus */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe changes or ask a question..."
              enterKeyHint="send"
              autoComplete="off"
              className="flex-1 min-w-0 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-4 pr-11 py-3 text-base md:text-sm dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
            />

            {/* Mic Button inside input */}
            <button
              type="button"
              onPointerDown={handleMicDown}
              onPointerUp={handleMicUp}
              onPointerCancel={handleMicUp}
              onContextMenu={(e) => e.preventDefault()}
              className={`absolute right-[54px] top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors select-none touch-none ${
                isRecording ? 'text-red-500 bg-red-50' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Hold to Speak"
              aria-label="Hold to speak"
            >
              <Mic size={18} />
            </button>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || (!inputText && !activeImage)}
              className="h-[46px] w-[46px] shrink-0 !p-0 flex items-center justify-center rounded-xl dark:bg-gray-900 dark:hover:bg-black dark:text-white"
              aria-label="Send"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
