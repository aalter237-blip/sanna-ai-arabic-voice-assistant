export type ArabicDialect = 'auto' | 'saudi' | 'egyptian' | 'levantine' | 'maghrebi' | 'msa';

export type OperatingMode = 'online' | 'offline';

export type AppScreen = 'home' | 'whatsapp' | 'whatsapp_chat' | 'settings' | 'clock' | 'camera' | 'screen_reader' | 'bank_app';

export interface AccessibilityNode {
  id: string;
  viewId?: string;
  className: string;
  text?: string;
  contentDescription?: string;
  isClickable: boolean;
  isScrollable?: boolean;
  bounds: { x: number; y: number; width: number; height: number };
  children?: AccessibilityNode[];
}

export interface ToolStep {
  step_number?: number;
  tool: string;
  action: string;
  target?: string;
  value?: string | number | boolean;
  recipient?: string;
  message?: string;
  time?: string;
  label?: string;
  description?: string;
  status?: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface AgentResponse {
  source: string;
  speech: string;
  dialect_detected?: ArabicDialect;
  intent?: string;
  steps: ToolStep[];
  latency_ms?: number;
  error_note?: string;
}

export interface ExecutionLogItem {
  id: string;
  timestamp: string;
  phase: 'WAKE_WORD' | 'STT_INPUT' | 'LLM_INFERENCE' | 'TOOL_PARSER' | 'ACCESSIBILITY_BRIDGE' | 'TTS_OUTPUT';
  title: string;
  details: string;
  payload?: any;
  status: 'info' | 'success' | 'warning' | 'error';
}

export interface WhatsAppMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOutgoing: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface WhatsAppChat {
  id: string;
  name: string;
  avatarColor: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: WhatsAppMessage[];
}

export interface CodeFile {
  path: string;
  name: string;
  category: 'config' | 'audio' | 'agent' | 'tools' | 'native' | 'root';
  language: 'typescript' | 'javascript' | 'json' | 'kotlin' | 'xml' | 'groovy' | 'markdown' | 'yaml' | 'properties';
  content: string;
  description: string;
}
