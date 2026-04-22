
import React, { createContext, useContext, useState, useCallback } from 'react';
import Dialog, { DialogType } from '../components/ui/Dialog';

interface DialogOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
}

interface DialogContextType {
  showAlert: (message: string, options?: DialogOptions) => void;
  showConfirm: (message: string, options?: DialogOptions) => Promise<boolean>;
  showSuccess: (message: string, options?: DialogOptions) => void;
  showError: (message: string, options?: DialogOptions) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<DialogType>('alert');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirmText, setConfirmText] = useState('Confirmar');
  const [cancelText, setCancelText] = useState('Cancelar');
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showAlert = useCallback((msg: string, options?: DialogOptions) => {
    setMessage(msg);
    setTitle(options?.title || 'Aviso');
    setType(options?.type || 'alert');
    setConfirmText(options?.confirmText || 'OK');
    setIsOpen(true);
    setResolvePromise(null);
  }, []);

  const showSuccess = useCallback((msg: string, options?: DialogOptions) => {
    setMessage(msg);
    setTitle(options?.title || 'Sucesso');
    setType('success');
    setConfirmText(options?.confirmText || 'OK');
    setIsOpen(true);
    setResolvePromise(null);
  }, []);

  const showError = useCallback((msg: string, options?: DialogOptions) => {
    setMessage(msg);
    setTitle(options?.title || 'Erro');
    setType('error');
    setConfirmText(options?.confirmText || 'OK');
    setIsOpen(true);
    setResolvePromise(null);
  }, []);

  const showConfirm = useCallback((msg: string, options?: DialogOptions) => {
    setMessage(msg);
    setTitle(options?.title || 'Confirmar');
    setType('confirm');
    setConfirmText(options?.confirmText || 'Sim');
    setCancelText(options?.cancelText || 'Não');
    setIsOpen(true);
    
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm, showSuccess, showError }}>
      {children}
      <Dialog
        isOpen={isOpen}
        type={type}
        title={title}
        message={message}
        onConfirm={handleConfirm}
        onCancel={type === 'confirm' ? handleCancel : undefined}
        confirmText={confirmText}
        cancelText={cancelText}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
