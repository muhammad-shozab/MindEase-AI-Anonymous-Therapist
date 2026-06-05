import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useApp } from '../context/AppContext';
import TherapistFactory from '../patterns/TherapistFactory';
import RealAIService from '../services/RealAIService';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import PanicButton from '../components/PanicButton';
import { Message } from '../services/GeminiService';
import GoogleDriveService from '../services/GoogleDriveService';
import {
  googleDriveLoginOptions,
  getConfiguredDriveFolderEmail,
  hasGoogleDriveClientId,
} from '../config/googleDrive';
import { ArrowLeft, Sun, Moon, Shield, Lock, UserX, Cloud, Download, Menu, X, CheckCircle2, Sparkles, Volume2, VolumeX } from 'lucide-react';

const Chat = () => {
  const { therapistType } = useParams<{ therapistType: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showImportSuccessBanner, setShowImportSuccessBanner] = useState(
    () => Boolean((location.state as { chatImported?: boolean } | null)?.chatImported)
  );
  const { currentSession, startNewSession, addMessage, toggleDarkMode, darkMode, buildSessionExportPayload, setPanicMode } = useApp();

  const [therapist] = useState(() => {
    try {
      return TherapistFactory.create(therapistType || 'support');
    } catch {
      navigate('/dashboard');
      return TherapistFactory.create('support');
    }
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnonymousInfo, setShowAnonymousInfo] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const configuredDriveEmail = getConfiguredDriveFolderEmail();
  const [exportEmail, setExportEmail] = useState(configuredDriveEmail ?? '');
  const [sendingExport, setSendingExport] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportStatusType, setExportStatusType] = useState<'success' | 'error' | null>(null);
  const [showOptionsSidebar, setShowOptionsSidebar] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('mindeaseVoiceReplies') === 'true');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [activeSpeechKey, setActiveSpeechKey] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingDriveExportRef = useRef<{ email: string; payload: string } | null>(null);
  const aiService = RealAIService.getInstance();
  const drive = GoogleDriveService.getInstance();
  const hasGoogleOAuth = hasGoogleDriveClientId();

  const resolveDriveFolderEmail = (): string | null => {
    const email = exportEmail.trim().toLowerCase();
    if (!email) {
      return null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return null;
    }
    return email;
  };

  const saveExportPayloadToDrive = async (email: string, payload: string) => {
    const { fileName, folderName } = await drive.uploadExportText(email, payload);
    setExportStatus(`Saved ${fileName} to Google Drive → MindEase_Sessions/${folderName}`);
    setExportStatusType('success');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        drive.setAccessToken(tokenResponse.access_token);
        const pendingExport = pendingDriveExportRef.current;
        if (!pendingExport) {
          return;
        }
        pendingDriveExportRef.current = null;
        await saveExportPayloadToDrive(pendingExport.email, pendingExport.payload);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to save export to Google Drive';
        setExportStatus(message);
        setExportStatusType('error');
      } finally {
        setSendingExport(false);
      }
    },
    onError: () => {
      pendingDriveExportRef.current = null;
      setSendingExport(false);
      setExportStatus('Google sign-in was cancelled. Your chat was not saved to Drive.');
      setExportStatusType('error');
    },
    ...googleDriveLoginOptions,
  });

  const beginDriveUpload = (email: string, payload: string) => {
    pendingDriveExportRef.current = { email, payload };
    setExportStatus('Opening Google sign-in, then saving to your Drive…');
    setExportStatusType('success');
    googleLogin();
  };

  useEffect(() => {
    // Drop cached tokens from older Drive scopes so Save to Drive re-prompts Google.
    drive.isAuthenticated();
  }, []);

  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    setSpeechSupported(supported);

    if (supported) {
      const chooseAssistantVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
        const preferredNames = [
          'samantha',
          'karen',
          'victoria',
          'moira',
          'google us english',
          'microsoft jenny',
          'microsoft aria',
          'microsoft zira',
          'zira',
          'female',
        ];

        const voice =
          preferredNames
            .map((name) => englishVoices.find((candidate) => candidate.name.toLowerCase().includes(name)))
            .find(Boolean) ??
          englishVoices.find((candidate) => candidate.localService) ??
          englishVoices[0] ??
          voices[0] ??
          null;

        setSelectedVoice(voice);
      };

      chooseAssistantVoice();
      window.speechSynthesis.onvoiceschanged = chooseAssistantVoice;
    }

    return () => {
      if (supported) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
        setActiveSpeechKey(null);
      }
    };
  }, []);

  useEffect(() => {
    if (!currentSession || currentSession.therapistType !== therapistType) {
      if (therapistType) {
        startNewSession(therapistType);
      }
    }
  }, [therapistType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const isEmergencyIntent = (text: string): boolean => {
    const normalized = text.toLowerCase();
    const triggers = [
      'i wanna commit suicide',
      'i want to commit suicide',
      'commit suicide',
      'kill myself',
      'end my life',
      'want to die',
      'wanna die',
      'i should die',
      'suicidal',
      'self harm',
      'self-harm',
    ];
    return triggers.some((phrase) => normalized.includes(phrase));
  };

  const speakText = (text: string, force = false, speechKey?: string) => {
    if (!speechSupported || (!voiceEnabled && !force)) {
      return;
    }

    if (speechKey && activeSpeechKey === speechKey) {
      window.speechSynthesis.cancel();
      setActiveSpeechKey(null);
      return;
    }

    window.speechSynthesis.cancel();
    setActiveSpeechKey(speechKey ?? null);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang ?? 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.08;
    utterance.volume = 1;
    utterance.onend = () => {
      if (speechKey) {
        setActiveSpeechKey((currentKey) => (currentKey === speechKey ? null : currentKey));
      }
    };
    utterance.onerror = () => {
      if (speechKey) {
        setActiveSpeechKey((currentKey) => (currentKey === speechKey ? null : currentKey));
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceReplies = () => {
    const nextEnabled = !voiceEnabled;
    setVoiceEnabled(nextEnabled);
    localStorage.setItem('mindeaseVoiceReplies', String(nextEnabled));

    if (!speechSupported) {
      return;
    }

    if (nextEnabled) {
      speakText('Voice replies are on. I will read therapist responses aloud.', true);
    } else {
      window.speechSynthesis.cancel();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || !currentSession) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInput('');
    setIsTyping(true);
    setError(null);

    if (isEmergencyIntent(userMessage.content)) {
      setPanicMode(true);
      setIsTyping(false);
      return;
    }

    try {
      const response = await aiService.chat([
        ...currentSession.messages,
        userMessage,
      ], therapist.prompt);

      const aiMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      addMessage(aiMessage);
      speakText(response);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get AI response. Please try again.');

      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I encountered an error. I'm here to listen. Please tell me more.",
        timestamp: Date.now(),
      };

      addMessage(errorMessage);
      speakText(errorMessage.content);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const saveToDrive = () => {
    void sendExportToDrive();
  };

  const downloadExportFile = () => {
    try {
      const payload = buildSessionExportPayload();
      const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindease-export-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus('Export file downloaded. You can email this file or paste its content in Import Exported Chat.');
      setExportStatusType('success');
    } catch (err: any) {
      setExportStatus(err.message || 'Failed to generate export file');
      setExportStatusType('error');
    }
  };

  const sendExportToDrive = async () => {
    try {
      setExportStatus(null);
      setExportStatusType(null);

      if (!hasGoogleOAuth) {
        setExportStatus('Add VITE_GOOGLE_CLIENT_ID to .env and restart the dev server.');
        setExportStatusType('error');
        return;
      }

      const email = resolveDriveFolderEmail();
      if (!email) {
        setExportStatus('Enter your Gmail — the folder MindEase_Sessions/your-email will be created in the Google account you sign in with.');
        setExportStatusType('error');
        return;
      }

      const payload = buildSessionExportPayload();
      setSendingExport(true);
      setExportStatus('Saving to Google Drive…');
      setExportStatusType('success');

      if (!drive.isAuthenticated()) {
        beginDriveUpload(email, payload);
        return;
      }

      await saveExportPayloadToDrive(email, payload);
      setSendingExport(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save to Google Drive';
      if (message.includes('Not authenticated')) {
        const retryEmail = resolveDriveFolderEmail();
        if (retryEmail) {
          beginDriveUpload(retryEmail, buildSessionExportPayload());
          return;
        }
      }
      if (drive.isInsufficientScopeError(message)) {
        drive.signOut();
        const retryEmail = resolveDriveFolderEmail();
        if (retryEmail) {
          setExportStatus('Drive permission expired. Opening Google sign-in again…');
          setExportStatusType('success');
          beginDriveUpload(retryEmail, buildSessionExportPayload());
          return;
        }
      }
      if (message.includes('Failed to fetch')) {
        setExportStatus('Could not reach Google Drive. Check your internet connection.');
      } else {
        setExportStatus(message);
      }
      setExportStatusType('error');
      setSendingExport(false);
    }
  };

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-violet-950 dark:to-fuchsia-950 flex flex-col text-slate-800 dark:text-slate-100">
      <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-purple-200/80 dark:border-violet-400/25 px-3 py-3 sm:p-4 sticky top-0 z-30 shadow-[0_8px_30px_rgba(0,0,0,0.22)]">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-4 w-full">
            <div className="flex items-center gap-2 sm:gap-3 justify-self-start min-w-0">
              <button
                onClick={() => setShowOptionsSidebar(true)}
                className="bg-white/70 dark:bg-slate-800/75 hover:bg-white/90 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 p-2 sm:px-3 sm:py-2 rounded-xl transition-colors text-sm flex items-center gap-2 border border-purple-200/90 dark:border-violet-400/30"
                title="Open options"
                aria-label="Open options"
              >
                <Menu size={18} />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors flex items-center gap-1.5 sm:gap-2 p-2 sm:p-0 -ml-1 sm:ml-0"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            <div className="min-w-0 px-1">
              <h1 className="text-slate-800 dark:text-slate-100 font-bold text-base sm:text-lg text-center tracking-tight truncate">{therapist.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-sm text-center truncate">{therapist.specialty}</p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 justify-self-end">
              <button
                onClick={toggleDarkMode}
                className="bg-white/70 dark:bg-slate-800/75 hover:bg-white/90 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 p-2 rounded-xl transition-colors border border-purple-200/90 dark:border-violet-400/30"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                type="button"
                onClick={toggleVoiceReplies}
                disabled={!speechSupported}
                className={`
                  p-2 rounded-xl transition-all border
                  ${voiceEnabled
                    ? 'bg-gradient-to-r from-emerald-200 to-cyan-200 text-emerald-900 border-emerald-200 shadow-[0_8px_22px_rgba(16,185,129,0.22)] dark:from-emerald-400/25 dark:to-cyan-400/25 dark:text-emerald-100 dark:border-emerald-400/35'
                    : 'bg-white/70 dark:bg-slate-800/75 hover:bg-white/90 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border-purple-200/90 dark:border-violet-400/30'
                  }
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
                aria-label={voiceEnabled ? 'Turn off automatic voice replies' : 'Turn on automatic voice replies'}
                aria-pressed={voiceEnabled}
                title={speechSupported ? 'Automatic voice replies' : 'Voice replies are not supported in this browser'}
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={() => {
                  setShowExportMenu((prev) => !prev);
                  setError(null);
                }}
                className="bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 text-slate-900 p-2 sm:px-3 sm:py-2 rounded-xl transition-colors text-sm flex items-center gap-2 shadow-[0_8px_22px_rgba(14,165,233,0.24)]"
                title="Save this chat to Google Drive"
                aria-label="Save chat"
              >
                <Cloud size={16} />
                <span className="hidden sm:inline">Save to Drive</span>
              </button>
            </div>
          </div>
        </div>

        {showExportMenu && (
          <div className="max-w-4xl mx-auto mt-3 rounded-2xl border border-purple-200/90 dark:border-violet-400/30 bg-white/85 dark:bg-slate-900/80 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.24)]">
            <p className="text-slate-600 dark:text-purple-200/90 text-xs mb-2">
              Enter your Gmail for the Drive folder name. When Google opens, sign in with that same account. File path: MindEase_Sessions / your-email / export.txt
            </p>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="email"
                value={exportEmail}
                onChange={(e) => {
                  setExportEmail(e.target.value);
                  setError(null);
                  setExportStatus(null);
                  setExportStatusType(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!sendingExport) {
                      void sendExportToDrive();
                    }
                  }
                }}
                placeholder={configuredDriveEmail ?? 'you@gmail.com'}
                className="flex-1 px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-violet-400/30 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-purple-200/40 focus:outline-none focus:border-cyan-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-cyan-400/20 dark:focus:ring-purple-500/20 text-sm"
              />
              <div className="grid grid-cols-1 min-[380px]:grid-cols-3 md:flex gap-2">
                <button
                  type="button"
                  onClick={saveToDrive}
                  disabled={sendingExport}
                  className="bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-500 text-slate-900 px-3 py-2 rounded-lg text-sm font-medium shadow-[0_8px_22px_rgba(14,165,233,0.18)] disabled:shadow-none whitespace-nowrap"
                >
                  {sendingExport ? 'Saving…' : 'Save to Drive'}
                </button>
                <button
                  type="button"
                  onClick={downloadExportFile}
                  className="bg-white/85 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-100 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-violet-400/30 shadow-sm whitespace-nowrap"
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportMenu(false)}
                  className="bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-zinc-200 px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {exportStatus && (
          <div className={`max-w-4xl mx-auto mt-3 text-sm rounded-xl p-2 border ${
            exportStatusType === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}>
            {exportStatus}
          </div>
        )}

        <div className="max-w-4xl mx-auto mt-4 hidden sm:grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 p-3 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <UserX size={14} className="text-cyan-400" />
            <span>No name, email, or phone required</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAnonymousInfo((prev) => !prev)}
            className="rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 p-3 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 text-left hover:border-purple-500/50 hover:bg-white/60 dark:hover:bg-slate-800/70 transition-colors"
            title="Show anonymous mode details"
          >
            <Shield size={14} className="text-cyan-400" />
            <span>100% anonymous conversation mode</span>
          </button>
          <div className="rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 p-3 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Lock size={14} className="text-cyan-400" />
            <span>Session restore requires exported chat payload</span>
          </div>
        </div>

        {showAnonymousInfo && (
          <div className="max-w-4xl mx-auto mt-3 rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-purple-950/40 p-3">
            <p className="text-purple-100/95 text-sm">
              Anonymous mode means you can chat without account signup, and session access is controlled by your recovery code.
            </p>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mt-4 bg-red-950 border border-red-800 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4 sm:p-4">
        <div className="max-w-4xl mx-auto pb-2">
          {showImportSuccessBanner && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-300/80 dark:border-emerald-500/40 bg-gradient-to-r from-emerald-50/95 to-cyan-50/80 dark:from-emerald-950/40 dark:to-violet-950/30 px-4 py-3 shadow-sm">
              <CheckCircle2 size={22} className="text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Chat imported successfully</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Your previous messages are loaded. You can continue the conversation below.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportSuccessBanner(false)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 shrink-0"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {(!currentSession?.messages || currentSession.messages.length === 0) && (
            <div className="min-h-full flex items-center justify-center px-1 py-5 sm:py-12">
              <div className="w-full max-w-md rounded-[2rem] border border-white/45 dark:border-violet-300/20 bg-white/55 dark:bg-slate-950/28 p-5 sm:p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-slate-950 shadow-[0_14px_35px_rgba(34,211,238,0.28)]">
                  <Sparkles size={26} />
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500 dark:text-cyan-300">
                  Anonymous chat
                </p>
                <h2 className="mb-3 text-2xl sm:text-3xl font-bold leading-tight text-slate-900 dark:text-white">
                  What’s on your mind?
                </h2>
                <p className="mx-auto mb-5 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {therapist.name} is here for {therapist.specialty.toLowerCase()}. No signup or identity details needed.
                </p>
                <div className="grid gap-2 text-left">
                  {[
                    'I feel overwhelmed today',
                    'Help me calm my thoughts',
                    'I need someone to listen',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="rounded-2xl border border-purple-200/80 bg-white/65 px-4 py-3 text-sm text-slate-700 shadow-sm transition-colors hover:bg-white dark:border-violet-400/25 dark:bg-slate-900/55 dark:text-slate-200 dark:hover:bg-slate-800/70"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
                  If you feel unsafe, tap the red help button.
                </p>
              </div>
            </div>
          )}

          {currentSession?.messages.map((msg, index) => {
            const speechKey = `${msg.timestamp}-${index}`;

            return (
              <ChatBubble
                key={speechKey}
                message={msg}
                onSpeak={(text) => speakText(text, true, speechKey)}
                speechAvailable={speechSupported}
                isSpeaking={activeSpeechKey === speechKey}
              />
            );
          })}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white/75 dark:bg-slate-900/75 border-t border-purple-200/80 dark:border-violet-400/25 px-3 py-3 sm:p-4 backdrop-blur-md pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-2 text-center sm:text-left">
            Anonymous mode is active. Avoid sharing real names, numbers, or addresses.
          </p>
          <div className="flex items-end gap-2 sm:gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message privately..."
              className="
                flex-1 min-h-12 max-h-32 px-3 py-3 sm:px-4 rounded-2xl
                bg-white/70 dark:bg-slate-900/60 border border-purple-200/90 dark:border-violet-400/30
                text-slate-800 dark:text-slate-100 placeholder-purple-200/35
                focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                caret-purple-300
                transition-colors resize-none text-sm sm:text-base
              "
              rows={1}
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="
                bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300
                disabled:bg-zinc-700 disabled:cursor-not-allowed
                text-slate-900 font-semibold px-4 sm:px-8 py-3 rounded-2xl
                transition-colors self-end shadow-[0_10px_26px_rgba(14,165,233,0.24)] min-w-16 sm:min-w-24
              "
            >
              {isTyping ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      <PanicButton />

      {showOptionsSidebar && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/55 backdrop-blur-sm z-40"
            onClick={() => setShowOptionsSidebar(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-[min(100vw,24rem)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-purple-200/90 dark:border-violet-400/30 z-50 p-4 sm:p-5 overflow-y-auto shadow-[12px_0_32px_rgba(0,0,0,0.36)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-800 dark:text-slate-100 text-lg font-bold">Support Options</h3>
              <button
                onClick={() => setShowOptionsSidebar(false)}
                className="bg-white/60 dark:bg-slate-800/70 hover:bg-white/85 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-purple-200/90 dark:border-violet-400/30"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <button
                onClick={() => {
                  window.open('https://www.therapyroute.com/therapists/pakistan/islamabad', '_blank', 'noopener,noreferrer');
                  setShowOptionsSidebar(false);
                }}
                className="w-full text-left rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:-translate-y-0.5 hover:shadow-lg p-4 text-slate-800 dark:text-slate-100 transition-all duration-200"
              >
                Hire Professional
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Find a licensed therapist or counselor near you.</p>
              </button>
              <button
                onClick={() => {
                  window.open('https://www.paltuu.pk/', '_blank', 'noopener,noreferrer');
                  setShowOptionsSidebar(false);
                }}
                className="w-full text-left rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:-translate-y-0.5 hover:shadow-lg p-4 text-slate-800 dark:text-slate-100 transition-all duration-200"
              >
                Adopt a Pet
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Explore pet companionship for emotional support.</p>
              </button>
              <button
                onClick={() => {
                  window.open('https://poki.com/', '_blank', 'noopener,noreferrer');
                  setShowOptionsSidebar(false);
                }}
                className="w-full text-left rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:-translate-y-0.5 hover:shadow-lg p-4 text-slate-800 dark:text-slate-100 transition-all duration-200"
              >
                Play Games
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Use calming or focus games to ease stress.</p>
              </button>
              <button
                onClick={() => {
                  window.open('https://www.alltrails.com/pakistan/federal-capital-territory/islamabad', '_blank', 'noopener,noreferrer');
                  setShowOptionsSidebar(false);
                }}
                className="w-full text-left rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:-translate-y-0.5 hover:shadow-lg p-4 text-slate-800 dark:text-slate-100 transition-all duration-200"
              >
                Go for a Walk
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">A short walk can reduce mental load quickly.</p>
              </button>
              <button
                onClick={() => {
                  window.open('https://www.twitch.tv/', '_blank', 'noopener,noreferrer');
                  setShowOptionsSidebar(false);
                }}
                className="w-full text-left rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:-translate-y-0.5 hover:shadow-lg p-4 text-slate-800 dark:text-slate-100 transition-all duration-200"
              >
                Call a Friend
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Connect with someone live and feel less alone.</p>
              </button>
              <div
                aria-label="Advertisement placement"
                className="min-h-40 flex-1 rounded-xl border border-dashed border-cyan-300/80 dark:border-cyan-400/30 bg-cyan-50/35 dark:bg-slate-900/35"
              />
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default Chat;


