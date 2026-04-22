
import React from 'react';
import { 
  MicrophoneIcon, 
  VideoCameraIcon, 
  PowerIcon, 
  BanknotesIcon, 
  HandRaisedIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/solid';
import { 
  MicrophoneIcon as MicrophoneIconOutline, 
  VideoCameraIcon as VideoCameraIconOutline,
  HandRaisedIcon as HandRaisedOutline
} from '@heroicons/react/24/outline';

interface LiveStreamSettingsProps {
  isProfessional: boolean;
  isMicOn: boolean;
  isCamOn: boolean;
  isHandRaised: boolean;
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleHandRaise: () => void;
  onEndLive: () => void;
  onShowDonation: () => void;
}

const LiveStreamSettings: React.FC<LiveStreamSettingsProps> = ({
  isProfessional,
  isMicOn,
  isCamOn,
  isHandRaised,
  showControls,
  setShowControls,
  onToggleMic,
  onToggleCam,
  onToggleHandRaise,
  onEndLive,
  onShowDonation
}) => {
  return (
    <div className="relative pointer-events-auto">
      <button 
        onClick={() => setShowControls(!showControls)} 
        className="p-3 bg-gray-800 rounded-full border border-white/20 text-white hover:bg-gray-700 transition-all shadow-lg"
      >
        <EllipsisHorizontalIcon className="h-5 w-5" />
      </button>
      
      {showControls && (
        <div className="absolute bottom-full right-0 mb-4 bg-black/90 border border-white/10 rounded-2xl p-2 flex flex-col gap-2 shadow-2xl backdrop-blur-xl animate-scale-in origin-bottom-right min-w-[60px] items-center z-50">
          {isProfessional ? (
            <>
              <button onClick={onToggleMic} className={`p-3 rounded-full transition-all ${isMicOn ? 'bg-white text-black' : 'bg-white/10 text-white'}`} title="Microfone">
                {isMicOn ? <MicrophoneIcon className="h-5 w-5" /> : <MicrophoneIconOutline className="h-5 w-5" />}
              </button>
              <button onClick={onToggleCam} className={`p-3 rounded-full transition-all ${isCamOn ? 'bg-white text-black' : 'bg-white/10 text-white'}`} title="Câmera">
                {isCamOn ? <VideoCameraIcon className="h-5 w-5" /> : <VideoCameraIconOutline className="h-5 w-5" />}
              </button>
              <div className="h-px w-full bg-white/10 my-1"></div>
              <button 
                onClick={onEndLive} 
                className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition-all text-white" 
                title="Encerrar"
              >
                <PowerIcon className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onShowDonation}
                className="p-3 bg-yellow-500 text-black rounded-full shadow-lg shadow-yellow-500/20 active:scale-90 transition-transform"
                title="Apoiar"
              >
                <BanknotesIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={onToggleHandRaise}
                className={`p-3 rounded-full transition-all active:scale-90 ${isHandRaised ? 'bg-orange-500 text-white' : 'bg-white/10 text-white'}`}
                title="Levantar Mão"
              >
                {isHandRaised ? <HandRaisedIcon className="h-5 w-5" /> : <HandRaisedOutline className="h-5 w-5" />}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveStreamSettings;
