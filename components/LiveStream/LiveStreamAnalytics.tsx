
import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/solid';

interface LiveStreamAnalyticsProps {
  viewerCount: number;
  heartCount: number;
}

const LiveStreamAnalytics: React.FC<LiveStreamAnalyticsProps> = ({ viewerCount, heartCount }) => {
  return (
    <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="h-5 w-5 text-blue-500" />
        <h3 className="text-xs font-black uppercase tracking-widest">Estatísticas da Live</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-3 rounded-xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Espectadores</p>
          <p className="text-lg font-black">{viewerCount}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Curtidas</p>
          <p className="text-lg font-black">{heartCount}</p>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamAnalytics;
