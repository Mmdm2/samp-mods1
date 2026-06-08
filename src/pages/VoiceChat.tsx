import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Users, Plus, Volume2, VolumeX, MessageSquare, Send, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Room {
  id: string;
  name: string;
  participant_count: number;
  created_at: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  created_at: string;
  display_name?: string;
}

export default function VoiceChat() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadRooms();
    const ch = supabase.channel('voice_rooms_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voice_rooms' }, () => loadRooms())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadRooms() {
    const { data } = await supabase.from('voice_rooms').select('*').eq('active', true).order('created_at', { ascending: false });
    setRooms(data || []);
    setLoading(false);
  }

  async function loadMessages(roomId: string) {
    const { data } = await supabase
      .from('room_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages((data || []).map(m => ({
      ...m,
      display_name: m.user_id === user?.id ? 'شما' : `کاربر_${m.user_id.slice(0, 4)}`,
    })));
  }

  function subscribeToChat(roomId: string) {
    if (chatChannelRef.current) {
      supabase.removeChannel(chatChannelRef.current);
    }
    const ch = supabase
      .channel(`room_chat_${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'room_messages',
        filter: `room_id=eq.${roomId}`,
      }, payload => {
        const m = payload.new as ChatMessage;
        setMessages(prev => [...prev, {
          ...m,
          display_name: m.user_id === user?.id ? 'شما' : `کاربر_${m.user_id.slice(0, 4)}`,
        }]);
      })
      .subscribe();
    chatChannelRef.current = ch;
  }

  async function joinRoom(room: Room) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setActiveRoom(room);
      setMuted(false);
      setMessages([]);

      await supabase.from('voice_rooms').update({ participant_count: room.participant_count + 1 }).eq('id', room.id);
      loadRooms();
      loadMessages(room.id);
      subscribeToChat(room.id);
    } catch {
      alert('دسترسی به میکروفون لازم است. لطفاً اجازه دسترسی بدهید.');
    }
  }

  async function leaveRoom() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (chatChannelRef.current) {
      supabase.removeChannel(chatChannelRef.current);
      chatChannelRef.current = null;
    }
    if (activeRoom) {
      await supabase.from('voice_rooms').update({
        participant_count: Math.max(0, activeRoom.participant_count - 1)
      }).eq('id', activeRoom.id);
    }
    setActiveRoom(null);
    setMessages([]);
    loadRooms();
  }

  function toggleMute() {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = muted; });
    }
    setMuted(m => !m);
  }

  async function sendMessage() {
    if (!chatInput.trim() || !activeRoom || !user || sending) return;
    const text = chatInput.trim();
    setChatInput('');
    setSending(true);
    await supabase.from('room_messages').insert({
      room_id: activeRoom.id,
      user_id: user.id,
      message: text,
    });
    setSending(false);
  }

  async function createRoom() {
    if (!newRoomName.trim()) return;
    setCreating(true);
    await supabase.from('voice_rooms').insert({
      name: newRoomName.trim(),
      created_by: user?.id,
      active: true,
      participant_count: 0,
    });
    setNewRoomName('');
    setCreating(false);
    loadRooms();
  }

  return (
    <div className="space-y-5">
      {/* Active room bar */}
      {activeRoom && (
        <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-rajdhani font-bold text-green-400">در اتاق: {activeRoom.name}</span>
          </div>
          <div className="flex-1" />
          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              className={`p-2.5 rounded-lg border transition-all ${muted ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'}`}
              title={muted ? 'وصل کردن میکروفون' : 'قطع کردن میکروفون'}
            >
              {muted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={() => setDeafened(d => !d)}
              className={`p-2.5 rounded-lg border transition-all ${deafened ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-dark-200 border-dark-50 text-gray-400 hover:text-white'}`}
              title={deafened ? 'شنیدن صدا' : 'خاموش کردن صدا'}
            >
              {deafened ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={leaveRoom}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-rajdhani font-bold"
            >
              <PhoneOff size={15} /> خروج
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left panel */}
        <div className="space-y-4">
          {/* Create room */}
          <div className="card">
            <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2 mb-4">
              <Plus size={16} /> ایجاد اتاق جدید
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createRoom()}
                placeholder="نام اتاق..."
                className="input-dark"
              />
              <button
                onClick={createRoom}
                disabled={!newRoomName.trim() || creating}
                className="btn-orange w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus size={15} /> ساخت اتاق
              </button>
            </div>
          </div>

          {/* Rooms list */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-rajdhani font-bold text-orange-500 flex items-center gap-2">
                <Hash size={16} /> اتاق‌ها
              </h3>
              <span className="badge-orange">{rooms.length}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8">
                <Mic size={28} className="text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-rajdhani">اتاقی وجود ندارد</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rooms.map(room => (
                  <div
                    key={room.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${activeRoom?.id === room.id ? 'bg-green-500/10 border-green-500/30' : 'bg-dark-300 border-dark-50 hover:border-orange-500/20'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeRoom?.id === room.id ? 'bg-green-500/20' : 'bg-dark-200'}`}>
                      <Mic size={14} className={activeRoom?.id === room.id ? 'text-green-400' : 'text-gray-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-rajdhani font-bold text-white text-sm truncate">{room.name}</p>
                      <span className="text-[10px] text-gray-500 font-rajdhani flex items-center gap-1">
                        <Users size={9} /> {room.participant_count} نفر
                      </span>
                    </div>
                    {activeRoom?.id === room.id ? (
                      <button onClick={leaveRoom} className="p-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                        <PhoneOff size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={() => joinRoom(room)}
                        disabled={!!activeRoom}
                        className="p-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 transition-all disabled:opacity-40"
                      >
                        <Mic size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guide */}
          <div className="card border-dark-50">
            <h4 className="font-rajdhani font-bold text-gray-400 text-sm mb-3">راهنما</h4>
            <div className="space-y-1.5 text-xs text-gray-500 font-rajdhani">
              <p>🎙️ روی آیکون میکروفون برای ورود</p>
              <p>🔇 دکمه میکروفون: قطع/وصل صدا</p>
              <p>💬 وقتی در اتاق هستید می‌توانید چت کنید</p>
              <p>📞 پس از اتمام، خروج را بزنید</p>
            </div>
          </div>
        </div>

        {/* Chat / main panel */}
        <div className="lg:col-span-2">
          {activeRoom ? (
            <div className="card flex flex-col h-[520px]">
              {/* Chat header */}
              <div className="flex items-center gap-3 pb-3 border-b border-dark-50 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <MessageSquare size={16} className="text-orange-400" />
                  <span className="font-rajdhani font-bold text-orange-400">چت اتاق: {activeRoom.name}</span>
                </div>
                <div className="mr-auto flex items-center gap-2">
                  {muted && (
                    <span className="flex items-center gap-1 text-[10px] text-red-400 font-rajdhani">
                      <MicOff size={10} /> میکروفون خاموش
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 font-rajdhani">{messages.length} پیام</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare size={32} className="text-gray-700 mb-3" />
                    <p className="text-sm text-gray-500 font-rajdhani">اولین پیام را ارسال کنید!</p>
                    <p className="text-xs text-gray-600 mt-1 font-rajdhani">پیام‌ها برای همه اعضای اتاق نمایش داده می‌شود</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.user_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${isMine ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400' : 'bg-dark-200 border border-dark-50 text-gray-400'}`}>
                          {isMine ? 'من' : (msg.display_name || 'K').charAt(0).toUpperCase()}
                        </div>
                        <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                          <span className={`text-[10px] font-rajdhani ${isMine ? 'text-orange-400 text-right' : 'text-gray-500'}`}>
                            {isMine ? 'شما' : msg.display_name}
                          </span>
                          <div className={`px-3 py-2 rounded-xl text-sm font-rajdhani leading-relaxed break-words ${isMine ? 'bg-orange-500/15 border border-orange-500/20 text-white rounded-tl-none' : 'bg-dark-200 border border-dark-50 text-gray-200 rounded-tr-none'}`}>
                            {msg.message}
                          </div>
                          <span className="text-[9px] text-gray-600 font-mono">
                            {new Date(msg.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat input */}
              <div className="flex gap-2 pt-3 border-t border-dark-50 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="پیام بنویسید..."
                  className="input-dark flex-1 text-sm"
                  dir="rtl"
                  maxLength={500}
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || sending}
                  className="btn-orange px-4 disabled:opacity-50 shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-20 text-center h-[520px]">
              <div className="w-16 h-16 rounded-2xl bg-dark-200 border border-dark-50 flex items-center justify-center mb-5">
                <Mic size={28} className="text-gray-600" />
              </div>
              <p className="font-rajdhani font-bold text-gray-400 text-lg">وارد یک اتاق شوید</p>
              <p className="text-sm text-gray-600 mt-2 font-rajdhani max-w-xs leading-relaxed">
                پس از ورود به اتاق می‌توانید با دیگران صحبت کنید و پیام متنی ارسال کنید
              </p>
              <div className="flex items-center gap-2 mt-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-200 rounded-full border border-dark-50 text-xs text-gray-500 font-rajdhani">
                  <Mic size={11} /> وایس چت
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-200 rounded-full border border-dark-50 text-xs text-gray-500 font-rajdhani">
                  <MessageSquare size={11} /> متن چت
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
