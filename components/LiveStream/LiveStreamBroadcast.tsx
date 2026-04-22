
import React from 'react';
import { SignalIcon } from '@heroicons/react/24/solid';

interface LiveStreamBroadcastProps {
  isRecording: boolean;
  onEndLive: () => void;
}

const LiveStreamBroadcast: React.FC<LiveStreamBroadcastProps> = ({ isRecording, onEndLive }) => {
  return (
    <div className="flex flex-col items-end">
      <div className="bg-red-600 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider mb-1 shadow-sm flex items-center gap-1 animate-pulse">
        <SignalIcon className="h-2 w-2" /> Ao Vivo
      </div>
      {isRecording && (
        <div className="bg-black/50 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> REC
        </div>
      )}
    </div>
  );
};

export default LiveStreamBroadcast;
