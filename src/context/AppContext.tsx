// Observer Pattern - React Context for global state management
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import StorageService from '../services/StorageService';
import EncryptionService from '../services/EncryptionService';
import { Session } from '../services/StorageService';
import { Message } from '../services/GeminiService';

interface AppContextType {
  // Session
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  sessionId: string | null;
  startNewSession: (therapistType: string) => string;
  loadSession: (sessionId: string) => boolean;
  importSessionFromExport: (exportPayload: string) => boolean;
  buildSessionExportPayload: () => string;
  
  // Messages
  addMessage: (message: Message) => void;
  
  // UI State
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Panic Mode
  panicMode: boolean;
  setPanicMode: (active: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const storage = StorageService.getInstance();
  const encryption = EncryptionService.getInstance();

  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [panicMode, setPanicMode] = useState(false);

  // Load session on mount
  useEffect(() => {
    const savedSessionId = storage.getCurrentSessionId();
    if (savedSessionId) {
      const session = storage.loadSession(savedSessionId);
      if (session) {
        setCurrentSession(session);
        setSessionId(savedSessionId);
      }
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const startNewSession = (therapistType: string): string => {
    const newSessionId = encryption.generateSessionId();
    const newSession: Session = {
      id: newSessionId,
      therapistType,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSessionId(newSessionId);
    setCurrentSession(newSession);
    storage.setCurrentSessionId(newSessionId);
    storage.saveSession(newSession);

    return newSessionId;
  };

  const loadSession = (recoveryCode: string): boolean => {
    try {
      const session = storage.loadSession(recoveryCode);
      if (session) {
        setSessionId(recoveryCode);
        setCurrentSession(session);
        storage.setCurrentSessionId(recoveryCode);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load session:', error);
      return false;
    }
  };

  const buildSessionExportPayload = (): string => {
    if (!currentSession || !sessionId) {
      throw new Error('No active session to export');
    }

    const exportData = {
      version: 1,
      exportedAt: Date.now(),
      sessionId,
      session: currentSession,
    };

    return `MINDEASE_EXPORT_V1::${btoa(unescape(encodeURIComponent(JSON.stringify(exportData))))}`;
  };

  const importSessionFromExport = (exportPayload: string): boolean => {
    try {
      const raw = exportPayload.trim();
      const prefix = 'MINDEASE_EXPORT_V1::';
      let parsed: any;

      if (raw.startsWith(prefix)) {
        const encoded = raw.slice(prefix.length);
        const decoded = decodeURIComponent(escape(atob(encoded)));
        parsed = JSON.parse(decoded);
      } else {
        // Accept raw JSON export payloads as well.
        parsed = JSON.parse(raw);
      }

      const importedSession = parsed?.session as Session | undefined;
      const importedSessionId = parsed?.sessionId as string | undefined;

      if (!importedSession || !importedSessionId) {
        return false;
      }

      const normalizedSession: Session = {
        ...importedSession,
        id: importedSessionId,
        updatedAt: Date.now(),
      };

      setSessionId(importedSessionId);
      setCurrentSession(normalizedSession);
      storage.setCurrentSessionId(importedSessionId);
      storage.saveSession(normalizedSession);
      return true;
    } catch (error) {
      console.error('Failed to import session export:', error);
      return false;
    }
  };

  const addMessage = (message: Message) => {
    if (!sessionId) {
      throw new Error('No active session');
    }

    setCurrentSession((prevSession) => {
      if (!prevSession) {
        throw new Error('No active session');
      }

      const updatedSession = {
        ...prevSession,
        messages: [...prevSession.messages, message],
        updatedAt: Date.now(),
      };

      storage.saveSession(updatedSession);
      return updatedSession;
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        currentSession,
        setCurrentSession,
        sessionId,
        startNewSession,
        loadSession,
        importSessionFromExport,
        buildSessionExportPayload,
        addMessage,
        darkMode,
        toggleDarkMode,
        panicMode,
        setPanicMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
