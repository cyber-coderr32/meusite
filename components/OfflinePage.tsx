
import React from 'react';
import { WifiIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface OfflinePageProps {
  onRetry?: () => void;
  onContinueOffline?: () => void;
}

const OfflinePage: React.FC<OfflinePageProps> = ({ onRetry, onContinueOffline }) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white dark:bg-[#0a0c10] text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-500/10 blur-[60px] rounded-full scale-150 animate-pulse"></div>
        <div className="relative z-10 w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center shadow-2xl border border-gray-100 dark:border-white/5">
          <WifiIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 absolute bottom-3 right-3 animate-bounce" />
        </div>
      </div>

      <div className="max-w-xs md:max-w-md">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-4 leading-none">
          VOCÊ ESTÁ <span className="text-red-500">OFFLINE</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-8 leading-relaxed">
          Parece que sua conexão com a internet foi interrompida. Verifique seu Wi-Fi ou dados móveis para continuar usando o CyBerPhone.
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-3xl font-black uppercase text-xs shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
          >
            <ArrowPathIcon className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
            Tentar Novamente
          </button>

          {onContinueOffline && (
            <button 
              onClick={onContinueOffline}
              className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-3xl font-black uppercase text-xs active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Continuar Offline (Leitura)
            </button>
          )}
          
          <div className="grid grid-cols-2 gap-3">
             <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 text-left">
                <span className="block text-[8px] font-black uppercase text-gray-400 mb-1">Status</span>
                <span className="text-[10px] font-bold dark:text-white uppercase tracking-tight">Sem Conexão</span>
             </div>
             <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 text-left">
                <span className="block text-[8px] font-black uppercase text-gray-400 mb-1">Local</span>
                <span className="text-[10px] font-bold dark:text-white uppercase tracking-tight">App Local</span>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/5 w-full max-w-xs text-center">
         <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">
            CyBerPhone OS &bull; Offline Mode 1.0
         </p>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default OfflinePage;
