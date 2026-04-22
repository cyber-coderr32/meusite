
import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, VideoCameraIcon, StopIcon, ArrowPathIcon, MusicalNoteIcon, SparklesIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { AudioTrack } from '../types';
import { uploadFile } from '../services/storageService';
import AudioSelectionModal from './AudioSelectionModal';
import { useDialog } from '../services/DialogContext';

interface RecordReelModalProps {
  onClose: () => void;
  onSave: (videoBlob: Blob, audioTrackId?: string, aiPrompt?: string, filter?: string) => void;
}

const VIDEO_FILTERS = [
  { id: 'none', label: 'Normal', css: '' },
  { id: 'grayscale(1) contrast(1.2)', label: 'Noir', css: 'grayscale(1) contrast(1.2)' },
  { id: 'sepia(0.6) saturate(1.5)', label: 'Vintage', css: 'sepia(0.6) saturate(1.5)' },
  { id: 'hue-rotate(90deg) brightness(1.2)', label: 'Neon', css: 'hue-rotate(90deg) brightness(1.2)' },
  { id: 'saturate(2.5) contrast(1.1)', label: 'Vibrante', css: 'saturate(2.5) contrast(1.1)' },
  { id: 'invert(0.9) hue-rotate(180deg)', label: 'Raio-X', css: 'invert(0.9) hue-rotate(180deg)' },
  { id: 'blur(1.5px) saturate(1.8)', label: 'Sonho', css: 'blur(1.5px) saturate(1.8)' },
  { id: 'contrast(1.5) brightness(0.8)', label: 'Drama', css: 'contrast(1.5) brightness(0.8)' },
  { id: 'sepia(0.2) brightness(1.3) contrast(0.9)', label: 'Brilho', css: 'sepia(0.2) brightness(1.3) contrast(0.9)' },
];

const MAX_RECORDING_TIME = 180; // 3 minutos

const RecordReelModal: React.FC<RecordReelModalProps> = ({ onClose, onSave }) => {
  const { showError } = useDialog();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [timer, setTimer] = useState(0);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAudioId, setSelectedAudioId] = useState<string | undefined>(undefined);
  const [selectedFilter, setSelectedFilter] = useState(VIDEO_FILTERS[0]);
  const [aiPrompt, setAiPrompt] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', aspectRatio: 9/16 }, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      showError("Permissão de câmera negada ou erro no hardware.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedVideo(blob);
    };
    
    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setTimer(0);
    
    timerIntervalRef.current = window.setInterval(() => {
      setTimer(prev => {
        if (prev >= MAX_RECORDING_TIME) {
          stopRecording();
          return MAX_RECORDING_TIME;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleSave = () => {
    if (recordedVideo) {
      // Passamos o blob para o pai (CreatePost) que fará o upload real
      onSave(recordedVideo, selectedAudioId, aiPrompt, selectedFilter.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col animate-fade-in overflow-hidden">
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md hover:bg-white/20 transition-all">
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <div className="flex flex-col items-center">
           <div className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] transition-colors ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-white/20 backdrop-blur-md'}`}>
             {isRecording ? `Gravando • ${formatTime(timer)}` : 'Crie seu Reel'}
           </div>
        </div>
        <div className="w-12"></div>
      </div>

      <div className="flex-1 relative bg-[#050505] flex items-center justify-center">
        {!recordedVideo ? (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover scale-x-[-1]" 
            style={{ filter: selectedFilter.id === 'none' ? 'none' : selectedFilter.id }}
          />
        ) : (
          <video 
            src={URL.createObjectURL(recordedVideo)} 
            autoPlay 
            loop 
            playsInline 
            className="w-full h-full object-cover" 
            style={{ filter: selectedFilter.id === 'none' ? 'none' : selectedFilter.id }}
          />
        )}

        {!isRecording && !recordedVideo && !showFilters && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-40">
             <button onClick={() => setShowAudioModal(true)} className="flex flex-col items-center gap-1.5 group">
                <div className={`p-4 rounded-2xl backdrop-blur-xl border border-white/20 transition-all shadow-2xl ${selectedAudioId ? 'bg-blue-600' : 'bg-black/40 group-hover:bg-black/60'}`}>
                  <MusicalNoteIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-[8px] font-black text-white uppercase tracking-widest shadow-lg">Áudio</span>
             </button>
             
             <button onClick={() => setShowFilters(true)} className="flex flex-col items-center gap-1.5 group">
                <div className="p-4 bg-black/40 rounded-2xl backdrop-blur-xl border border-white/20 transition-all shadow-2xl group-hover:bg-black/60">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-[8px] font-black text-white uppercase tracking-widest shadow-lg">Filtros</span>
             </button>
          </div>
        )}

        {showFilters && !isRecording && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/20 animate-fade-in" onClick={() => setShowFilters(false)}>
             <div className="w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-20 pb-10 px-0 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-8 mb-6">
                   <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Estilos Criativos</h4>
                   <button onClick={() => setShowFilters(false)} className="bg-white/10 p-2 rounded-full text-white hover:bg-white/20 transition-all">
                      <CheckIcon className="h-4 w-4" />
                   </button>
                </div>
                <div className="flex gap-4 px-8 overflow-x-auto no-scrollbar scroll-smooth py-2">
                   {VIDEO_FILTERS.map(filter => (
                     <button key={filter.id} onClick={() => setSelectedFilter(filter)} className="flex flex-col items-center gap-3 shrink-0 group transition-transform active:scale-95">
                        <div className={`w-16 h-16 rounded-2xl border-2 transition-all duration-300 overflow-hidden relative ${selectedFilter.id === filter.id ? 'border-blue-500 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border-white/20 opacity-60'}`}>
                           <div className="w-full h-full bg-gradient-to-tr from-gray-800 to-gray-700" style={{ filter: filter.id === 'none' ? 'none' : filter.id }}></div>
                           {selectedFilter.id === filter.id && (
                             <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20">
                                <CheckIcon className="h-5 w-5 text-white" />
                             </div>
                           )}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${selectedFilter.id === filter.id ? 'text-blue-400' : 'text-white/40'}`}>{filter.label}</span>
                     </button>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-10 bg-gradient-to-t from-black via-black/60 to-transparent z-50 flex flex-col items-center gap-8">
        {!recordedVideo ? (
          <div className="flex items-center gap-10">
             <div className="w-12"></div>
             <button onClick={isRecording ? stopRecording : startRecording} className={`relative group transition-all duration-500 ${isRecording ? 'scale-110' : 'hover:scale-105'}`}>
                <div className={`absolute inset-0 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity ${isRecording ? 'bg-red-600' : 'bg-white'}`}></div>
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center relative z-10 ${isRecording ? 'border-red-600 bg-red-600/20' : 'border-white bg-white/10'}`}>
                  {isRecording ? <StopIcon className="h-10 w-10 text-red-600" /> : <div className="w-14 h-14 bg-red-600 rounded-full shadow-2xl" />}
                </div>
             </button>
             <button className="p-3 bg-white/10 rounded-full text-white/40 hover:text-white transition-all">
                <ArrowPathIcon className="h-6 w-6" />
             </button>
          </div>
        ) : (
          <div className="w-full max-w-lg animate-fade-in space-y-8">
            <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
               <div className="flex items-center gap-3 mb-5">
                  <div className="bg-purple-600 p-2 rounded-xl"><SparklesIcon className="h-5 w-5 text-white" /></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Refinar Estilo com IA</span>
               </div>
               <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Ex: Estilo Ghibli, Realismo Fantástico..."
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-5 text-sm text-white placeholder-white/20 focus:ring-0 focus:border-purple-500 transition-all font-bold"
               />
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setRecordedVideo(null); setAiPrompt(''); }} className="flex-1 py-5 bg-white/10 rounded-3xl text-white font-black text-xs uppercase transition-all flex items-center justify-center gap-3 border border-white/5">
                <ArrowPathIcon className="h-4 w-4" /> Refazer
              </button>
              <button onClick={handleSave} className="flex-[2] py-5 bg-blue-600 rounded-3xl text-white font-black text-xs uppercase shadow-xl transition-all flex items-center justify-center gap-3">
                <CheckIcon className="h-5 w-5" /> Usar Vídeo
              </button>
            </div>
          </div>
        )}
      </div>
      {showAudioModal && <AudioSelectionModal onClose={() => setShowAudioModal(false)} onSelectTrack={(id) => { setSelectedAudioId(id); setShowAudioModal(false); }} />}
    </div>
  );
};

export default RecordReelModal;
