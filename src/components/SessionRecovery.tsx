import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FileUp, Upload, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import TherapistFactory from '../patterns/TherapistFactory';

type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

const SessionRecovery = () => {
  const [exportPayload, setExportPayload] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [importedTherapistType, setImportedTherapistType] = useState('support');
  const [importedMessageCount, setImportedMessageCount] = useState(0);
  const { importSessionFromExport } = useApp();
  const navigate = useNavigate();

  const resetForm = () => {
    setExportPayload('');
    setError('');
    setStatus('idle');
    setImportedTherapistType('support');
    setImportedMessageCount(0);
  };

  const handleRecover = async () => {
    const payload = exportPayload.trim();

    if (!payload) {
      setError('Please paste the exported chat file content');
      setStatus('error');
      return;
    }

    if (!payload.startsWith('MINDEASE_EXPORT_V1::')) {
      setError('Invalid export format. Paste the full exported chat content.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      let therapistType = 'support';
      let messageCount = 0;
      try {
        const prefix = 'MINDEASE_EXPORT_V1::';
        const parsed = payload.startsWith(prefix)
          ? JSON.parse(decodeURIComponent(escape(atob(payload.slice(prefix.length)))))
          : JSON.parse(payload);
        therapistType = parsed?.session?.therapistType || 'support';
        messageCount = Array.isArray(parsed?.session?.messages) ? parsed.session.messages.length : 0;
      } catch {
        // Parser errors are handled by importSessionFromExport below.
      }

      const success = importSessionFromExport(payload);
      if (success) {
        setImportedTherapistType(therapistType);
        setImportedMessageCount(messageCount);
        setStatus('success');
      } else {
        setStatus('error');
        setError('Import failed. Please paste a valid exported chat file.');
      }
    } catch (err: unknown) {
      console.error('Import error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to import session. Please verify pasted content.');
    }
  };

  const openImportedChat = () => {
    navigate(`/chat/${importedTherapistType}`, { state: { chatImported: true } });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && status !== 'loading' && status !== 'success') {
      handleRecover();
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setExportPayload(text);
      setError('');
      setStatus('idle');
    } catch (err: unknown) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to read export file');
    }
  };

  const therapist = (() => {
    try {
      return TherapistFactory.create(importedTherapistType);
    } catch {
      return TherapistFactory.create('support');
    }
  })();

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-200 dark:border-violet-400/30 shadow-[0_8px_30px_rgba(139,92,246,0.12)]">
      <div className="flex items-center gap-2 mb-4">
        <FileUp size={20} className="text-violet-400" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Import Exported Chat
        </h3>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-2xl border border-emerald-300/80 dark:border-emerald-500/40 bg-gradient-to-br from-emerald-50/95 via-white/90 to-cyan-50/80 dark:from-emerald-950/50 dark:via-slate-900/80 dark:to-violet-950/40 p-6 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.15),transparent_55%)] pointer-events-none" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-[0_12px_32px_rgba(52,211,153,0.35)]"
              >
                <CheckCircle2 size={36} className="text-white" strokeWidth={2.5} />
              </motion.div>

              <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
                <Sparkles size={22} className="text-violet-500" />
                Import successful
              </h4>

              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 max-w-md mx-auto">
                Your conversation with <span className="font-semibold text-violet-600 dark:text-violet-300">{therapist.name}</span> is
                ready to continue.
              </p>

              {importedMessageCount > 0 && (
                <p className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-700/50 rounded-full px-3 py-1.5 mb-5">
                  <MessageCircle size={14} />
                  {importedMessageCount} message{importedMessageCount === 1 ? '' : 's'} restored
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={openImportedChat}
                  className="bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 text-slate-900 font-semibold py-3 px-6 rounded-xl shadow-[0_10px_28px_rgba(14,165,233,0.25)] transition-all"
                >
                  Open imported chat
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-3 px-6 rounded-xl border border-purple-200/90 dark:border-violet-400/30 transition-colors"
                >
                  Import another
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
              Paste exported chat text or upload the downloaded export file to restore your conversation.
            </p>

            <div className="space-y-4">
              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/70 dark:bg-slate-800 hover:bg-white/60 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 cursor-pointer border border-purple-200 dark:border-violet-400/30 transition-colors text-sm">
                <Upload size={16} />
                Upload Export File (.txt)
                <input
                  type="file"
                  accept=".txt,.json,text/plain,application/json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>

              <textarea
                value={exportPayload}
                onChange={(e) => {
                  setExportPayload(e.target.value);
                  setError('');
                  if (status === 'error') setStatus('idle');
                }}
                onKeyPress={handleKeyPress}
                placeholder="Paste exported chat content (starts with MINDEASE_EXPORT_V1::)"
                disabled={status === 'loading'}
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-white/75 dark:bg-slate-900/60 border border-purple-200 dark:border-violet-400/30
                  text-slate-800 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 font-mono text-sm
                  focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
                  transition-colors min-h-[120px] disabled:opacity-60
                "
              />

              {error && status === 'error' && (
                <div className="text-red-600 dark:text-red-300 text-sm bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleRecover}
                disabled={status === 'loading'}
                className="
                  w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                  disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed
                  text-white font-semibold py-3 px-6 rounded-lg
                  transition-all shadow-[0_8px_24px_rgba(124,58,237,0.25)]
                "
              >
                {status === 'loading' ? 'Importing…' : 'Import Chat'}
              </button>

              <p className="text-slate-500 dark:text-slate-400 text-xs text-center">
                Accepted formats: MINDEASE_EXPORT_V1 payload or raw JSON export
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionRecovery;
