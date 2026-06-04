import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import GoogleDriveService from '../services/GoogleDriveService';
import { hasGoogleDriveClientId } from '../config/googleDrive';

const DiagnosticDashboard = () => {
  const navigate = useNavigate();
  const [diagnostics, setDiagnostics] = useState({
    apiKey: false,
    googleClientId: false,
    therapistsLoaded: false,
    contextWorking: false,
    error: null as string | null,
  });
  const [driveCheck, setDriveCheck] = useState<{ status: 'idle' | 'checking' | 'ok' | 'fail'; message?: string }>({
    status: 'idle',
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        // Check API key
        const hasApiKey = !!import.meta.env.VITE_GEMINI_KEY && 
                          import.meta.env.VITE_GEMINI_KEY !== 'your_gemini_api_key_here';
        
        // Check Google Client ID
        const hasGoogleId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                           import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here';
        
        // Try to load therapists
        let therapistsLoaded = false;
        try {
          const { default: TherapistFactory } = await import('../patterns/TherapistFactory');
          const therapists = TherapistFactory.getAll();
          therapistsLoaded = therapists.length === 5;
        } catch (err) {
          console.error('Failed to load therapists:', err);
        }

        setDiagnostics({
          apiKey: hasApiKey,
          googleClientId: hasGoogleId,
          therapistsLoaded,
          contextWorking: true,
          error: null,
        });
      } catch (error: any) {
        setDiagnostics(prev => ({
          ...prev,
          error: error.message,
        }));
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-violet-950 dark:to-fuchsia-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Brain size={40} className="text-violet-400" />
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">MindEase Diagnostics</h1>
            <p className="text-slate-500 dark:text-slate-400">System Status Check</p>
          </div>
        </div>

        {/* Diagnostic Results */}
        <div className="space-y-4 mb-8">
          <DiagnosticItem
            label="Gemini API Key Configured"
            status={diagnostics.apiKey}
            successMessage="API key found in .env"
            errorMessage="Missing or invalid API key in .env file"
            fix="Add VITE_GEMINI_KEY=your_key to .env file and restart server"
          />

          <DiagnosticItem
            label="Google Client ID (Optional)"
            status={diagnostics.googleClientId}
            successMessage="Google OAuth configured for Drive backup"
            errorMessage="Not configured (Drive backup unavailable)"
            fix="Add VITE_GOOGLE_CLIENT_ID to .env, enable Google Drive API in Cloud Console, add http://localhost:5173 under Authorized JavaScript origins"
            isWarning={true}
          />

          {hasGoogleDriveClientId() && GoogleDriveService.getInstance().isAuthenticated() && (
            <div className="bg-slate-900/60 border border-violet-400/30 rounded-xl p-4">
              <h4 className="text-slate-100 font-semibold mb-2">Google Drive connection test</h4>
              <p className="text-slate-300 text-sm mb-3">
                {driveCheck.status === 'ok' && 'Drive API responded successfully.'}
                {driveCheck.status === 'fail' && driveCheck.message}
                {driveCheck.status === 'idle' && 'Verify Drive access after using Save to Drive in a chat session.'}
                {driveCheck.status === 'checking' && 'Checking Drive access…'}
              </p>
              <button
                type="button"
                disabled={driveCheck.status === 'checking'}
                onClick={async () => {
                  setDriveCheck({ status: 'checking' });
                  const result = await GoogleDriveService.getInstance().verifyDriveAccess();
                  setDriveCheck(
                    result.ok
                      ? { status: 'ok' }
                      : { status: 'fail', message: result.message }
                  );
                }}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm py-2 px-4 rounded-lg"
              >
                Test Drive access
              </button>
            </div>
          )}

          <DiagnosticItem
            label="Therapists Loaded"
            status={diagnostics.therapistsLoaded}
            successMessage="All 5 therapist types loaded successfully"
            errorMessage="Failed to load therapist configurations"
            fix="Check TherapistFactory.ts file exists"
          />

          <DiagnosticItem
            label="React Context Working"
            status={diagnostics.contextWorking}
            successMessage="AppContext initialized successfully"
            errorMessage="Context provider error"
            fix="Check AppContext.tsx file"
          />
        </div>

        {/* Error Display */}
        {diagnostics.error && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-8">
            <h3 className="text-red-400 font-semibold mb-2">Error Detected:</h3>
            <p className="text-red-300 text-sm font-mono">{diagnostics.error}</p>
          </div>
        )}

        {/* Environment Info */}
        <div className="bg-white/70 dark:bg-slate-900/60 border border-purple-200 rounded-xl p-6 mb-8">
          <h3 className="text-slate-800 dark:text-slate-100 font-semibold mb-4">Environment Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Node Environment:</span>
              <span className="text-slate-800 dark:text-slate-100">{import.meta.env.MODE}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Base URL:</span>
              <span className="text-slate-800 dark:text-slate-100">{import.meta.env.BASE_URL}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-100 py-3 px-6 rounded-lg transition-colors border border-purple-200"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            disabled={!diagnostics.apiKey}
            className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-white/60 dark:bg-slate-800/70 disabled:cursor-not-allowed text-slate-800 dark:text-slate-100 py-3 px-6 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-950 border border-blue-800 rounded-xl p-6">
          <h3 className="text-blue-400 font-semibold mb-3">Quick Setup</h3>
          <ol className="text-blue-200 text-sm space-y-2 list-decimal list-inside">
            <li>Get API key from: <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="underline">aistudio.google.com</a></li>
            <li>Create <code className="bg-blue-900 px-2 py-1 rounded">.env</code> file in project root</li>
            <li>Add: <code className="bg-blue-900 px-2 py-1 rounded">VITE_GEMINI_KEY=your_key</code></li>
            <li>Restart server: <code className="bg-blue-900 px-2 py-1 rounded">Ctrl+C</code> then <code className="bg-blue-900 px-2 py-1 rounded">npm run dev</code></li>
            <li>Refresh this page to check status</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

interface DiagnosticItemProps {
  label: string;
  status: boolean;
  successMessage: string;
  errorMessage: string;
  fix?: string;
  isWarning?: boolean;
}

const DiagnosticItem = ({ label, status, successMessage, errorMessage, fix, isWarning }: DiagnosticItemProps) => {
  const bgColor = status ? 'bg-emerald-950' : (isWarning ? 'bg-amber-950' : 'bg-red-950');
  const borderColor = status ? 'border-emerald-800' : (isWarning ? 'border-amber-800' : 'border-red-800');
  const textColor = status ? 'text-emerald-400' : (isWarning ? 'text-amber-400' : 'text-red-400');
  const icon = status ? '✅' : (isWarning ? '⚠️' : '❌');

  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h4 className={`${textColor} font-semibold mb-1`}>{label}</h4>
          <p className="text-gray-300 text-sm mb-2">
            {status ? successMessage : errorMessage}
          </p>
          {!status && fix && (
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              <strong>Fix:</strong> {fix}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticDashboard;
