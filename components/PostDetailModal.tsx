
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Post, User, Comment, Page, NotificationType } from '../types';
import { findUserById, addPostComment, deleteComment, updatePostLikes, updatePostSaves, updatePostShares, toggleFollowUser, generateUUID, getPosts, toggleReaction, addCommentReply, createNotification } from '../services/storageService';
import { useDialog } from '../services/DialogContext';
import { DEFAULT_PROFILE_PIC } from '../data/constants';
import ShareModal from './ShareModal';
import { 
  XMarkIcon, 
  ChatBubbleOvalLeftIcon,
  HeartIcon as HeartIconOutline,
  BookmarkIcon as BookmarkIconOutline,
  ShareIcon,
  EllipsisHorizontalIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid, 
  BookmarkIcon as BookmarkIconSolid,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';

interface PostDetailModalProps {
  post: Post;
  currentUser: User;
  onClose: () => void;
  onUpdate: () => void;
  onNavigate: (page: Page, params?: Record<string, string>) => void;
  refreshUser: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, currentUser, onClose, onUpdate, onNavigate, refreshUser }) => {
  const { showAlert, showConfirm } = useDialog();
  const [commentText, setCommentText] = useState('');
  const [author, setAuthor] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string, userName: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const EMOJIS = ['❤️', '🔥', '😂', '😮', '😢', '👍'];
  
  useEffect(() => {
    const fetchAuthor = async () => {
      const user = await findUserById(post.userId);
      setAuthor(user || null);
    };
    fetchAuthor();
  }, [post.userId]);

  // Função para buscar comentários atualizados
  const fetchComments = async () => {
    // setLoadingComments(true); // Opcional: evitar flicker
    const allPosts = await getPosts();
    const currentPost = allPosts.find(p => p.id === post.id);
    if (currentPost) {
      setComments(currentPost.comments || []);
    }
    setLoadingComments(false);
  };

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const isOwner = currentUser.id === post.userId;
  const isFollowing = currentUser.followedUsers?.includes(post.userId);
  const hasLiked = post.likes?.includes(currentUser.id);
  const hasSaved = post.saves?.includes(currentUser.id);
  const commentsDisabled = post.disableComments && !isOwner;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePostLikes(post.id, currentUser.id);
    onUpdate();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePostSaves(post.id, currentUser.id);
    onUpdate();
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.imageUrl) return;
    
    try {
      const response = await fetch(post.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cyberphone-midia-${post.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(post.imageUrl, '_blank');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(currentUser.id, post.userId);
    refreshUser();
    onUpdate();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (await showConfirm("Apagar este comentário?")) {
        await deleteComment(post.id, commentId);
        await fetchComments();
        onUpdate();
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || commentsDisabled) return;
    
    try {
      const newComment: Comment = {
        id: generateUUID(),
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        profilePic: currentUser.profilePicture,
        text: commentText,
        timestamp: Date.now()
      };

      if (replyingTo) {
        await addCommentReply(post.id, replyingTo.id, newComment);
        const targetComment = comments.find(c => c.id === replyingTo.id);
        if (targetComment && targetComment.userId !== currentUser.id) {
           await createNotification(targetComment.userId, currentUser.id, NotificationType.COMMENT, post.id);
        }
        setReplyingTo(null);
      } else {
        await addPostComment(post.id, newComment);
      }
      
      setCommentText('');
      
      // Atualiza a lista localmente e notifica o pai
      await fetchComments();
      onUpdate();

      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    } catch (err: any) {
      if (err.message?.includes('SENTINEL_BLOCK')) {
        showAlert(err.message.replace('SENTINEL_BLOCK: ', ''), { type: 'error', title: 'Sentinela de Segurança' });
      } else {
        showAlert("Falha ao enviar comentário.", { type: 'error' });
      }
    }
  };

  const handleToggleReaction = async (commentId: string, emoji: string) => {
    await toggleReaction(commentId, 'COMMENT', emoji, currentUser.id, post.id);
    await fetchComments();
    onUpdate();
  };

  if (!author) return null;

  const hasBg = post.backgroundColor && post.backgroundColor !== 'transparent';
  const contentLength = post.content?.length || 0;

  // Lógica Adaptativa de Tamanho (Consistente com PostCard)
  let containerMinHeight = 'auto';
  let fontSizeClass = 'text-base md:text-lg text-left text-gray-900 dark:text-white';
  let paddingClass = 'p-0'; // Default no padding for plain text in modal

  if (hasBg) {
    if (contentLength < 60) {
        containerMinHeight = '250px'; 
        fontSizeClass = `${post.textColor || 'text-white'} text-3xl md:text-5xl text-center leading-tight`;
        paddingClass = 'p-10';
    } else if (contentLength < 150) {
        containerMinHeight = '350px';
        fontSizeClass = `${post.textColor || 'text-white'} text-2xl md:text-3xl text-center leading-snug`;
        paddingClass = 'p-12';
    } else {
        containerMinHeight = '450px';
        fontSizeClass = `${post.textColor || 'text-white'} text-xl md:text-2xl text-center leading-relaxed`;
        paddingClass = 'p-14';
    }
  }

  // Componente Recursivo para Comentários
  const RenderComment = ({ c, depth = 0 }: { c: Comment, depth?: number }) => {
    const hasCommentLiked = c.reactions?.['❤️']?.includes(currentUser.id);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    return (
      <div 
        className={`p-4 border-b border-gray-100 dark:border-white/10 flex gap-3 group transition-all ${depth > 0 ? 'ml-10 md:ml-12 border-l' : ''}`}
      >
        <img 
          src={c.profilePic || DEFAULT_PROFILE_PIC} 
          className="w-10 h-10 rounded-full object-cover shrink-0 cursor-pointer hover:scale-105 transition-transform" 
          onClick={() => { onClose(); onNavigate('profile', { userId: c.userId }); }}
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-[15px] dark:text-white truncate hover:underline cursor-pointer" onClick={() => { onClose(); onNavigate('profile', { userId: c.userId }); }}>{c.userName}</span>
              <span className="text-gray-500 text-[14px]">· {new Date(c.timestamp).toLocaleDateString()}</span>
            </div>
            {(currentUser.id === c.userId || isOwner) && (
              <button 
                onClick={() => handleDeleteComment(c.id)}
                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-[15px] dark:text-gray-200 leading-normal">{c.text}</p>
          
          {/* Reactions Display */}
          {c.reactions && Object.keys(c.reactions).some(emoji => c.reactions![emoji].length > 0) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(c.reactions).map(([emoji, uids]) => uids.length > 0 && (
                <button 
                  key={emoji}
                  onClick={() => handleToggleReaction(c.id, emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition-all ${uids.includes(currentUser.id) ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-500'}`}
                >
                  <span>{emoji}</span>
                  <span className="font-bold">{uids.length}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-6 text-gray-500 text-[13px]">
            <div className="relative">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`flex items-center gap-1 group transition-colors ${hasCommentLiked ? 'text-pink-600' : ''}`}
              >
                <div className="p-2 -m-2 rounded-full group-hover:bg-pink-600/10 group-hover:text-pink-600">
                   {hasCommentLiked ? <HeartIconSolid className="h-4 w-4" /> : <HeartIconOutline className="h-4 w-4" />}
                </div>
              </button>
              
              {showEmojiPicker && (
                <div 
                  className="absolute bottom-full left-0 mb-2 bg-white dark:bg-zinc-800 shadow-2xl border dark:border-white/10 p-2 rounded-2xl flex gap-2 z-50 backdrop-blur-xl"
                >
                  {EMOJIS.map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => { handleToggleReaction(c.id, emoji); setShowEmojiPicker(false); }}
                      className="text-xl hover:scale-125 transition-transform active:scale-90 p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                setReplyingTo({ id: c.id, userName: c.userName });
                inputRef.current?.focus();
              }}
              className="flex items-center gap-1 group"
            >
              <div className="p-2 -m-2 rounded-full group-hover:bg-brand/10 group-hover:text-brand"><ChatBubbleOvalLeftIcon className="h-4 w-4" /></div>
              <span className="group-hover:text-brand font-bold">Responder</span>
            </button>

            <button className="flex items-center gap-1 group">
              <div className="p-2 -m-2 rounded-full group-hover:bg-brand/10 group-hover:text-brand"><ShareIcon className="h-4 w-4" /></div>
            </button>
          </div>

          {/* Nested Replies Rendering */}
          {c.replies && c.replies.length > 0 && (
            <div className="mt-2">
              {c.replies.map(reply => (
                <RenderComment key={reply.id} c={reply} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center animate-fade-in overflow-hidden">
      
      <div className="w-full h-full md:h-[95vh] md:max-w-2xl md:rounded-2xl bg-white dark:bg-[#000000] flex flex-col overflow-hidden relative shadow-2xl">
        
        {/* Header (X Style) */}
        <div className="flex items-center px-4 shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-[110] h-14 border-b border-gray-100 dark:border-white/10">
           <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
             <ArrowLeftIcon className="h-5 w-5 dark:text-white" />
           </button>
           <h2 className="ml-8 text-xl font-bold dark:text-white">Post</h2>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
           {/* Main Post Section */}
           <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { onClose(); onNavigate('profile', { userId: post.userId }); }}>
                    <img 
                      src={author.profilePicture || DEFAULT_PROFILE_PIC} 
                      className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-white/10" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                       <h4 className="font-bold text-[16px] dark:text-white hover:underline leading-tight">{author.firstName} {author.lastName}</h4>
                       <p className="text-gray-500 text-[14px]">@{author.firstName?.toLowerCase()}{author.lastName?.toLowerCase()}</p>
                    </div>
                 </div>
                 {!isOwner && (
                    <button 
                      onClick={handleFollow}
                      className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all active:scale-95 ${isFollowing ? 'border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'}`}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                 )}
              </div>

              <div className="mt-4">
                 <div 
                   className={`w-full transition-all duration-300
                     ${post.fontFamily || 'font-sans'}
                     ${hasBg ? `${post.backgroundColor} ${post.textColor || 'text-white'} rounded-2xl p-8 text-center my-4` : ''}
                   `}
                 >
                    <p 
                      style={{ fontFamily: `var(--${post.fontFamily || 'font-sans'})` }}
                      className={`whitespace-pre-wrap break-words w-full ${hasBg ? fontSizeClass : 'text-[18px] md:text-[22px] leading-normal dark:text-white'}`}
                    >
                      {post.content}
                    </p>
                 </div>
                 
                 {post.imageUrl && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-black">
                       <img src={post.imageUrl} className="w-full h-auto object-contain max-h-[70vh]" alt="Mídia" />
                    </div>
                 )}

                 <div className="mt-4 flex items-center gap-2 text-gray-500 text-[15px] border-b border-gray-100 dark:border-white/10 pb-4">
                    <span>{new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span>·</span>
                    <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                 </div>

                 <div className="flex items-center gap-5 py-4 border-b border-gray-100 dark:border-white/10 text-gray-500">
                    <div className="flex items-center gap-1.5 group">
                       <span className="font-bold text-gray-900 dark:text-white">{post.likes?.length || 0}</span>
                       <span className="text-[14px]">Curtidas</span>
                    </div>
                    <div className="flex items-center gap-1.5 group">
                       <span className="font-bold text-gray-900 dark:text-white">{comments.length}</span>
                       <span className="text-[14px]">Respostas</span>
                    </div>
                    <div className="flex items-center gap-1.5 group">
                       <span className="font-bold text-gray-900 dark:text-white">{post.shares?.length || 0}</span>
                       <span className="text-[14px]">Compartilhamentos</span>
                    </div>
                 </div>

                 {/* Action Icons Row */}
                 <div className="flex items-center justify-around py-3 border-b border-gray-100 dark:border-white/10 text-gray-500">
                    <button onClick={handleLike} className={`p-2 rounded-full hover:bg-pink-600/10 hover:text-pink-600 transition-colors ${hasLiked ? 'text-pink-600' : ''}`}>
                       {hasLiked ? <HeartIconSolid className="h-6 w-6" /> : <HeartIconOutline className="h-6 w-6" />}
                    </button>
                    <button onClick={() => {/* Focus input */}} className="p-2 rounded-full hover:bg-brand/10 hover:text-brand transition-colors">
                       <ChatBubbleOvalLeftIcon className="h-6 w-6" />
                    </button>
                    <button onClick={handleSave} className={`p-2 rounded-full hover:bg-brand/10 hover:text-brand transition-colors ${hasSaved ? 'text-brand' : ''}`}>
                       {hasSaved ? <BookmarkIconSolid className="h-6 w-6" /> : <BookmarkIconOutline className="h-6 w-6" />}
                    </button>
                    <button onClick={handleShare} className="p-2 rounded-full hover:bg-brand/10 hover:text-brand transition-colors">
                       <ShareIcon className="h-6 w-6" />
                    </button>
                    <button onClick={handleDownload} className="p-2 rounded-full hover:bg-brand/10 hover:text-brand transition-colors">
                       <ArrowDownTrayIcon className="h-6 w-6" />
                    </button>
                 </div>
              </div>
           </div>

           {/* Reply Input Section */}
           {!commentsDisabled && (
              <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-black">
                 <form onSubmit={handleSendComment} className="flex gap-3">
                    <img src={currentUser.profilePicture || DEFAULT_PROFILE_PIC} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="flex-1">
                       {replyingTo && (
                          <div className="flex items-center justify-between bg-brand/5 p-2 rounded-xl mb-2 animate-fade-in border border-brand/10">
                             <p className="text-[12px] text-brand font-bold">Respondendo a <span className="font-black">@{replyingTo.userName}</span></p>
                             <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-brand/10 rounded-full text-brand"><XMarkIcon className="h-4 w-4"/></button>
                          </div>
                       )}
                       <textarea 
                        ref={inputRef}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder={replyingTo ? "Sua resposta..." : "Postar sua resposta"}
                        className="w-full bg-transparent dark:text-white outline-none resize-none text-[18px] md:text-[20px] placeholder-gray-500 py-1 min-h-[50px]"
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                       />
                       <div className="mt-2 flex justify-end">
                          <button 
                            type="submit" 
                            disabled={!commentText.trim()}
                            className="bg-brand text-white px-5 py-2 rounded-full font-bold text-sm disabled:opacity-50 transition-all active:scale-95"
                          >
                            {replyingTo ? 'Responder' : 'Publicar'}
                          </button>
                       </div>
                    </div>
                 </form>
              </div>
           )}

           {/* Comments Section */}
           <div className="pb-20">
             {comments.length > 0 ? (
               comments.map((c) => (
                  <RenderComment key={c.id} c={c} />
               ))
             ) : (
               <div className="py-20 text-center flex flex-col items-center gap-4 animate-fade-in">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                     <ChatBubbleOvalLeftIcon className="h-8 w-8" />
                  </div>
                  <p className="text-gray-500 font-bold">Nenhuma resposta ainda. Seja o primeiro!</p>
               </div>
             )}
             <div ref={commentsEndRef} />
           </div>
        </div>
      </div>
      {showShareModal && author && (
        <ShareModal 
          isOpen={showShareModal} 
          onClose={() => setShowShareModal(false)}
          currentUser={currentUser}
          onNavigate={onNavigate}
          content={{
            title: `Post de ${author.firstName}`,
            text: post.content || '',
            url: `${window.location.origin}/?page=post-detail&postId=${post.id}`,
            mediaUrl: post.imageUrl || post.reel?.videoUrl,
            mediaType: post.imageUrl ? 'image' : (post.reel?.videoUrl ? 'video' : undefined)
          }}
        />
      )}
    </div>,
    document.body
  );
};

export default PostDetailModal;
