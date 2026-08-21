import { registerPlugin } from '@capacitor/core';

export interface VoiceAgentPlugin {
  tap(options: { x: number; y: number }): Promise<void>;
  swipe(options: { x1: number; y1: number; x2: number; y2: number; duration?: number }): Promise<void>;
  clickByText(options: { text: string }): Promise<void>;
  isServiceEnabled(): Promise<{ enabled: boolean }>;
}

export const VoiceAgent = registerPlugin<VoiceAgentPlugin>('VoiceAgent');
export default VoiceAgent;
