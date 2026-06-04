import { useState } from 'react';
import StorageService from '../services/StorageService';
import { Smile, Meh, Frown, Activity } from 'lucide-react';

const moods = [
  { icon: Smile, label: 'Great', value: 'great', color: 'emerald' },
  { icon: Smile, label: 'Good', value: 'good', color: 'blue' },
  { icon: Meh, label: 'Okay', value: 'okay', color: 'amber' },
  { icon: Frown, label: 'Low', value: 'low', color: 'orange' },
  { icon: Frown, label: 'Struggling', value: 'struggling', color: 'red' },
];

const MoodTracker = () => {
  const storage = StorageService.getInstance();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleMoodSelect = (value: string) => {
    setSelectedMood(value);
    storage.saveMood(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getBorderColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'border-emerald-500',
      blue: 'border-blue-500',
      amber: 'border-amber-500',
      orange: 'border-orange-500',
      red: 'border-red-500',
    };
    return colors[color] || 'border-gray-700';
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'text-emerald-400',
      blue: 'text-blue-400',
      amber: 'text-amber-400',
      orange: 'text-orange-400',
      red: 'text-red-400',
    };
    return colors[color] || 'text-slate-600';
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-purple-200 dark:border-violet-400/30">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Activity size={20} className="text-violet-400 flex-shrink-0" />
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
          How are you feeling today?
        </h3>
      </div>
      
      <div className="flex justify-between gap-1.5 sm:gap-2 md:gap-3">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.value;
          return (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`
                flex-1 flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl
                transition-all duration-200 border-2 min-w-0
                ${isSelected 
                  ? `bg-white/60 dark:bg-slate-800/70 ${getBorderColor(mood.color)}` 
                  : 'bg-white/75 dark:bg-slate-900/50 border-transparent hover:bg-white/60 dark:hover:bg-slate-800/60'
                }
              `}
            >
              <Icon size={24} className={`${getIconColor(mood.color)} flex-shrink-0`} />
              <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">{mood.label}</span>
            </button>
          );
        })}
      </div>

      {saved && (
        <div className="mt-3 sm:mt-4 text-center text-emerald-400 animate-fade-in text-xs sm:text-sm">
          ✓ Mood saved! Keep tracking your emotional journey.
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
