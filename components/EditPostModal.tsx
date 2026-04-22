
import React from 'react';
import { User } from '../types';
import CreatePost from './CreatePost';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface EditPostModalProps {
  postId: string;
  currentUser: User;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ postId, currentUser, onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[2100] p-2 bg-white/10 hover:bg-red-500 text-white rounded-xl transition-all backdrop-blur-md"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <div className="p-1">
          <CreatePost 
            currentUser={currentUser} 
            postId={postId} 
            onPostCreated={() => {
              onSuccess();
              onClose();
            }}
            refreshUser={() => {}} 
          />
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
