
import React, { forwardRef } from 'react';
import { User } from '../../types';

interface LiveStreamStreamProps {
  isProfessional: boolean;
  creator: User;
  isCamOn: boolean;
}

const LiveStreamStream = forwardRef<HTMLVideoElement, LiveStreamStreamProps>(({ 
  isProfessional, 
  creator, 
  isCamOn 
}, ref) => {
  return (
    <div className="absolute inset-0 z-0 bg-gray-900">
      {isProfessional ? (
        <video 
          ref={ref} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover scale-x-[-1]" 
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
          <div className="w-full h-full absolute inset-0">
            <img 
              src={creator.profilePicture} 
              className="w-full h-full object-cover opacity-50 blur-sm" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="z-10 flex flex-col items-center animate-pulse">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-white/5 flex items-center justify-center text-4xl md:text-6xl font-black border border-white/10">
              {creator.firstName[0]}
            </div>
            <p className="mt-6 font-black uppercase tracking-[0.3em] text-[10px] text-white">Transmissão Ao Vivo</p>
          </div>
        </div>
      )}
    </div>
  );
});

LiveStreamStream.displayName = 'LiveStreamStream';

export default LiveStreamStream;
