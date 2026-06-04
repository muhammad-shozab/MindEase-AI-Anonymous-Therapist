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
import { ArrowLeft, Sun, Moon, Shield, Lock, UserX, Cloud, Download, Menu, X, CheckCircle2 } from 'lucide-react';

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
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get AI response. Please try again.');

      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I encountered an error. I'm here to listen. Please tell me more.",
        timestamp: Date.now(),
      };

      addMessage(errorMessage);
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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-violet-950 dark:to-fuchsia-950 flex flex-col text-slate-800 dark:text-slate-100">
      <header className="bg-white/65 dark:bg-slate-900/65 backdrop-blur-sm border-b border-purple-200/80 dark:border-violet-400/25 p-2 sm:p-3 md:p-4 sticky top-0 z-30 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="w-full px-1 sm:px-2 md:px-3">
          <div className="grid grid-cols-3 items-center w-full gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 justify-self-start min-w-0">
              <button
                onClick={() => setShowOptionsSidebar(true)}
                className="bg-white/60 dark:bg-slate-800/70 hover:bg-white/85 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 px-2 sm:px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border border-purple-200/90 dark:border-violet-400/30 flex-shrink-0"
                title="Open options"
              >
                <Menu size={16} sm:size={18} />
                <span className="hidden sm:inline">Menu</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0"
              >
                <ArrowLeft size={18} sm:size={20} />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            <div>
              <h1 className="text-slate-800 dark:text-slate-100 font-bold text-lg text-center tracking-tight">{therapist.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center">{therapist.specialty}</p>
            </div>

            <div className="flex items-center gap-2 justify-self-end">
              <button
                onClick={toggleDarkMode}
                className="bg-white/60 dark:bg-slate-800/70 hover:bg-white/85 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 p-2 rounded-lg transition-colors border border-purple-200/90 dark:border-violet-400/30"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => {
                  setShowExportMenu((prev) => !prev);
                  setError(null);
                }}
                className="bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 text-slate-900 px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 shadow-[0_8px_22px_rgba(14,165,233,0.24)]"
                title="Save this chat to Google Drive"
              >
                <Cloud size={16} />
                Save to Drive
              </button>
            </div>
          </div>
        </div>

        {showExportMenu && (
          <div className="max-w-4xl mx-auto mt-3 rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/75 dark:bg-slate-900/70 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveToDrive}
                  disabled={sendingExport}
                  className="bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-500 text-slate-900 px-3 py-2 rounded-lg text-sm font-medium shadow-[0_8px_22px_rgba(14,165,233,0.18)] disabled:shadow-none"
                >
                  {sendingExport ? 'Saving…' : 'Save to Drive'}
                </button>
                <button
                  type="button"
                  onClick={downloadExportFile}
                  className="bg-white/85 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-100 px-3 py-2 rounded-lg text-sm flex items-center gap-2 border border-slate-200 dark:border-violet-400/30 shadow-sm"
                >
                  <Download size={14} />
                  Download File
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

        <div className="max-w-4xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
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

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
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
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{therapist.name}</div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Private Chat with {therapist.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{therapist.specialty}</p>
              <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                You are in 100% anonymous mode. Share freely, no identity details are needed.
              </p>
            </div>
          )}

          {currentSession?.messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white/65 dark:bg-slate-900/65 border-t border-purple-200/80 dark:border-violet-400/25 p-4 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Anonymous mode is active. Avoid sharing real names, numbers, or addresses.
          </p>
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write your message privately... (Enter to send)"
              className="
                flex-1 px-4 py-3 rounded-xl
                bg-white/70 dark:bg-slate-900/60 border border-purple-200/90 dark:border-violet-400/30
                text-slate-800 dark:text-slate-100 placeholder-purple-200/35
                focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                caret-purple-300
                transition-colors resize-none
              "
              rows={3}
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="
                bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300
                disabled:bg-zinc-700 disabled:cursor-not-allowed
                text-slate-900 font-semibold px-8 py-3 rounded-xl
                transition-colors self-end shadow-[0_10px_26px_rgba(14,165,233,0.24)]
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
            className="fixed inset-0 bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-violet-950 dark:to-fuchsia-950/60 z-40"
            onClick={() => setShowOptionsSidebar(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-full max-w-sm bg-white/75 dark:bg-slate-900/70 border-r border-purple-200/90 dark:border-violet-400/30 z-50 p-5 overflow-y-auto shadow-[12px_0_32px_rgba(0,0,0,0.45)] flex flex-col">
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


