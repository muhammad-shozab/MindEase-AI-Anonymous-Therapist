import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, Phone, MessageSquare, Check } from 'lucide-react';

const PanicButton = () => {
  const { panicMode, setPanicMode } = useApp();
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    if (!panicMode) return;

    const phases = ['in', 'hold', 'out'] as const;
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setBreathPhase(phases[currentIndex]);
    }, 4000);

    return () => clearInterval(interval);
  }, [panicMode]);

  const getBreathText = () => {
    switch (breathPhase) {
      case 'in': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'out': return 'Breathe Out...';
    }
  };

  if (panicMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
        <div className="text-center max-w-md">
          {/* Breathing Circle */}
          <div className="mb-8">
            <div className={`
              mx-auto w-48 h-48 rounded-full
              bg-gradient-to-br from-emerald-600/30 to-blue-600/30
              flex items-center justify-center
              transition-all duration-4000 ease-in-out border-2 border-emerald-500/50
              ${breathPhase === 'in' ? 'scale-150' : breathPhase === 'hold' ? 'scale-150' : 'scale-100'}
            `}>
              <div className="text-white text-2xl font-light">
                {getBreathText()}
              </div>
            </div>
          </div>

          {/* Calming Message */}
          <h2 className="text-3xl font-bold text-white mb-4">
            You Are Safe
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            This feeling will pass. Focus on your breathing.
            You're doing great.
          </p>

          {/* Crisis Resources */}
          <div className="space-y-3 mb-8">
            <a
              href="tel:988"
              className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              Crisis Helpline: 988
            </a>
            <a
              href="sms:741741"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={20} />
              Text Crisis Line: 741741
            </a>
          </div>

          {/* Exit Button */}
          <button
            onClick={() => setPanicMode(false)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check size={20} />
            I Feel Better
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setPanicMode(true)}
      className="
        fixed bottom-6 left-6 z-40
        bg-red-600 hover:bg-red-700
        text-white font-bold py-3 px-6 rounded-full
        shadow-2xl transition-all duration-200
        hover:scale-110
        flex items-center gap-2
      "
    >
      <AlertCircle size={20} />
      <span>Need Help Now</span>
    </button>
  );
};

export default PanicButton;
