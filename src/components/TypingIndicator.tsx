import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="flex items-end gap-2 max-w-[80%]">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/70 dark:bg-slate-800/70 border border-purple-200 dark:border-violet-400/30 flex-shrink-0">
          <Bot size={20} className="text-emerald-400" />
        </div>

        {/* Typing Animation */}
        <div className="bg-white/70 dark:bg-slate-900/60 rounded-2xl rounded-bl-sm px-6 py-4 border border-purple-200 dark:border-violet-400/30">
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
