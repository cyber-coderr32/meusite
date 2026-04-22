
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Post, PostType, User } from '../types';
import { addPost, updatePost, uploadFile, generateUUID, getPostById, safeJsonStringify } from '../services/storageService';
import { useDialog } from '../services/DialogContext';
import { 
  PhotoIcon, 
  XMarkIcon, 
  PaperAirplaneIcon, 
  LockClosedIcon, 
  LockOpenIcon, 
  VideoCameraIcon,
  PaintBrushIcon,
  SwatchIcon,
  SignalIcon,
  FilmIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/solid';

const FONTS = [
  { id: 'font-sans', label: 'Sans' },
  { id: 'font-bebas', label: 'Bebas' },
  { id: 'font-montserrat', label: 'Montserrat' },
  { id: 'font-oswald', label: 'Oswald' },
  { id: 'font-playfair', label: 'Playfair' },
  { id: 'font-mono', label: 'Mono' },
  { id: 'font-pacifico', label: 'Pacifico' },
  { id: 'font-caveat', label: 'Caveat' },
  { id: 'font-lobster', label: 'Lobster' },
  { id: 'font-abril', label: 'Abril' },
  { id: 'font-righteous', label: 'Righteous' },
  { id: 'font-marker', label: 'Marker' },
  { id: 'font-special', label: 'Special' },
  { id: 'font-cinzel', label: 'Cinzel' },
  { id: 'font-dancing', label: 'Dancing' },
  { id: 'font-fredoka', label: 'Fredoka' },
  { id: 'font-press', label: 'Retro' },
  { id: 'font-satisfy', label: 'Satisfy' },
  { id: 'font-gothic', label: 'Gothic' },
  { id: 'font-zilla', label: 'Zilla' },
  { id: 'font-inline', label: 'Inline' },
  { id: 'font-bungee', label: 'Bungee' },
  { id: 'font-monoton', label: 'Monoton' }
];

const COLORS = [
  'text-white', 'text-blue-500', 'text-green-500', 'text-red-500', 
  'text-yellow-500', 'text-purple-500', 'text-pink-500', 'text-black'
];

const BG_COLORS = [
  'bg-transparent', 'bg-blue-600', 'bg-purple-600', 'bg-red-500', 
  'bg-green-500', 'bg-orange-500', 'bg-pink-600', 'bg-black', 'bg-white'
];

interface CreatePostProps {
  currentUser: User;
  onPostCreated: () => void;
  refreshUser: () => void;
  postId?: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated, refreshUser, postId }) => {
  const { t } = useTranslation();
  const { showAlert } = useDialog();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(!!postId);
  const [postType, setPostType] = useState<PostType>(PostType.TEXT);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [textColor, setTextColor] = useState('text-white');
  const [backgroundColor, setBackgroundColor] = useState('bg-transparent');
  const [disableComments, setDisableComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingPost, setExistingPost] = useState<Post | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  React.useEffect(() => {
    if (postId) {
      getPostById(postId).then(p => {
        if (p) {
          setExistingPost(p);
          setContent(p.content || '');
          setImageUrl(p.imageUrl || '');
          setPostType(p.type);
          setDisableComments(p.disableComments || false);
        }
      });
    }
  }, [postId]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPostInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setPostType(PostType.IMAGE);
      setVideoFile(null);
      setVideoUrl('');
    }
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>, type: PostType) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setPostType(type);
      setImageFile(null);
      setImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile && !videoFile && postType !== PostType.LIVE) return;

    setLoading(true);
    try {
      let finalImageUrl = '';
      let finalVideoUrl = '';

      if (imageFile) {
        finalImageUrl = await uploadFile(imageFile, 'posts');
      }
      if (videoFile) {
        finalVideoUrl = await uploadFile(videoFile, 'reels');
      }

      if (postId && existingPost) {
        const updatedPost: Post = {
          ...existingPost,
          content: content,
          imageUrl: finalImageUrl || existingPost.imageUrl,
          type: postType,
          disableComments: disableComments,
          fontFamily,
          textColor,
          backgroundColor,
          isAnonymous,
          tags: ['SOCIAL']
        };
        if (postType === PostType.REEL) {
           if (finalVideoUrl) {
              updatedPost.reel = { videoUrl: finalVideoUrl, description: content };
           } else if (!existingPost.reel) {
              throw new Error(t('reel_video_required'));
           }
        }
        await updatePost(updatedPost);
      } else {
        if (postType === PostType.REEL && !videoFile) {
          throw new Error(t('select_video_reel'));
        }

        const newPost: Post = {
          id: generateUUID(),
          userId: currentUser.id,
          authorName: `${currentUser.firstName} ${currentUser.lastName}`,
          authorProfilePic: currentUser.profilePicture,
          type: postType,
          timestamp: Date.now(),
          content: content,
          imageUrl: finalImageUrl,
          likes: [],
          comments: [],
          shares: [],
          saves: [],
          disableComments: disableComments,
          fontFamily,
          textColor,
          backgroundColor,
          isAnonymous,
          tags: ['SOCIAL']
        };

        if (postType === PostType.REEL || postType === PostType.VIDEO) {
           if (!finalVideoUrl) throw new Error(t('video_process_error'));
           newPost.reel = { videoUrl: finalVideoUrl, description: content };
        }

        if (postType === PostType.LIVE) {
           newPost.liveStream = {
              title: content || t('starting_live'),
              description: content,
              status: 'LIVE'
           };
        }

        await addPost(newPost);
      }
      setContent(''); setImageUrl(''); setImageFile(null); setVideoUrl(''); setVideoFile(null);
      setIsExpanded(false);
      onPostCreated();
    } catch (err: any) {
      console.error("Erro ao publicar:", safeJsonStringify(err));
      if (err.message?.includes('SENTINEL_BLOCK')) {
        showAlert(err.message.replace('SENTINEL_BLOCK: ', ''), { type: 'error', title: 'Sentinela de Segurança' });
      } else {
        showAlert(err.message || t('publish_error'), { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="bg-[#12161f] rounded-[2rem] p-6 border border-white/5 shadow-lg flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all animate-fade-in" onClick={() => setIsExpanded(true)}>
        <img src={currentUser.profilePicture} className="w-12 h-12 rounded-2xl object-cover" />
        <div className="flex-1 text-gray-500 font-bold text-sm">
          {t('what_thinking')}
        </div>
        <div className="flex gap-2">
            <PhotoIcon className="h-6 w-6 text-green-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#12161f] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl animate-fade-in relative z-50">
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <img src={currentUser.profilePicture} className="w-10 h-10 rounded-xl object-cover" />
             <div>
                <p className="text-sm font-black text-white leading-none">{currentUser.firstName}</p>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{t('member')}</p>
             </div>
          </div>
          <button onClick={() => setIsExpanded(false)} className="p-2 text-gray-500 hover:text-white transition-colors"><XMarkIcon className="h-6 w-6"/></button>
       </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`rounded-3xl p-4 transition-all ${backgroundColor}`}>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)}
              className={`w-full bg-transparent outline-none resize-none font-medium text-lg min-h-[120px] placeholder:text-gray-600 ${textColor === 'text-white' && backgroundColor === 'bg-white' ? 'text-gray-900' : textColor} ${fontFamily}`}
              placeholder={t('say_something')}
            />
          </div>

          {imageUrl && (
            <div className="relative rounded-3xl overflow-hidden group">
               <img src={imageUrl} className="w-full h-64 object-cover" />
               <button type="button" onClick={() => {setImageUrl(''); setImageFile(null);}} className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white"><XMarkIcon className="h-5 w-5"/></button>
            </div>
          )}

          {videoUrl && (
            <div className="relative rounded-3xl overflow-hidden group">
               <video src={videoUrl} className="w-full h-64 object-cover" controls />
               <button type="button" onClick={() => {setVideoUrl(''); setVideoFile(null);}} className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white"><XMarkIcon className="h-5 w-5"/></button>
            </div>
          )}

          {/* Text Styling Controls */}
          <div className="flex flex-wrap gap-4 bg-white/5 p-4 rounded-2xl">
             <div className="flex items-center gap-2">
                <PaintBrushIcon className="h-4 w-4 text-gray-400" />
                <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[150px]">
                   {BG_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setBackgroundColor(c)} className={`w-6 h-6 rounded-full border ${c} ${backgroundColor === c ? 'border-white' : 'border-transparent'}`} />
                   ))}
                </div>
             </div>
             <div className="flex items-center gap-2">
                <SwatchIcon className="h-4 w-4 text-gray-400" />
                <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[150px]">
                   {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setTextColor(c)} className={`w-6 h-6 rounded-full border ${c.replace('text-', 'bg-')} ${textColor === c ? 'border-white' : 'border-transparent'}`} />
                   ))}
                </div>
             </div>
             <div className="flex items-center gap-2">
                <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[150px]">
                   {FONTS.map(f => (
                      <button 
                        key={f.id} 
                        type="button" 
                        onClick={() => setFontFamily(f.id)} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${f.id} ${fontFamily === f.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'}`}
                      >
                         {f.label}
                      </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
             <div className="flex gap-4">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-all font-black text-[10px] uppercase">
                   <PhotoIcon className="h-6 w-6" /> {t('photo')}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />

                <button type="button" onClick={() => videoInputRef.current?.click()} className={`flex items-center gap-2 transition-all font-black text-[10px] uppercase ${postType === PostType.REEL ? 'text-purple-500' : 'text-gray-400 hover:text-purple-500'}`}>
                   <VideoCameraIcon className="h-6 w-6" /> {t('reel')}
                </button>
                <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={e => handleVideoFile(e, PostType.REEL)} />

                <button type="button" onClick={() => videoPostInputRef.current?.click()} className={`flex items-center gap-2 transition-all font-black text-[10px] uppercase ${postType === PostType.VIDEO ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}>
                   <FilmIcon className="h-6 w-6" /> {t('video')}
                </button>
                <input type="file" ref={videoPostInputRef} className="hidden" accept="video/*" onChange={e => handleVideoFile(e, PostType.VIDEO)} />
                
                <button type="button" onClick={() => {setPostType(PostType.LIVE); setContent(t('starting_live'));}} className={`flex items-center gap-2 transition-all font-black text-[10px] uppercase ${postType === PostType.LIVE ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                  <span className="flex items-center gap-2 uppercase"><SignalIcon className="h-6 w-6" /> {t('live')}</span>
                </button>
             </div>

             <div className="flex items-center gap-3">
                <button 
                   type="button" 
                   onClick={() => setIsAnonymous(!isAnonymous)} 
                   className={`p-3 rounded-2xl transition-all ${isAnonymous ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}
                   title={t('post_anonymous')}
                >
                   {isAnonymous ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
                <button type="button" onClick={() => setDisableComments(!disableComments)} className={`p-3 rounded-2xl transition-all ${disableComments ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-500'}`} title={t('block_comments')}>
                  {disableComments ? <LockClosedIcon className="h-5 w-5" /> : <LockOpenIcon className="h-5 w-5" />}
                </button>
                <button 
                  type="submit" 
                  disabled={loading || (!content.trim() && !imageFile && !videoFile && postType !== PostType.LIVE)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all flex items-center gap-2"
                >
                  {loading ? t('sending') : <><PaperAirplaneIcon className="h-4 w-4 -rotate-45" /> {t('publish')}</>}
                </button>
             </div>
          </div>
       </form>
    </div>
  );
};

export default CreatePost;

