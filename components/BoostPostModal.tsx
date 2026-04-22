
import React, { useState, useMemo, useEffect } from 'react';
import { Post, User, GlobalSettings } from '../types';
import { boostPost, getGlobalSettings } from '../services/storageService';
import { useDialog } from '../services/DialogContext';
import { 
  RocketLaunchIcon, 
  XMarkIcon, 
  UserGroupIcon, 
  EyeIcon, 
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

interface BoostPostModalProps {
  post: Post;
  currentUser: User;
  onClose: () => void;
  onSuccess: () => void;
}

const BOOST_PACKS = [
  { id: 'starter', days: 3, label: 'Básico', reach: '2.5k - 5k' },
  { id: 'pro', days: 7, label: 'Profissional', reach: '15k - 20k', recommended: true },
  { id: 'master', days: 30, label: 'Mestre', reach: '80k - 100k' }
];

const BoostPostModal: React.FC<BoostPostModalProps> = ({ post, currentUser, onClose, onSuccess }) => {
  const { showError, showConfirm } = useDialog();
  const [selectedPackId, setSelectedPackId] = useState(BOOST_PACKS[1].id);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  useEffect(() => {
    getGlobalSettings().then(setSettings);
  }, []);

  const selectedPack = useMemo(() => BOOST_PACKS.find(p => p.id === selectedPackId)!, [selectedPackId]);

  const handleBoost = async () => {
    if (!settings) return;
    const fee = settings.boostFee || 0;
    
    if ((currentUser.balance || 0) < fee) {
      showError(`Saldo insuficiente. O impulso custa $${fee.toFixed(2)} e seu saldo é $${(currentUser.balance || 0).toFixed(2)}`);
      return;
    }

    if (await showConfirm(`Confirmar impulsionamento por $${fee.toFixed(2)}?`)) {
      setLoading(true);
      const success = await boostPost(post.id, currentUser.id, selectedPack.days);
      if (success) {
        onSuccess();
        onClose();
      } else {
        showError('Erro ao processar impulsionamento. Verifique seu saldo.');
      }
      setLoading(false);
    }
  };

  const fee = settings?.boostFee || 0;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-darkcard w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="mb-8 flex items-center gap-4">
           <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
              <RocketLaunchIcon className="h-8 w-8" />
           </div>
           <div>
              <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Impulsionar Post</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Destaque seu conteúdo na rede</p>
           </div>
        </div>

        <div className="mb-10 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-white/5">
           {post.imageUrl ? (
             <img src={post.imageUrl} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
           ) : (
             <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <BoltIcon className="h-8 w-8" />
             </div>
           )}
           <p className="text-sm font-medium dark:text-gray-200 line-clamp-2 italic">"{post.content || 'Publicação de Mídia'}"</p>
        </div>

        <div className="space-y-4">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Escolha seu Plano de Alcance</label>
           <div className="grid grid-cols-1 gap-3">
              {BOOST_PACKS.map(pack => (
                <button 
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`relative p-5 rounded-3xl border-2 transition-all flex items-center justify-between group ${selectedPackId === pack.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/10 shadow-xl' : 'border-gray-50 dark:border-white/5 hover:border-gray-200'}`}
                >
                   {pack.recommended && (
                     <span className="absolute -top-3 left-6 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-widest">
                       <SparklesIcon className="h-2 w-2" /> Recomendado
                     </span>
                   )}
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${selectedPackId === pack.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                         <UserGroupIcon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                         <p className="font-black text-sm dark:text-white uppercase">{pack.label}</p>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{pack.days} Dias • {pack.reach} Reach</p>
                      </div>
                   </div>
                   <p className="text-lg font-black text-blue-600 uppercase">${fee > 0 ? fee.toFixed(2) : 'Grátis'}</p>
                </button>
              ))}
           </div>
        </div>

        <div className="mt-10 pt-6 border-t dark:border-white/5">
           <button 
             onClick={handleBoost}
             disabled={loading}
             className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${loading ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
           >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <><BoltIcon className="h-5 w-5" /> Ativar Impulsionamento Agora</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default BoostPostModal;
