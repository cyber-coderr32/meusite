
import React from 'react';
import { ChatConversation } from '../types';
import { UserGroupIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface GroupDiscoveryCardProps {
  group: ChatConversation;
  onJoin: () => void;
}

const GroupDiscoveryCard: React.FC<GroupDiscoveryCardProps> = ({ group, onJoin }) => {
  return (
    <div className="bg-white dark:bg-darkcard rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group animate-fade-in">
       <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <UserGroupIcon className="h-32 w-32 text-blue-600" />
       </div>
       
       <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-10">
          <img 
            src={group.groupImage || `https://picsum.photos/200/200?random=${group.id}`} 
            className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white dark:border-white/10" 
            alt={group.groupName}
          />
          
          <div className="flex-1 text-center md:text-left">
             <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-3">
                <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                   <SparklesIcon className="h-3 w-3" /> Comunidade Sugerida
                </span>
                <span className="bg-gray-100 dark:bg-white/5 text-gray-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                   {group.participants.length} Membros
                </span>
             </div>
             
             <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2 leading-tight">
                {group.groupName}
             </h3>
             
             <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 line-clamp-2 italic">
                "{group.description || 'Uma nova comunidade de aprendizado e networking exclusivo na CyBerPhone.'}"
             </p>
             
             <button 
               onClick={(e) => { e.stopPropagation(); onJoin(); }}
               className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 tracking-[0.2em] border-b-4 border-blue-800"
             >
                <PlusIcon className="h-5 w-5 stroke-[3]" /> Aderir ao Grupo
             </button>
          </div>
       </div>
    </div>
  );
};

export default GroupDiscoveryCard;
