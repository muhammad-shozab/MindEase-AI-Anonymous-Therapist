import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-3 sm:mb-4 animate-fade-in">
      <div className="flex items-end gap-1.5 sm:gap-2 max-w-[92%] sm:max-w-[80%]">
        {/* Icon */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/70 dark:bg-slate-800/70 border border-purple-200 dark:border-violet-400/30 flex-shrink-0">
          <Bot size={18} className="text-emerald-400" />
        </div>

        {/* Typing Animation */}
        <div className="bg-white/70 dark:bg-slate-900/60 rounded-2xl rounded-bl-sm px-5 py-3 sm:px-6 sm:py-4 border border-purple-200 dark:border-violet-400/30 shadow-sm">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
