
export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface GroundingMetadata {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  image?: string; // base64
  grounding?: GroundingMetadata[];
  isThinking?: boolean;
}

export interface AppPage {
  id: string;
  name: string;
  code: string; // The HTML/Tailwind code for this page
}

export interface ProjectState {
  pages: AppPage[];
  activePageId: string;
  isSidebarOpen: boolean;
}

export enum ViewMode {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE',
  SPLIT = 'SPLIT'
}

export enum DrawMode {
  NONE = 'NONE',
  DRAWING = 'DRAWING'
}

export type DrawingToolType = 'pen' | 'marker' | 'eraser';

export interface DrawingSettings {
  tool: DrawingToolType;
  color: string;
  width: number;
}
