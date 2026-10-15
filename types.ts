
export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

// A web source cited by a search-grounded answer
export interface GroundingMetadata {
  uri: string;
  title?: string;
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

export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

export interface Project {
  id: string;
  name: string;
  pages: AppPage[];
  createdAt: number;
  updatedAt: number;
  viewedAt: number;
}
