
import React, { useState, useEffect, useRef } from 'react';
import { AdCampaign, User } from '../types';
import { findUserById } from '../services/storageService';
import { DEFAULT_PROFILE_PIC } from '../data/constants';
import { 
  MegaphoneIcon, 
  GlobeAltIcon, 
  ArrowTopRightOnSquareIcon, 
  SparklesIcon, 
  CheckBadgeIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/solid';

interface AdCardProps {
  ad: AdCampaign;
  isSidebar?: boolean;
  rank?: number; 
}

const AdCard: React.FC<AdCardProps> = ({ ad, isSidebar = false, rank = 0 }) => {
  const [professor, setProfessor] = useState<User | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await findUserById(ad.professorId);
      setProfessor(user || null);
    };
    fetchUser();

    if (!isSidebar) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (cardRef.current) observer.unobserve(cardRef.current);
        }
      }, { threshold: 0.1 });

      if (cardRef.current) observer.observe(cardRef.current);
      return () => observer.disconnect();
    } else {
      setIsVisible(true);
    }
  }, [ad.professorId, isSidebar]);

  if (!professor) return null;

  const getPrestigeBadge = () => {
    if (rank === 0) return { label: 'Recomendado', color: 'bg-blue-600 text-white', icon: StarIcon };
    if (rank === 1) return { label: 'Tendência', color: 'bg-indigo-600 text-white', icon: FireIcon };
    if (rank === 2) return { label: 'Destaque', color: 'bg-emerald-600 text-white', icon: SparklesIcon };
    return { label: 'Sugestão', color: 'bg-gray-800 text-gray-100', icon: CheckBadgeIcon };
  };

  const badge = getPrestigeBadge();

  if (isSidebar) {
    return (
      <div className="bg-white dark:bg-darkcard p-4 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
         <div className="relative h-32 rounded-2xl overflow-hidden mb-3">
            <img src={ad.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
            <div className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-md text-white text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
               <badge.icon className="h-2 w-2" /> {badge.label}
            </div>
         </div>
         <h5 className="font-black text-[11px] text-gray-900 dark:text-white uppercase truncate mb-1">{ad.title}</h5>
         <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight mb-3">{ad.description}</p>
         <a href={ad.linkUrl} target="_blank" className="w-full py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase text-center block transition-all hover:bg-blue-700 shadow-md">
           {ad.ctaText || 'Ver Agora'}
         </a>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className={`bg-white dark:bg-darkcard rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden relative group transform transition-all duration-[900ms] cubic-bezier(0.16, 1, 0.3, 1) ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
    >
      <div className="absolute top-0 right-0 z-10">
         <div className={`${badge.color} px-6 py-2 rounded-bl-[2rem] flex items-center gap-2 shadow-xl border-l border-b border-white/10`}>
            <badge.icon className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{badge.label} CyBer</span>
         </div>
      </div>

      <div className="p-6 flex items-center gap-4 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
        <div className="relative">
          <img src={professor.profilePicture || DEFAULT_PROFILE_PIC} className="w-14 h-14 rounded-2xl object-cover shadow-xl border-2 border-white dark:border-white/10" />
          <div className="absolute -bottom-1 -right-1 bg-blue-600 p-0.5 rounded-lg border-2 border-white dark:border-darkcard shadow-md">
            <CheckBadgeIcon className="h-3 w-3 text-white" />
          </div>
        </div>
        <div>
          <h4 className="font-black text-gray-900 dark:text-white uppercase text-base tracking-tighter">{professor.firstName} {professor.lastName}</h4>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1 opacity-80">
             <GlobeAltIcon className="h-3 w-3" /> Especialista Verificado
          </p>
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 leading-tight uppercase">{ad.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed mb-8 italic">"{ad.description}"</p>
        
        {ad.imageUrl && (
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 group-hover:border-blue-500/30 transition-colors">
             <img src={ad.imageUrl} className="w-full h-auto max-h-[450px] object-cover transition-transform duration-1000 group-hover:scale-105" alt={ad.title} />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
             <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                   <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Oportunidade Exclusiva</p>
                   <h3 className="text-white text-xl font-black tracking-tighter uppercase leading-none drop-shadow-lg">{ad.title}</h3>
                </div>
                <a 
                  href={ad.linkUrl} 
                  target="_blank" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 border-b-4 border-blue-800"
                >
                  {ad.ctaText || 'Saiba Mais'} <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </a>
             </div>
          </div>
        )}
      </div>

      <div className="px-8 py-4 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2 text-gray-400">
            <FireIcon className="h-4 w-4 text-orange-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Relevância em Alta</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-darkcard bg-gray-200 overflow-hidden">
                   <img src={`https://picsum.photos/32/32?random=${i + (ad.id.length)}`} className="w-full h-full object-cover" />
                 </div>
               ))}
            </div>
            <span className="text-[10px] font-black text-blue-600">Alta Procura</span>
         </div>
      </div>
    </div>
  );
};

export default AdCard;
