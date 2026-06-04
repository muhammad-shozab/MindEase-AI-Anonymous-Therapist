// Storage Service - Handles local storage and session management
import EncryptionService from './EncryptionService';
import { Message } from './GeminiService';

export interface Session {
  id: string;
  therapistType: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

class StorageService {
  private static instance: StorageService;
  private encryption = EncryptionService.getInstance();

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Session ID Management
  getCurrentSessionId(): string | null {
    return localStorage.getItem('currentSessionId');
  }

  setCurrentSessionId(sessionId: string): void {
    localStorage.setItem('currentSessionId', sessionId);
  }

  clearCurrentSessionId(): void {
    localStorage.removeItem('currentSessionId');
  }

  // Session Management
  saveSession(session: Session): void {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) {
      throw new Error('No active session ID');
    }

    const key = this.encryption.deriveKey(sessionId);
    const sessionData = JSON.stringify(session);
    const encrypted = this.encryption.encrypt(sessionData, key);

    localStorage.setItem(`session_${sessionId}`, encrypted);
  }

  loadSession(sessionId: string): Session | null {
    try {
      const encrypted = localStorage.getItem(`session_${sessionId}`);
      if (!encrypted) {
        return null;
      }

      const key = this.encryption.deriveKey(sessionId);
      const decrypted = this.encryption.decrypt(encrypted, key);
      return JSON.parse(decrypted) as Session;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  getAllSessionIds(): string[] {
    const sessions: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('session_')) {
        sessions.push(key.replace('session_', ''));
      }
    }
    return sessions;
  }

  deleteSession(sessionId: string): void {
    localStorage.removeItem(`session_${sessionId}`);
  }

  // Mood Tracking
  saveMood(mood: string): void {
    const today = new Date().toISOString().split('T')[0];
    const moods = this.getMoodHistory();
    moods[today] = mood;
    localStorage.setItem('moodHistory', JSON.stringify(moods));
  }

  getMoodHistory(): Record<string, string> {
    const data = localStorage.getItem('moodHistory');
    return data ? JSON.parse(data) : {};
  }
}

export default StorageService;
