
import React, { useState, useRef, useEffect } from 'react';
import { Comment, User } from '../../types';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface LiveStreamChatProps {
  messages: Comment[];
  currentUser: User;
  onSendMessage: (text: string) => void;
}

const LiveStreamChat: React.FC<LiveStreamChatProps> = ({ messages, currentUser, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full pointer-events-auto">
      <div className="flex-1 overflow-y-auto no-scrollbar mask-gradient-chat pb-2">
        {messages.map(msg => (
          <div key={msg.id} className="flex items-start gap-2 animate-slide-right-fade mb-2">
            <div className={`px-3 py-1.5 rounded-2xl rounded-tl-none bg-black/40 backdrop-blur-sm border border-white/5 shadow-sm text-xs max-w-full break-words ${msg.userId === currentUser.id ? 'bg-blue-600/40 border-blue-500/30' : ''}`}>
              <span className="font-black text-gray-300 mr-2 text-[10px] uppercase tracking-wide">{msg.userName}</span>
              <span className="text-white font-medium text-[11px] leading-snug">{msg.text}</span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-3 border border-white/10 focus-within:bg-white/20 transition-all shadow-lg min-w-0 mt-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Comente algo..." 
          className="bg-transparent border-none outline-none text-xs font-bold text-white placeholder-white/50 w-full min-w-0"
        />
        <button type="submit" disabled={!newMessage.trim()} className="text-white/80 hover:text-blue-400 transition-colors disabled:opacity-30 shrink-0">
          <PaperAirplaneIcon className="h-5 w-5 -rotate-45" />
        </button>
      </form>
    </div>
  );
};

export default LiveStreamChat;
