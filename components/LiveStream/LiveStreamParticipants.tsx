
import React from 'react';
import { UsersIcon } from '@heroicons/react/24/solid';

interface LiveStreamParticipantsProps {
  viewerCount: number;
}

const LiveStreamParticipants: React.FC<LiveStreamParticipantsProps> = ({ viewerCount }) => {
  return (
    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 mt-1">
      <UsersIcon className="h-3 w-3 text-white/80" />
      <span className="text-[9px] font-black">{viewerCount.toLocaleString()}</span>
    </div>
  );
};

export default LiveStreamParticipants;
