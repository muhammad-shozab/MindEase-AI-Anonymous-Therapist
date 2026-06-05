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
    <div className="bg-white/70 rounded-2xl p-6 border border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={20} className="text-violet-400" />
        <h3 className="text-xl font-bold text-slate-800">
          How are you feeling today?
        </h3>
      </div>
      
      <div className="flex justify-between gap-3">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.value;
          return (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`
                flex-1 flex flex-col items-center gap-2 p-3 rounded-xl
                transition-all duration-200 border-2
                ${isSelected 
                  ? `bg-white/60 ${getBorderColor(mood.color)}` 
                  : 'bg-white/75 border-transparent hover:bg-white/60'
                }
              `}
            >
              <Icon size={32} className={getIconColor(mood.color)} />
              <span className="text-xs text-slate-600">{mood.label}</span>
            </button>
          );
        })}
      </div>

      {saved && (
        <div className="mt-4 text-center text-emerald-400 animate-fade-in">
          ✓ Mood saved! Keep tracking your emotional journey.
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
