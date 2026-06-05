import { Message } from '../services/GeminiService';
import { User, Bot, Volume2, VolumeX } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  therapistIcon?: string;
  onSpeak?: (text: string) => void;
  speechAvailable?: boolean;
  isSpeaking?: boolean;
}

const ChatBubble = ({ message, onSpeak, speechAvailable = false, isSpeaking = false }: ChatBubbleProps) => {
  const isUser = message.role === 'user';
  const senderLabel = isUser ? 'You' : 'Therapist';
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 animate-fade-in`}>
      <div className={`flex items-end gap-1.5 sm:gap-2 max-w-[92%] sm:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Icon */}
        <div className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
          ${isUser ? 'bg-violet-500 dark:bg-violet-600' : 'bg-white/60 dark:bg-slate-800/70 border border-purple-200 dark:border-violet-400/30'}
          flex-shrink-0
        `}>
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-emerald-400" />
          )}
        </div>

        {/* Message Content */}
        <div className={`
          rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm
          ${isUser 
            ? 'bg-violet-500 dark:bg-violet-600 text-white rounded-br-sm border border-violet-300/60 dark:border-violet-300/30' 
            : 'bg-white/70 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-purple-200 dark:border-violet-400/30'
          }
        `}>
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className={`text-[11px] font-semibold ${isUser ? 'text-violet-100' : 'text-emerald-500'}`}>
              {senderLabel}
            </p>
            {!isUser && speechAvailable && onSpeak && (
              <button
                type="button"
                onClick={() => onSpeak(message.content)}
                className={`
                  group relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full
                  border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/70
                  ${isSpeaking
                    ? 'border-rose-200 bg-gradient-to-br from-rose-100 to-pink-200 text-rose-600 shadow-[0_8px_20px_rgba(244,63,94,0.22)] dark:border-rose-400/40 dark:from-rose-500/20 dark:to-pink-500/20 dark:text-rose-200'
                    : 'border-emerald-200 bg-gradient-to-br from-emerald-100 to-cyan-100 text-emerald-600 shadow-[0_8px_20px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 hover:from-emerald-200 hover:to-cyan-200 dark:border-emerald-400/30 dark:from-emerald-400/15 dark:to-cyan-400/15 dark:text-emerald-200 dark:hover:from-emerald-400/25 dark:hover:to-cyan-400/25'
                  }
                `}
                aria-label={isSpeaking ? 'Stop reading therapist message' : 'Read therapist message aloud'}
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
              >
                {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                {isSpeaking && (
                  <span className="absolute inset-0 rounded-full border border-rose-300/70 animate-ping" />
                )}
              </button>
            )}
          </div>
          <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
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
