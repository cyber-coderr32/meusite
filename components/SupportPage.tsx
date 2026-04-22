
import React, { useState, useEffect, useRef } from 'react';
import { User, SupportTicket, SupportMessage, Page } from '../types';
import { 
  getSupportTickets, 
  createSupportTicket, 
  addSupportMessage, 
  uploadFile,
  subscribeToSupportTickets
} from '../services/storageService';
import { useDialog } from '../services/DialogContext';
import { 
  ArrowLeftIcon, 
  LifebuoyIcon, 
  PlusIcon, 
  ChatBubbleLeftRightIcon, 
  PaperClipIcon, 
  PaperAirplaneIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  DocumentIcon, 
  VideoCameraIcon, 
  PhotoIcon, 
  XMarkIcon 
} from '@heroicons/react/24/solid';

interface SupportPageProps {
  currentUser: User;
  onNavigate: (page: Page) => void;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const SupportPage: React.FC<SupportPageProps> = ({ currentUser, onNavigate }) => {
  const { showAlert, showError, showSuccess } = useDialog();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const isPublic = currentUser.id === 'public';
  const [view, setView] = useState<'dashboard' | 'create' | 'chat'>(isPublic ? 'create' : 'dashboard');
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null);
  
  // Create Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'TECHNICAL' | 'BILLING' | 'ABUSE' | 'OTHER'>('TECHNICAL');
  const [description, setDescription] = useState('');
  const [initialFile, setInitialFile] = useState<File | null>(null);
  
  // Chat State
  const [newMessage, setNewMessage] = useState('');
  const [chatFile, setChatFile] = useState<File | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPublic) return;
    const unsubscribe = subscribeToSupportTickets(currentUser.id, (data) => {
        setTickets(data);
        if (currentTicket) {
            const updated = data.find(t => t.id === currentTicket.id);
            if (updated) setCurrentTicket(updated);
        }
    });
    return () => unsubscribe();
  }, [currentUser.id, currentTicket?.id]);

  useEffect(() => {
    if (view === 'chat' && currentTicket) {
        // Auto scroll to bottom
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentTicket?.messages, view]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isChat: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // RIGOROUS SIZE CHECK
    if (file.size > MAX_FILE_SIZE_BYTES) {
        showAlert(`Arquivo muito grande! O limite máximo é estritamente ${MAX_FILE_SIZE_MB}MB.`, { type: 'error' });
        e.target.value = ''; // Reset input
        return;
    }

    if (isChat) setChatFile(file);
    else setInitialFile(file);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setLoading(true);
    try {
        let attachmentUrl = undefined;
        let attachmentType: 'image' | 'video' | undefined = undefined;

        if (initialFile) {
            attachmentUrl = await uploadFile(initialFile, 'support');
            attachmentType = initialFile.type.startsWith('video/') ? 'video' : 'image';
        }

        await createSupportTicket({
            userId: currentUser.id,
            subject,
            category
        }, description, attachmentUrl, attachmentType);

        setView('dashboard');
        setSubject(''); setDescription(''); setInitialFile(null);
        showSuccess("Ticket criado com sucesso! Nossa equipe responderá em breve.");
    } catch (err) {
        showError("Erro ao criar ticket.");
    } finally {
        setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !chatFile) || !currentTicket) return;

    setLoading(true);
    try {
        let attachmentUrl = undefined;
        let attachmentType: 'image' | 'video' | undefined = undefined;

        if (chatFile) {
            attachmentUrl = await uploadFile(chatFile, 'support');
            attachmentType = chatFile.type.startsWith('video/') ? 'video' : 'image';
        }

        await addSupportMessage(currentTicket.id, {
            senderId: currentUser.id,
            text: newMessage,
            attachmentUrl,
            attachmentType
        });

        setNewMessage('');
        setChatFile(null);
    } catch (err) {
        showError("Erro ao enviar mensagem.");
    } finally {
        setLoading(false);
    }
  };

  const openTicket = (ticket: SupportTicket) => {
      setCurrentTicket(ticket);
      setView('chat');
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString();

  return (
    <div className="container mx-auto px-4 pt-24 pb-20 max-w-4xl animate-fade-in min-h-screen">
      
      {/* Header Navigation */}
      <div className="flex items-center gap-4 mb-8">
         <button onClick={() => {
             if (view === 'dashboard' || isPublic) onNavigate(isPublic ? 'auth' : 'settings');
             else setView('dashboard');
         }} className="p-3 bg-white dark:bg-darkcard rounded-2xl shadow-sm text-gray-500 hover:text-blue-600 transition-all">
            <ArrowLeftIcon className="h-6 w-6" />
         </button>
         <div>
            <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter">Central de Suporte</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolva problemas e tire dúvidas</p>
         </div>
      </div>

      {view === 'dashboard' && (
        <div className="space-y-8">
           <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="relative z-10">
                 <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Precisa de Ajuda?</h3>
                 <p className="text-xs font-medium opacity-90 max-w-md">Nossa equipe de especialistas está pronta para resolver qualquer questão técnica, financeira ou de conteúdo.</p>
              </div>
              <button 
                onClick={() => setView('create')}
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all flex items-center gap-2 relative z-10"
              >
                 <PlusIcon className="h-5 w-5 stroke-[3]" /> Abrir Novo Chamado
              </button>
              <LifebuoyIcon className="absolute -right-6 -bottom-6 h-48 w-48 text-white opacity-10 rotate-12" />
           </div>

           <div>
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 ml-2">Meus Tickets</h3>
              <div className="space-y-4">
                 {tickets.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10">
                       <LifebuoyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                       <p className="text-gray-400 font-bold text-xs uppercase">Nenhum ticket encontrado</p>
                    </div>
                 ) : (
                    tickets.map(ticket => (
                       <div 
                         key={ticket.id} 
                         onClick={() => openTicket(ticket)}
                         className="bg-white dark:bg-darkcard p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all group"
                       >
                          <div className="flex items-center gap-4">
                             <div className={`p-4 rounded-2xl ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {ticket.status === 'OPEN' ? <ClockIcon className="h-6 w-6" /> : <CheckCircleIcon className="h-6 w-6" />}
                             </div>
                             <div>
                                <h4 className="font-black text-sm dark:text-white uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">{ticket.subject}</h4>
                                <div className="flex items-center gap-3">
                                   <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded uppercase">{ticket.category}</span>
                                   <span className="text-[9px] text-gray-400 font-medium">Atualizado em: {formatDate(ticket.updatedAt)}</span>
                                </div>
                             </div>
                          </div>
                          <div className="hidden md:block">
                             <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${ticket.status === 'OPEN' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                {ticket.status === 'OPEN' ? 'Em Aberto' : 'Resolvido'}
                             </span>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      )}

      {view === 'create' && (
         <div className="bg-white dark:bg-darkcard p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-white/5 max-w-2xl mx-auto">
            <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-8">Novo Ticket</h3>
             {isPublic && (
                <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-200 dark:border-orange-500/20">
                   <p className="text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Atenção: Você não está logado.</p>
                   <p className="text-xs text-orange-600 dark:text-orange-300/80 mt-1">Para receber atualizações e conversar com o suporte, recomendamos que faça login. Se prosseguir, inclua seu e-mail no assunto ou descrição.</p>
                </div>
             )}
            <form onSubmit={handleCreateTicket} className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block mb-2">Assunto</label>
                  <input 
                    type="text" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)} 
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl outline-none font-bold text-sm dark:text-white focus:ring-2 focus:ring-blue-600 transition-all"
                    placeholder="Resumo do problema..."
                    required
                  />
               </div>
               
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block mb-2">Categoria</label>
                  <div className="grid grid-cols-2 gap-3">
                     {['TECHNICAL', 'BILLING', 'ABUSE', 'OTHER'].map(cat => (
                        <button 
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat as any)}
                          className={`p-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${category === cat ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-transparent bg-gray-50 dark:bg-white/5 text-gray-500'}`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block mb-2">Descrição Detalhada</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl outline-none font-medium text-sm dark:text-white focus:ring-2 focus:ring-blue-600 transition-all h-40 resize-none"
                    placeholder="Descreva o que aconteceu..."
                    required
                  />
               </div>

               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block mb-2">Anexo (Opcional - Máx 5MB)</label>
                  <div 
                    onClick={() => createFileInputRef.current?.click()}
                    className={`w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${initialFile ? 'border-green-500 bg-green-50' : 'border-gray-200 dark:border-white/10 hover:border-blue-500'}`}
                  >
                     <PaperClipIcon className={`h-6 w-6 ${initialFile ? 'text-green-600' : 'text-gray-400'}`} />
                     <p className="text-[10px] font-black uppercase text-gray-500">{initialFile ? initialFile.name : 'Clique para adicionar Print/Vídeo'}</p>
                     <input type="file" ref={createFileInputRef} className="hidden" onChange={e => handleFileSelect(e, false)} accept="image/*,video/*" />
                  </div>
               </div>

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                  {loading ? 'Enviando...' : 'Criar Ticket'}
               </button>
            </form>
         </div>
      )}

      {view === 'chat' && currentTicket && (
         <div className="flex flex-col h-[75vh] bg-white dark:bg-darkcard rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center justify-between">
               <div>
                  <h3 className="font-black text-sm dark:text-white uppercase tracking-tight">{currentTicket.subject}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Ticket #{currentTicket.id.slice(0,8)} • {currentTicket.category}</p>
               </div>
               <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${currentTicket.status === 'OPEN' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                  {currentTicket.status === 'OPEN' ? 'Aberto' : 'Fechado'}
               </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-[#0a0c10]">
               {currentTicket.messages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                     <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-white/10 dark:text-white rounded-tl-none'}`}>
                           {msg.attachmentUrl && (
                              <div className="mb-3 rounded-xl overflow-hidden border border-white/20">
                                 {msg.attachmentType === 'video' ? (
                                    <video src={msg.attachmentUrl} controls className="max-h-48 w-full object-cover" />
                                 ) : (
                                    <img src={msg.attachmentUrl} className="max-h-48 w-full object-cover" alt="attachment" />
                                 )}
                              </div>
                           )}
                           <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                           <p className={`text-[8px] font-bold mt-2 opacity-60 uppercase text-right`}>
                              {isMe ? 'Você' : 'Suporte'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </p>
                        </div>
                     </div>
                  );
               })}
               <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            {currentTicket.status === 'OPEN' && (
                <div className="p-4 bg-white dark:bg-darkcard border-t border-gray-100 dark:border-white/5">
                   {chatFile && (
                      <div className="flex items-center gap-2 mb-3 bg-blue-50 dark:bg-blue-900/10 p-2 rounded-xl w-fit">
                         <DocumentIcon className="h-4 w-4 text-blue-600" />
                         <span className="text-[10px] font-bold text-blue-600 truncate max-w-[200px]">{chatFile.name}</span>
                         <button onClick={() => setChatFile(null)}><XMarkIcon className="h-4 w-4 text-gray-400 hover:text-red-500"/></button>
                      </div>
                   )}
                   <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 hover:text-blue-600 transition-colors"
                      >
                         <PaperClipIcon className="h-5 w-5" />
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={e => handleFileSelect(e, true)} accept="image/*,video/*" />
                      
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-gray-100 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none text-sm font-medium dark:text-white"
                      />
                      
                      <button 
                        type="submit" 
                        disabled={loading || (!newMessage.trim() && !chatFile)}
                        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-90"
                      >
                         <PaperAirplaneIcon className="h-5 w-5" />
                      </button>
                   </form>
                   <p className="text-[8px] text-gray-400 font-bold uppercase mt-2 text-center">Máximo de 5MB por arquivo de mídia.</p>
                </div>
            )}
         </div>
      )}

    </div>
  );
};

export default SupportPage;
