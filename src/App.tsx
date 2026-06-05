import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import DiagnosticDashboard from './pages/DiagnosticDashboard';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasGoogleOAuth = Boolean(clientId && clientId !== 'your_google_client_id_here');

  const app = (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat/:therapistType" element={<Chat />} />
            <Route path="/diagnostics" element={<DiagnosticDashboard />} />
          </Routes>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );

  if (!hasGoogleOAuth) {
    return app;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {app}
    </GoogleOAuthProvider>
  );
}

export default App;
