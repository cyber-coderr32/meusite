
import React from 'react';
import { HeartIcon, SparklesIcon, UsersIcon, SignalIcon } from '@heroicons/react/24/solid';

interface LiveStreamOverlayProps {
  viewerCount: number;
  isRecording: boolean;
  isProfessional: boolean;
  donationAlert: { name: string, amount: number } | null;
  floatingHearts: { id: number, left: number, color: string }[];
  isHandRaised: boolean;
}

const LiveStreamOverlay: React.FC<LiveStreamOverlayProps> = ({ 
  viewerCount, 
  isRecording, 
  isProfessional, 
  donationAlert, 
  floatingHearts,
  isHandRaised
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top Stats */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
        <div className="bg-red-600 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 animate-pulse">
          <SignalIcon className="h-2 w-2" /> Ao Vivo
        </div>
        {isRecording && isProfessional && (
          <div className="bg-black/50 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> REC
          </div>
        )}
        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
          <UsersIcon className="h-3 w-3 text-white/80" />
          <span className="text-[9px] font-black">{viewerCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Donation Alert */}
      {donationAlert && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-shoutout w-[90%] max-w-sm px-2">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-[2px] rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.6)]">
            <div className="bg-black/90 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-3">
              <div className="bg-yellow-400 p-1.5 rounded-full text-black"><SparklesIcon className="h-4 w-4" /></div>
              <div>
                <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Nova Doação</p>
                <p className="text-xs font-bold text-white">
                  <span className="text-sm">{donationAlert.name}</span> enviou <span className="text-green-400 font-black">${donationAlert.amount}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hand Raised Notification */}
      {isHandRaised && (
        <div className="absolute top-20 right-4 animate-bounce">
          <div className="bg-yellow-500 text-black p-2 rounded-full shadow-lg border-2 border-white">
            <HeartIcon className="h-6 w-6" /> {/* Using HeartIcon as placeholder or HandRaised if available */}
          </div>
        </div>
      )}

      {/* Floating Hearts */}
      <div className="absolute bottom-20 right-2 w-16 h-[60%] overflow-hidden">
        {floatingHearts.map(heart => (
          <HeartIcon 
            key={heart.id} 
            className={`absolute bottom-0 w-8 h-8 ${heart.color} animate-float-up drop-shadow-lg`}
            style={{ left: `${heart.left}%` }} 
          />
        ))}
      </div>
    </div>
  );
};

export default LiveStreamOverlay;
