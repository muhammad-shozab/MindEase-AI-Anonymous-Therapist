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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`flex items-end gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${isUser ? 'bg-violet-500 dark:bg-violet-600' : 'bg-white/60 dark:bg-slate-800/70 border border-purple-200 dark:border-violet-400/30'}
          flex-shrink-0
        `}>
          {isUser ? (
            <User size={20} className="text-white" />
          ) : (
            <Bot size={20} className="text-emerald-400" />
          )}
        </div>

        {/* Message Content */}
        <div className={`
          rounded-2xl px-4 py-3
          ${isUser 
            ? 'bg-violet-500 dark:bg-violet-600 text-white rounded-br-sm border border-violet-300/60 dark:border-violet-300/30' 
            : 'bg-white/70 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-purple-200 dark:border-violet-400/30'
          }
        `}>
          <p className={`text-[11px] font-semibold mb-1 ${isUser ? 'text-violet-100' : 'text-emerald-500'}`}>
            {senderLabel}
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p className={`text-xs mt-1 ${isUser ? 'text-violet-100/80' : 'text-slate-500 dark:text-slate-400'}`}>
            {time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
