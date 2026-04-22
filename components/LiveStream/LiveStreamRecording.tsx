
import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

interface LiveStreamRecordingProps {
  isEnding: boolean;
}

const LiveStreamRecording: React.FC<LiveStreamRecordingProps> = ({ isEnding }) => {
  if (!isEnding) return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center pointer-events-auto">
      <ArrowPathIcon className="h-12 w-12 text-white animate-spin mb-4" />
      <h3 className="text-xl font-black uppercase tracking-widest text-white">Salvando Aula...</h3>
      <p className="text-xs text-gray-400 font-bold mt-2">Aguarde o upload da gravação</p>
    </div>
  );
};

export default LiveStreamRecording;
