import React, { useState } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BASE_URL}${url}`;
};

const CommentForm = ({ 
  onSubmit, 
  onCancel,
  isSubmitting = false, 
  placeholder = 'Write a comment...',
  isReply = false 
}) => {
  const [content, setContent] = useState('');
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className={`${isReply ? '' : 'mb-8'}`}>
      <div className="flex gap-3">
        {!isReply && (
          <img
            src={getFullImageUrl(user?.avatar?.url) || '/default-avatar.svg'}
            alt={user?.username}
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
            }}
          />
        )}
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className={`w-full ${isReply ? 'p-3 text-sm' : 'p-4'} pr-12 bg-navy-50 border-2 border-transparent 
                       rounded-2xl resize-none focus:border-gold-300 focus:bg-white
                       transition-all outline-none`}
            rows={isReply ? 2 : 3}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={`absolute ${isReply ? 'bottom-2 right-2' : 'bottom-3 right-3'} p-2 bg-gold-400 text-navy-900 
                       rounded-xl hover:bg-gold-500 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors`}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-navy-300 border-t-navy-600 
                               rounded-full animate-spin block" />
            ) : (
              <HiOutlinePaperAirplane className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      
      {isReply && onCancel && (
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-navy-500 hover:text-navy-700"
          >
            Cancel
          </button>
        </div>
      )}
    </form>
  );
};

export default CommentForm;