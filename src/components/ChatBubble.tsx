import { Message } from '../services/GeminiService';
import { User, Bot } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  therapistIcon?: string;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';
  const senderLabel = isUser ? 'You' : 'Therapist';
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 animate-fade-in`}>
      <div className={`flex items-end gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Icon */}
        <div className={`
          w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0
          ${isUser ? 'bg-violet-500 dark:bg-violet-600' : 'bg-white/60 dark:bg-slate-800/70 border border-purple-200 dark:border-violet-400/30'}
        `}>
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-emerald-400" />
          )}
        </div>

        {/* Message Content */}
        <div className={`
          rounded-2xl px-3 sm:px-4 py-2 sm:py-3 break-words
          ${isUser 
            ? 'bg-violet-500 dark:bg-violet-600 text-white rounded-br-sm border border-violet-300/60 dark:border-violet-300/30' 
            : 'bg-white/70 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-purple-200 dark:border-violet-400/30'
          }
        `}>
          <p className={`text-[10px] sm:text-[11px] font-semibold mb-1 ${isUser ? 'text-violet-100' : 'text-emerald-500'}`}>
            {senderLabel}
          </p>
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p className={`text-[10px] sm:text-xs mt-1 ${isUser ? 'text-violet-100/80' : 'text-slate-500 dark:text-slate-400'}`}>
            {time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
