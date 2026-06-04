import { useNavigate } from 'react-router-dom';
import { Therapist } from '../patterns/TherapistFactory';
import { Leaf, Heart, Sunrise, Zap, Sparkles } from 'lucide-react';

interface TherapistCardProps {
  therapist: Therapist;
}

const iconMap: Record<string, any> = {
  leaf: Leaf,
  heart: Heart,
  sunrise: Sunrise,
  zap: Zap,
  sparkles: Sparkles,
};

const colorMap: Record<string, string> = {
  emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 hover:border-emerald-500/50',
  blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-500/50',
  amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 hover:border-amber-500/50',
  violet: 'from-violet-500/20 to-violet-600/20 border-violet-500/30 hover:border-violet-500/50',
  indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 hover:border-indigo-500/50',
};

const iconColorMap: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  amber: 'text-amber-400',
  violet: 'text-violet-400',
  indigo: 'text-indigo-400',
};

const TherapistCard = ({ therapist }: TherapistCardProps) => {
  const navigate = useNavigate();
  const Icon = iconMap[therapist.icon] || Leaf;

  const handleClick = () => {
    navigate(`/chat/${therapist.type}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-2xl border-2 p-6
        bg-gradient-to-br ${colorMap[therapist.color] || colorMap.emerald}
        backdrop-blur-sm cursor-pointer
        transition-all duration-300 hover:scale-105 hover:shadow-2xl
        group bg-white/70
      `}
    >
      {/* Icon */}
      <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300 flex justify-center">
        <Icon size={48} className={iconColorMap[therapist.color] || 'text-emerald-400'} />
      </div>

      {/* Name */}
      <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">
        {therapist.name}
      </h3>

      {/* Specialty */}
      <p className="text-slate-600 mb-4 text-center">
        {therapist.specialty}
      </p>

      {/* Start Button */}
      <button className="
        w-full bg-white/10 hover:bg-white/20 
        text-slate-800 font-semibold py-2 px-4 rounded-lg
        transition-colors duration-200
        border border-white/20
      ">
        Start Session
      </button>

      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
    </div>
  );
};

export default TherapistCard;
