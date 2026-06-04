import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TherapistFactory from '../patterns/TherapistFactory';
import TherapistCard from '../components/TherapistCard';
import SessionRecovery from '../components/SessionRecovery';
import MoodTracker from '../components/MoodTracker';
import RealAIService from '../services/RealAIService';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Sun, Moon, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toggleDarkMode, darkMode } = useApp();
  const [quote, setQuote] = useState('Taking care of your mental health is a sign of strength.');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const therapist = TherapistFactory.create('support');

  const loadDailyQuote = async () => {
    setLoadingQuote(true);
    try {
      const aiService = RealAIService.getInstance();
      const newQuote = await aiService.getDailyQuote();
      setQuote(newQuote);
    } catch (error) {
      console.error('Failed to load quote:', error);
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    loadDailyQuote();
  }, []);

  useEffect(() => {
    if (window.location.hash === '#import-chat') {
      const el = document.getElementById('import-chat');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-violet-950 dark:to-fuchsia-950 relative overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.header
        className="max-w-7xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 relative z-10 px-4 sm:px-6 md:px-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="text-center flex-1 sm:flex-none">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2 flex-wrap">
              <Sparkles className="text-violet-500 text-lg sm:text-2xl md:text-3xl" size={24} sm:size={28} md:size={32} />
              <span>MindEase</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">Your Safe Space for Mental Wellness</p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleDarkMode}
              className="bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-100 p-3 rounded-full transition-all border border-purple-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Daily Quote */}
        <motion.div
          className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-md rounded-2xl p-6 mb-8 border border-purple-700/30 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-purple-200 text-sm mb-2 font-medium">Daily Inspiration</p>
              <p className="text-slate-800 dark:text-slate-100 text-lg italic leading-relaxed">
                "{quote}"
              </p>
            </div>
            <button
              onClick={loadDailyQuote}
              disabled={loadingQuote}
              className="ml-4 bg-purple-800/50 hover:bg-purple-700/50 disabled:opacity-50 text-slate-800 dark:text-slate-100 p-2 rounded-lg transition-all"
              title="Get new quote"
            >
              {loadingQuote ? '⏳' : '🔄'}
            </button>
          </div>
        </motion.div>

        {/* Mood Tracker */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MoodTracker />
        </motion.div>

        {/* Session Recovery */}
        <motion.div
          id="import-chat"
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SessionRecovery />
        </motion.div>

        {/* Therapist Section */}
        <div className="mb-8">
          <motion.h2
            className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span>Your Therapist</span>
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              (1 available)
            </span>
          </motion.h2>

          <div className="max-w-md mx-auto">
            <motion.div
              key={therapist.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TherapistCard therapist={therapist} />
            </motion.div>
          </div>
        </div>

        {/* Info Section */}
        <motion.div
          className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-purple-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-slate-800 dark:text-slate-100 font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">🔐</span> Your Privacy Matters
          </h3>
          <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>All conversations are encrypted with AES-256 before saving</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Your recovery code is the ONLY way to access your sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Export chats from the chat screen with Save to Drive</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>No personal information is ever collected or stored</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
