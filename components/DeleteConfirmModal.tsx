
import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/solid';

interface DeleteConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ onClose, onConfirm, loading }) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-darkcard w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border border-red-100 dark:border-red-900/20 overflow-hidden animate-scale-in">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Excluir Post?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
            Esta ação é irreversível. Todo o conteúdo, curtidas e comentários desta publicação serão removidos permanentemente da rede.
          </p>
          
          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={onConfirm}
              disabled={loading}
              className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-red-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
              ) : (
                <><TrashIcon className="h-5 w-5" /> Sim, Excluir Agora</>
              )}
            </button>
            
            <button 
              onClick={onClose}
              className="w-full py-4 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl font-black text-sm uppercase hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
