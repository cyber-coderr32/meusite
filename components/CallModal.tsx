
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatConversation } from '../types';
import { 
  XMarkIcon, 
  MicrophoneIcon, 
  VideoCameraIcon, 
  PhoneIcon,
  SpeakerWaveIcon,
  VideoCameraSlashIcon,
  ArrowPathIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';
import { DEFAULT_PROFILE_PIC } from '../data/constants';
import { useDialog } from '../services/DialogContext';

interface CallModalProps {
  partner?: User;
  group?: ChatConversation;
  type: 'voice' | 'video';
  onClose: () => void;
}

const CallModal: React.FC<CallModalProps> = ({ partner, group, type, onClose }) => {
  const { showError } = useDialog();
  const [status, setStatus] = useState<'calling' | 'connected'>('calling');
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(type === 'voice');
  const [volumeLevel, setVolumeLevel] = useState(0);
  
  const miniVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isGroup = !!group;
  const displayName = isGroup ? group.groupName : `${partner?.firstName} ${partner?.lastName}`;
  const displayImage = isGroup ? group.groupImage || DEFAULT_PROFILE_PIC : partner?.profilePicture || DEFAULT_PROFILE_PIC;

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: type === 'video' 
        });
        
        streamRef.current = stream;
        
        if (miniVideoRef.current && type === 'video') {
          miniVideoRef.current.srcObject = stream;
        }

        // Setup Audio Analysis for Voice Visualizer
        if (stream.getAudioTracks().length > 0) {
          setupAudioAnalyser(stream);
        }
        
        // Simulate connection delay
        const ringingTimeout = setTimeout(() => setStatus('connected'), 3000);
        return () => clearTimeout(ringingTimeout);
      } catch (err) {
        console.error("Erro ao acessar mídia:", err);
        showError("Não foi possível acessar a câmera ou microfone.");
        onClose();
      }
    };

    startMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [type]);

  const setupAudioAnalyser = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      setVolumeLevel(average); 
      
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();
  };

  useEffect(() => {
    let interval: any;
    if (status === 'connected') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-[#0a0c10] flex flex-col items-center justify-center animate-fade-in text-white overflow-hidden font-sans">
      
      {/* BACKGROUND / REMOTE VIDEO AREA */}
      <div className="absolute inset-0 z-0">
        {status === 'connected' && type === 'video' && !isGroup ? (
          // 1-on-1 Video Call Layout
          <div className="w-full h-full relative overflow-hidden bg-black">
             {/* Simulated Remote Video (using profile pic with blur/motion) */}
             <img 
               src={displayImage} 
               className="w-full h-full object-cover blur-[50px] scale-150 opacity-40 animate-slow-zoom" 
               alt="Background"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={displayImage} 
                  className="w-48 h-48 md:w-64 md:h-64 rounded-[4rem] object-cover border-4 border-white/10 shadow-2xl animate-pulse" 
                  alt={displayName}
                />
                <div className="absolute bottom-1/4 bg-blue-600/90 backdrop-blur-md px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl border border-white/10">
                   Vídeo de {partner?.firstName}
                </div>
             </div>
          </div>
        ) : status === 'connected' && isGroup ? (
          // Group Call Grid Layout (Simulated)
          <div className="w-full h-full p-4 grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto">
             {/* Self */}
             <div className="relative bg-gray-800 rounded-2xl overflow-hidden border border-white/10">
                <video ref={miniVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`} />
                {isCameraOff && (
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center"><UserGroupIcon className="h-8 w-8 text-white"/></div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold">Você</div>
             </div>
             {/* Simulated Participants */}
             {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="relative bg-gray-800 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold animate-pulse">
                      P{i}
                   </div>
                   <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold">Participante {i}</div>
                </div>
             ))}
          </div>
        ) : (
          // Calling / Audio State
          <div className="w-full h-full relative overflow-hidden">
             <img 
               src={displayImage} 
               className="w-full h-full object-cover blur-[80px] scale-150 opacity-30 transition-transform duration-[10s] animate-slow-zoom" 
               alt="Calling Background"
             />
          </div>
        )}
      </div>

      {/* MINI LOCAL VIEW (Self View for 1-on-1) */}
      {!isGroup && type === 'video' && (
        <div className={`absolute top-10 right-6 w-32 h-44 md:w-40 md:h-56 bg-gray-900 rounded-[2rem] border-2 border-white/20 overflow-hidden shadow-2xl z-50 transition-all duration-700 ${isCameraOff ? 'scale-0' : 'scale-100'}`}>
           <video ref={miniVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
           <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase border border-white/10">
              Você
           </div>
        </div>
      )}

      {/* UI CENTRAL - CALLING INFO */}
      {!isGroup && (
        <div className="relative z-10 flex flex-col items-center mb-20 text-center px-6">
           {/* Voice Waves (Visualizer) */}
           <div className={`relative mb-8 transition-all duration-700 ${status === 'connected' && type === 'video' ? 'scale-0 opacity-0 h-0' : 'scale-100 opacity-100'}`}>
              <div 
                className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"
                style={{ 
                  transform: `scale(${1 + (volumeLevel / 150)})`,
                  opacity: volumeLevel > 5 ? 0.4 : 0 
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full bg-blue-400/10"
                style={{ 
                  transform: `scale(${1.2 + (volumeLevel / 120)})`,
                  transition: 'transform 0.1s ease-out'
                }}
              ></div>
              
              <div className={`relative w-32 h-32 md:w-48 md:h-48 rounded-[3rem] md:rounded-[4rem] overflow-hidden border-4 ${status === 'connected' ? 'border-green-500' : 'border-blue-500'} shadow-[0_0_80px_rgba(37,99,235,0.4)] transition-all duration-700`}>
                 <img src={displayImage} className="w-full h-full object-cover" alt={displayName} />
              </div>
           </div>

           <div className={`transition-all duration-700 ${status === 'connected' && type === 'video' ? 'fixed top-12 left-10 text-left' : 'translate-y-0 text-center'}`}>
              <h2 className={`font-black tracking-tighter uppercase mb-2 drop-shadow-2xl transition-all ${status === 'connected' && type === 'video' ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl'}`}>
                {displayName}
              </h2>
              <div className={`flex items-center gap-3 ${status === 'connected' && type === 'video' ? 'justify-start' : 'justify-center'}`}>
                 <span className={`w-2.5 h-2.5 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-blue-500 animate-bounce'}`}></span>
                 <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">
                    {status === 'calling' ? 'Conectando...' : formatTime(timer)}
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* CALL CONTROLS */}
      <div className="absolute bottom-12 left-0 right-0 z-[100] flex items-center justify-center gap-4 md:gap-8 px-4">
         
         <div className="flex bg-white/10 backdrop-blur-2xl rounded-[3.5rem] p-3 border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] items-center gap-3">
            
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-5 md:p-6 rounded-full transition-all active:scale-90 ${isMuted ? 'bg-red-500 text-white shadow-lg' : 'bg-white/5 text-white hover:bg-white/20'}`}
              title="Microfone"
            >
               <MicrophoneIcon className="h-6 w-6 md:h-7 md:w-7" />
            </button>

            {type === 'video' && (
              <button 
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-5 md:p-6 rounded-full transition-all active:scale-90 ${isCameraOff ? 'bg-red-500 text-white' : 'bg-white/5 text-white hover:bg-white/20'}`}
                title="Câmera"
              >
                 {isCameraOff ? <VideoCameraSlashIcon className="h-6 w-6 md:h-7 md:w-7" /> : <VideoCameraIcon className="h-6 w-6 md:h-7 md:w-7" />}
              </button>
            )}

            <button className="p-5 md:p-6 bg-white/5 rounded-full text-white hover:bg-white/20 transition-all hidden sm:block">
               <SpeakerWaveIcon className="h-6 w-6 md:h-7 md:w-7" />
            </button>

            <button className="p-5 md:p-6 bg-white/5 rounded-full text-white hover:bg-white/20 transition-all">
               <ArrowPathIcon className="h-6 w-6 md:h-7 md:w-7" />
            </button>
            
            <button 
              onClick={onClose}
              className="p-6 md:p-7 bg-red-600 rounded-full shadow-[0_15px_30px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 transition-all group ml-2"
              title="Desligar"
            >
               <PhoneIcon className="h-8 w-8 md:h-9 md:w-9 rotate-[135deg] text-white" />
            </button>
         </div>

      </div>

      <style>{`
        .mirror { transform: scaleX(-1); }
        @keyframes slow-zoom {
          0% { transform: scale(1.5) rotate(0deg); }
          50% { transform: scale(1.7) rotate(3deg); }
          100% { transform: scale(1.5) rotate(0deg); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 25s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CallModal;
