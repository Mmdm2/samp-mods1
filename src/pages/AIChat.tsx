import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Trash2, Zap, RefreshCw } from 'lucide-react';
import { getSAMPAnswer } from '../lib/sampKnowledge';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  'weapon IDs لیست اسلحه‌ها',
  'vehicle IDs لیست ماشین‌ها',
  'skin IDs لیست اسکین‌ها',
  'interior IDs داخل ساختمان‌ها',
  'timecycle چیست؟',
  'txd file ویرایش',
  'CLEO Script چطور بنویسم',
  'MySQL Plugin نصب',
  'مختصات مکان‌های مهم',
  'RCON دستورات',
  'streamer plugin استفاده',
  'zcmd تعریف دستور',
];

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-400">$1</strong>')
    .replace(/^🔹(.+)$/gm, '<div class="flex gap-2"><span>🔹</span><span>$1</span></div>')
    .replace(/^🔸(.+)$/gm, '<div class="flex gap-2"><span>🔸</span><span>$1</span></div>')
    .replace(/^🔴(.+)$/gm, '<div class="flex gap-2"><span>🔴</span><span>$1</span></div>')
    .replace(/^💡(.+)$/gm, '<div class="flex gap-2"><span>💡</span><span>$1</span></div>')
    .replace(/^💬(.+)$/gm, '<div class="flex gap-2"><span>💬</span><span>$1</span></div>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="bg-dark-400 border border-dark-50 rounded-lg p-3 mt-2 mb-2 overflow-x-auto text-xs text-green-400 font-mono whitespace-pre">$1</pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-dark-400 px-1.5 py-0.5 rounded text-xs text-orange-300 font-mono">$1</code>')
    .replace(/\n/g, '<br/>');
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `سلام! من **هوش مصنوعی SAMP Tools** هستم 🎮\n\nمی‌توانم در مورد:\n🔹 **اسکریپت‌نویسی Pawn** و **Lua** کمک کنم\n🔹 **آیدی‌های** اسلحه، ماشین، اسکین و اینتریور بدهم\n🔹 سوالات درباره **پلاگین‌ها** (MySQL, Streamer, ZCMD) پاسخ دهم\n🔹 **خطاهای** کد را توضیح دهم\n\nسوال خود را بپرسید! ⚡`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text?: string) {
    const q = (text || input).trim();
    if (!q || loading) return;

    setInput('');
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Save to Supabase
    if (user) {
      supabase.from('chat_messages').insert({ role: 'user', content: q }).then(() => {});
    }

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    const answer = getSAMPAnswer(q);
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: answer,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);

    if (user) {
      supabase.from('chat_messages').insert({ role: 'assistant', content: answer }).then(() => {});
    }
  }

  function clearChat() {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'چت پاک شد! سوال جدیدی بپرسید 🎮',
      timestamp: new Date(),
    }]);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center animate-glow-pulse">
            <Bot size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="font-rajdhani font-bold text-white">هوش مصنوعی SAMP</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] text-green-400 font-rajdhani">آنلاین — آماده پاسخ</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Quick questions */}
      <div className="flex gap-2 flex-wrap mb-4 shrink-0">
        {QUICK_QUESTIONS.slice(0, 6).map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="text-[11px] px-3 py-1.5 rounded-full bg-dark-200 border border-dark-50 text-gray-400 hover:border-orange-500/40 hover:text-orange-400 transition-all font-rajdhani whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-blue-500/20 border border-blue-500/30'
                : 'bg-orange-500/20 border border-orange-500/30'
            }`}>
              {msg.role === 'assistant' ? (
                <Bot size={14} className="text-blue-400" />
              ) : (
                <User size={14} className="text-orange-400" />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`rounded-xl px-4 py-3 text-sm font-rajdhani leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-dark-200 border border-dark-50 text-gray-200'
                  : 'bg-orange-500/15 border border-orange-500/20 text-white'
              }`}>
                <div
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  className="space-y-1"
                />
              </div>
              <span className="text-[10px] text-gray-600 font-rajdhani px-1">
                {msg.timestamp.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Bot size={14} className="text-blue-400" />
            </div>
            <div className="bg-dark-200 border border-dark-50 rounded-xl px-4 py-3 flex items-center gap-2">
              <RefreshCw size={12} className="text-blue-400 animate-spin" />
              <span className="text-xs text-gray-400 font-rajdhani">در حال پردازش...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 shrink-0">
        {/* More quick questions */}
        <div className="flex gap-2 flex-wrap mb-3">
          {QUICK_QUESTIONS.slice(6).map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-dark-200 border border-dark-50 text-gray-400 hover:border-orange-500/40 hover:text-orange-400 transition-all font-rajdhani whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MessageSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="سوال خود را درباره SA-MP / SAMP بپرسید..."
              className="input-dark pl-10 pr-4"
              dir="rtl"
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-orange px-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={16} />
            <span className="hidden sm:block">ارسال</span>
          </button>
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-2 font-rajdhani">
          هوش مصنوعی بر اساس دانش SA-MP پاسخ می‌دهد — @XchoR MMD
        </p>
      </div>
    </div>
  );
}
