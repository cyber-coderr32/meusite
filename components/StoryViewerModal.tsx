
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GroupedStory, User, Message, ChatType } from '../types';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, ChevronUpIcon, PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/solid';
import { markStoryAsViewed, sendMessage, startPrivateChat, generateUUID, findUserById } from '../services/storageService';

interface StoryViewerModalProps {
  stories: GroupedStory[];
  initialIndex: number;
  onClose: () => void;
  currentUser: User;
}

const STORY_DURATION = 5000;
const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍', '🔥', '👏'];

const ViewerItem: React.FC<{ userId: string }> = ({ userId }) => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    findUserById(userId).then(setUser);
  }, [userId]);

  if (!user) return <div className="animate-pulse flex items-center gap-3"><div className="w-10 h-10 bg-white/10 rounded-full"></div><div className="h-4 bg-white/10 rounded w-24"></div></div>;

  return (
    <div className="flex items-center gap-3">
      <img src={user.profilePicture} className="w-10 h-10 rounded-full object-cover" />
      <span className="text-white font-medium">{user.firstName} {user.lastName}</span>
    </div>
  );
};

const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ stories, initialIndex, onClose, currentUser }) => {
  const [currentUserIdx, setCurrentUserIdx] = useState(initialIndex);
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViews, setShowViews] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStory = stories[currentUserIdx];
  const currentItem = currentStory?.items?.[currentItemIdx];

  // Mark as viewed
  useEffect(() => {
    if (currentItem && currentUser.id !== currentStory.userId) {
      markStoryAsViewed(currentItem.id, currentUser.id);
    }
  }, [currentItem?.id, currentUser.id, currentStory?.userId]);

  // Pause when views list is open
  useEffect(() => {
    if (showViews) setIsPaused(true);
    else setIsPaused(false);
  }, [showViews]);

  const handleNext = useCallback(() => {
    if (!currentStory || !currentStory.items) { onClose(); return; }
    
    // Próximo Item do mesmo usuário
    if (currentItemIdx < currentStory.items.length - 1) {
      setCurrentItemIdx(prev => prev + 1);
      setProgress(0);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
    } 
    // Próximo Usuário
    else if (currentUserIdx < stories.length - 1) {
      setCurrentUserIdx(prev => prev + 1);
      setCurrentItemIdx(0);
      setProgress(0);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
    } 
    // Fim de tudo
    else {
      onClose();
    }
  }, [currentItemIdx, currentUserIdx, currentStory, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    // Item anterior do mesmo usuário
    if (currentItemIdx > 0) {
      setCurrentItemIdx(prev => prev - 1);
      setProgress(0);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
    } 
    // Usuário anterior (último item)
    else if (currentUserIdx > 0) {
      const prevUserIdx = currentUserIdx - 1;
      const prevStory = stories[prevUserIdx];
      setCurrentUserIdx(prevUserIdx);
      setCurrentItemIdx(prevStory?.items?.length ? prevStory.items.length - 1 : 0);
      setProgress(0);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
    }
  }, [currentItemIdx, currentUserIdx, stories]);

  // Timer Effect
  useEffect(() => {
    if (!currentStory || !currentItem) return;

    if (isPaused) {
        if (startTimeRef.current) {
            pausedTimeRef.current += Date.now() - startTimeRef.current;
            startTimeRef.current = null;
        }
        return;
    }

    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
        if (!startTimeRef.current) return;
        
        const now = Date.now();
        const elapsed = now - startTimeRef.current + pausedTimeRef.current;
        const newProgress = (elapsed / STORY_DURATION) * 100;

        if (newProgress >= 100) {
            handleNext();
        } else {
            setProgress(newProgress);
        }
    }, 50);

    return () => clearInterval(interval);
  }, [handleNext, currentStory, currentItem, isPaused]);

  const handleSendReply = async (text: string) => {
    if (!text.trim() || !currentItem || sendingReply) return;
    
    setSendingReply(true);
    setIsPaused(true);
    
    try {
      const chatId = await startPrivateChat(currentUser.id, currentStory.userId);
      if (chatId) {
        const message: Message = {
          id: generateUUID(),
          senderId: currentUser.id,
          timestamp: Date.now(),
          text: text,
          replyTo: {
            id: currentItem.id,
            text: currentItem.text || "Story",
            senderName: currentStory.userName,
            type: currentItem.imageUrl ? 'image' : 'text'
          }
        };
        await sendMessage(chatId, message);
        setReplyText('');
        setShowReactions(false);
        // Show success feedback?
      }
    } catch (error) {
      console.error("Erro ao responder story:", error);
    } finally {
      setSendingReply(false);
      setIsPaused(false);
    }
  };

  if (!currentStory || !currentItem) return null;

  const isOwnStory = currentStory.userId === currentUser.id;

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex items-center justify-center animate-fade-in">
      <div className="relative w-full h-full md:w-[400px] md:h-[90vh] md:rounded-[2rem] overflow-hidden bg-gray-900 flex flex-col shadow-2xl border-0 md:border border-white/10">
        
        {/* Progress Bars */}
        <div className="absolute top-2 left-2 right-2 z-[60] flex gap-1 h-1">
          {currentStory.items?.map((_, idx) => (
            <div key={idx} className="flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm h-full">
               <div 
                 className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                 style={{ 
                   width: idx < currentItemIdx ? '100%' : idx === currentItemIdx ? `${progress}%` : '0%' 
                 }}
               />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-5 left-4 right-4 flex items-center justify-between z-[60] pt-2">
           <div className="flex items-center gap-3">
              <div className="p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full">
                <img src={currentStory.userProfilePic} className="w-9 h-9 rounded-full border-2 border-black object-cover" />
              </div>
              <div className="flex flex-col drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                 <span className="font-bold text-white text-sm tracking-wide">{currentStory.userName}</span>
                 <span className="text-[10px] text-white/80 font-medium">
                    {new Date(currentItem.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
              </div>
           </div>
           
           <button 
             onClick={(e) => { e.stopPropagation(); onClose(); }} 
             className="p-2 bg-black/20 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all active:scale-90 shadow-sm border border-white/10"
           >
              <XMarkIcon className="h-6 w-6 stroke-2" />
           </button>
        </div>

        {/* Dark Gradient Overlay for Header Readability */}
        <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-20"></div>

        {/* Content */}
        <div 
            className="flex-1 flex items-center justify-center bg-black relative w-full h-full"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
           {currentItem.imageUrl ? (
              <img src={currentItem.imageUrl} className={`w-full h-full object-contain transition-all duration-500 ${currentItem.filter || ''}`} alt="Story" />
           ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center p-8 transition-colors duration-500 ${currentItem.backgroundColor || 'bg-blue-600'}`}>
                 <p className={`font-black leading-tight break-words max-w-full drop-shadow-md whitespace-pre-wrap ${currentItem.textColor || 'text-white'} ${currentItem.fontFamily || 'font-sans text-center'} ${currentItem.text && currentItem.text.length > 80 ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'}`}>
                   {currentItem.text}
                 </p>
              </div>
           )}
        </div>

        {/* Footer (WhatsApp Style) */}
        <div className="absolute bottom-0 left-0 right-0 z-[70] p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          {isOwnStory ? (
            <div className="flex flex-col items-center">
              <button 
                onClick={() => setShowViews(!showViews)}
                className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
              >
                <ChevronUpIcon className={`h-5 w-5 transition-transform ${showViews ? 'rotate-180' : ''}`} />
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-4 w-4" />
                  <span className="text-xs font-bold">{currentItem.views?.length || 0} visualizações</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Quick Reactions */}
              {showReactions && (
                <div 
                  className="flex justify-between bg-white/10 backdrop-blur-xl p-3 rounded-3xl border border-white/10"
                >
                  {REACTION_EMOJIS.map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => handleSendReply(emoji)}
                      className="text-2xl hover:scale-125 transition-transform active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input 
                    ref={inputRef}
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onFocus={() => { setIsPaused(true); setShowReactions(true); }}
                    onBlur={() => { if (!replyText) { setIsPaused(false); setShowReactions(false); } }}
                    placeholder="Responder..."
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-3 text-white text-sm outline-none focus:border-white/40 transition-all"
                  />
                  <button 
                    onClick={() => setShowReactions(!showReactions)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    <FaceSmileIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {replyText.trim() && (
                  <button 
                    onClick={() => handleSendReply(replyText)}
                    disabled={sendingReply}
                    className="p-3 bg-white rounded-full text-black hover:bg-gray-200 transition-all active:scale-90 disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-5 w-5 -rotate-45" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Touch Zones (Invisible) */}
        <div className="absolute inset-0 z-30 flex">
           <div className="w-1/4 h-full" onClick={handlePrev}></div>
           <div className="w-1/2 h-full" onClick={() => {/* Middle tap pauses, handled by container events */}}></div>
           <div className="w-1/4 h-full" onClick={handleNext}></div>
        </div>

        {/* Views List Overlay */}
        {showViews && isOwnStory && (
          <div 
            className="absolute inset-0 z-[100] bg-gray-900 flex flex-col"
          >
             <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold">Visualizações ({currentItem.views?.length || 0})</h3>
                <button onClick={() => setShowViews(false)} className="text-gray-400 hover:text-white">
                   <XMarkIcon className="h-6 w-6" />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentItem.views?.length ? (
                  currentItem.views.map(uid => (
                    <ViewerItem key={uid} userId={uid} />
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-10">Nenhuma visualização ainda</div>
                )}
             </div>
          </div>
        )}

        {/* Desktop Arrows */}
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
          className="hidden md:flex absolute -left-20 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white z-[60] transition-all backdrop-blur-md"
        >
           <ChevronLeftIcon className="h-8 w-8" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }} 
          className="hidden md:flex absolute -right-20 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white z-[60] transition-all backdrop-blur-md"
        >
           <ChevronRightIcon className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
};

export default StoryViewerModal;
