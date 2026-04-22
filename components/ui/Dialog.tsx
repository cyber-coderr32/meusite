
import React from 'react';
import { createPortal } from 'react-dom';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export type DialogType = 'alert' | 'confirm' | 'success' | 'error';

interface DialogProps {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'alert':
      case 'error':
        return <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-12 w-12 text-emerald-500" />;
      case 'confirm':
        return <InformationCircleIcon className="h-12 w-12 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-12 w-12 text-blue-500" />;
    }
  };

  const getThemeColor = () => {
    switch (type) {
      case 'alert':
      case 'error':
        return 'bg-red-600 hover:bg-red-700 shadow-red-500/20';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20';
      case 'confirm':
        return 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20';
      default:
        return 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel || onConfirm}
      />
      <div
        className="relative w-full max-w-sm bg-white dark:bg-[#1a1d23] rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10"
      >
        <div className="p-8 flex flex-col items-center text-center">
          <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-3xl">
            {getIcon()}
          </div>
          
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${getThemeColor()}`}
            >
              {confirmText}
            </button>
            
            {type === 'confirm' && onCancel && (
              <button
                onClick={onCancel}
                className="w-full py-4 rounded-2xl text-gray-500 dark:text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
        
        <button 
          onClick={onCancel || onConfirm}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
