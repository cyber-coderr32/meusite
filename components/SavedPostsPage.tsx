
import React, { useState, useEffect } from 'react';
import { User, Post, Page } from '../types';
import { getSavedPosts } from '../services/storageService';
import PostCard from './PostCard';
import { BookmarkIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface SavedPostsPageProps {
  currentUser: User;
  onNavigate: (page: Page, params?: any) => void;
  refreshUser: () => void;
}

const SavedPostsPage: React.FC<SavedPostsPageProps> = ({ currentUser, onNavigate, refreshUser }) => {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    const posts = await getSavedPosts(currentUser.id);
    setSavedPosts(posts);
    setLoading(false);
  };

  useEffect(() => {
    fetchSaved();
  }, [currentUser.id]);

  return (
    <div className="container mx-auto px-4 pt-6 pb-24 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onNavigate('feed')}
          className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-100 dark:border-white/5"
        >
          <ArrowLeftIcon className="h-5 w-5 dark:text-white" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Itens Guardados</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sua coleção pessoal</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Carregando sua coleção...</p>
        </div>
      ) : savedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-darkcard rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-xl px-10">
          <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-full mb-6">
            <BookmarkIcon className="h-12 w-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Nada por aqui ainda</h3>
          <p className="text-gray-500 text-sm max-w-xs mb-8">Salve posts interessantes para encontrá-los facilmente depois.</p>
          <button 
            onClick={() => onNavigate('feed')}
            className="bg-brand hover:bg-brandHover text-white px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-lg transition-all"
          >
            Explorar Feed
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {savedPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={currentUser} 
              onNavigate={onNavigate} 
              onPostUpdatedOrDeleted={fetchSaved}
              refreshUser={refreshUser}
              onFollowToggle={() => refreshUser()}
              onPinToggle={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPostsPage;
