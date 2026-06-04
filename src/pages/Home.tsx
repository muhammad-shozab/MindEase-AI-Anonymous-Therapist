import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Brain, Lock, Bot, Shield, Sun, Moon, Sparkles, Heart, Zap, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const { toggleDarkMode, darkMode } = useApp();
  const [showOptionsSidebar, setShowOptionsSidebar] = useState(false);

  const floatingIcons = [
    { Icon: Brain, color: 'text-purple-400', delay: 0 },
    { Icon: Heart, color: 'text-pink-400', delay: 0.5 },
    { Icon: Sparkles, color: 'text-yellow-400', delay: 1 },
    { Icon: Zap, color: 'text-blue-400', delay: 1.5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-violet-950 dark:to-fuchsia-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Floating Icons */}
        {floatingIcons.map(({ Icon, color, delay }, index) => (
          <motion.div
            key={index}
            className={`absolute ${color}`}
            style={{
              top: `${20 + index * 15}%`,
              left: `${10 + index * 20}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [0, 360],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 15 + index * 2,
              repeat: Infinity,
              delay: delay,
              ease: 'easeInOut'
            }}
          >
            <Icon size={40} />
          </motion.div>
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Options Button */}
      <motion.button
        onClick={() => setShowOptionsSidebar(true)}
        className="fixed top-6 left-6 bg-white/10 hover:bg-white/20 text-slate-800 dark:text-slate-100 p-3 rounded-full transition-all backdrop-blur-md border border-white/10 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Open options"
      >
        <Menu size={20} />
      </motion.button>

      {/* Dark Mode Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 bg-white/10 hover:bg-white/20 text-slate-800 dark:text-slate-100 p-3 rounded-full transition-all backdrop-blur-md border border-white/10 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      <div className="max-w-6xl w-full text-center relative z-10">
        {/* Main Logo */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-indigo-400 rounded-full blur-2xl opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <div className="relative bg-white/75 dark:bg-gradient-to-br dark:from-violet-600 dark:to-purple-700 p-8 rounded-full shadow-[0_18px_45px_rgba(14,165,233,0.18)] dark:shadow-2xl border border-cyan-200/70 dark:border-transparent backdrop-blur-md">
              <Brain size={80} className="text-cyan-700 dark:text-slate-100" />
            </div>
          </div>
        </motion.div>

        {/* Title with Gradient Animation */}
        <motion.h1
          className="text-7xl md:text-8xl font-bold mb-4 relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            MindEase
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-3xl text-gray-300 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Talk Freely. Heal Privately.
        </motion.p>

        <motion.p
          className="text-slate-500 dark:text-slate-400 mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Your anonymous AI companion for mental wellness
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <div className="flex flex-col gap-4 items-center justify-center">
            <motion.button
              onClick={() => navigate('/chat/support')}
              className="relative w-full max-w-md block group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-indigo-400 rounded-full blur-xl opacity-60 group-hover:opacity-85 transition-opacity" />
              <div className="relative bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 text-slate-900 font-bold py-5 px-10 rounded-full text-xl shadow-[0_18px_45px_rgba(14,165,233,0.28)] flex items-center justify-center gap-3">
                <Brain size={24} />
                Start Chat
                <Sparkles size={20} />
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/dashboard#import-chat')}
              className="w-full max-w-md bg-white/65 dark:bg-slate-900/65 hover:bg-white/85 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-semibold py-4 px-8 rounded-full border border-purple-200 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Recover Chat
            </motion.button>
          </div>

          <div className="max-w-xl mx-auto text-center bg-white/65 dark:bg-slate-900/65 border border-purple-200 rounded-xl p-3">
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Tip: <span className="text-slate-800 dark:text-slate-100 font-medium">Start Chat</span> begins a new session.
              <span className="mx-2">|</span>
              <span className="text-slate-800 dark:text-slate-100 font-medium">Recover Chat</span> lets you import a saved export file.
            </p>
          </div>

          <motion.p
            className="text-slate-500 dark:text-slate-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Free Forever - No Account - 100% Private
          </motion.p>
        </motion.div>

        {/* Trust Info Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-4 mb-12 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
        >
          {[
            { Icon: Lock, title: '100% Anonymous', desc: 'No signup required', color: 'border-violet-500/30 bg-violet-900/20' },
            { Icon: Bot, title: 'AI-Powered', desc: 'Gemini therapist support', color: 'border-blue-500/30 bg-blue-900/20' },
            { Icon: Shield, title: 'Encrypted', desc: 'AES-256 security', color: 'border-emerald-500/30 bg-emerald-900/20' },
          ].map((feature, index) => (
            <div
              key={index}
              className={`rounded-xl p-5 border ${feature.color} backdrop-blur-sm`}
            >
              <div className="mb-2 flex justify-center">
                <feature.Icon size={24} className="text-slate-800 dark:text-slate-100/90" />
              </div>
              <h3 className="text-slate-800 dark:text-slate-100 font-semibold text-lg">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
        >
          {[
            { number: '1', label: 'Unified Therapist' },
            { number: '24/7', label: 'Available' },
            { number: '8', label: 'Conversations' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          className="mt-16 bg-amber-950/30 border border-amber-800/30 rounded-2xl p-6 max-w-3xl mx-auto backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9 }}
        >
          <p className="text-amber-300 text-sm leading-relaxed">
            <strong className="text-amber-200">Important Notice:</strong> MindEase provides AI-powered support and is not a substitute for professional mental health care.
            If you're in crisis, please contact emergency services or call 988 (Suicide and Crisis Lifeline).
          </p>
        </motion.div>
      </div>

      {showOptionsSidebar && (
        <>
          <div
            className="fixed inset-0 bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-violet-950 dark:to-fuchsia-950/60 z-40"
            onClick={() => setShowOptionsSidebar(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-full max-w-sm bg-white/75 dark:bg-slate-900/70 border-r border-purple-200/80 dark:border-violet-400/25 z-50 p-5 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-800 dark:text-slate-100 text-lg font-bold">Support Options</h3>
              <button
                onClick={() => setShowOptionsSidebar(false)}
                className="bg-white/60 dark:bg-slate-800/70 hover:bg-white/85 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 p-2 rounded-lg"
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
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Find a licensed therapist or counselor near you.</p>
              </button>
              <button
                onClick={() => {
                  window.open('https://www.paltuu.pk/', '_blank', 'noopener,noreferrer');
                  setShowOptionsSidebar(false);
                }}
                className="w-full text-left rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:-translate-y-0.5 hover:shadow-lg p-4 text-slate-800 dark:text-slate-100 transition-all duration-200"
              >
                Adopt a Pet
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Explore pet companionship for emotional support.</p>
              </button>
              <button
                onClick={() => {
                  window.open('https://poki.com/', '_blank', 'noopener,noreferrer');
                  setShowOptionsSidebar(false);
                }}
                className="w-full text-left rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:-translate-y-0.5 hover:shadow-lg p-4 text-slate-800 dark:text-slate-100 transition-all duration-200"
              >
                Play Games
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Use calming or focus games to ease stress.</p>
              </button>
              <button
                onClick={() => {
                  window.open('https://www.alltrails.com/pakistan/federal-capital-territory/islamabad', '_blank', 'noopener,noreferrer');
                  setShowOptionsSidebar(false);
                }}
                className="w-full text-left rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:-translate-y-0.5 hover:shadow-lg p-4 text-slate-800 dark:text-slate-100 transition-all duration-200"
              >
                Go for a Walk
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">A short walk can reduce mental load quickly.</p>
              </button>
              <button
                onClick={() => {
                  window.open('https://www.twitch.tv/', '_blank', 'noopener,noreferrer');
                  setShowOptionsSidebar(false);
                }}
                className="w-full text-left rounded-xl border border-purple-200/90 dark:border-violet-400/30 bg-white/70 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:-translate-y-0.5 hover:shadow-lg p-4 text-slate-800 dark:text-slate-100 transition-all duration-200"
              >
                Call a Friend
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Connect with someone live and feel less alone.</p>
              </button>
              <div
                aria-label="Advertisement placement"
                className="min-h-40 flex-1 rounded-xl border border-dashed border-cyan-300/80 dark:border-cyan-400/30 bg-cyan-50/35 dark:bg-slate-900/35"
              />
            </div>
          </aside>
        </>
      )}

      {/* Add keyframes for gradient animation */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
