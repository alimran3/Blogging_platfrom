import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChat, HiOutlineHeart, HiHeart, HiOutlineReply } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { commentService } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import CommentForm from './CommentForm';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

// Modern Avatar Icon Component - Clean User Silhouette
const ModernAvatarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
  </svg>
);

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BASE_URL}${url}`;
};

const CommentSection = ({ blogId, navigate }) => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['comments', blogId],
    queryFn: () => commentService.getComments(blogId),
    enabled: !!blogId,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => commentService.createComment(blogId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', blogId] });
      toast.success('Comment added!');
    },
    onError: () => {
      toast.error('Failed to add comment');
    }
  });

  const likeMutation = useMutation({
    mutationFn: (commentId) => commentService.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', blogId] });
    },
    onError: () => {
      if (!isAuthenticated) {
        toast.error('Please login to like comments');
        setTimeout(() => {
          navigate('/auth');
        }, 1500);
      }
    }
  });

  const handleSubmit = (content, parentCommentId = null) => {
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
      return;
    }
    createMutation.mutate({ content, parentCommentId });
    setReplyingTo(null);
  };

  const comments = data?.comments || [];

  return (
    <div className="card p-6 md:p-8">
      <h3 className="font-serif text-2xl font-bold text-navy-800 mb-6 flex items-center gap-3">
        <HiOutlineChat className="w-7 h-7" />
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {isAuthenticated ? (
        <CommentForm
          onSubmit={(content) => handleSubmit(content)}
          isSubmitting={createMutation.isLoading}
          placeholder="Share your thoughts..."
        />
      ) : (
        <div className="text-center py-8 bg-gradient-to-br from-navy-50 to-gold-50 rounded-2xl mb-6 border-2 border-gold-200">
          <HiOutlineChat className="w-10 h-10 text-gold-500 mx-auto mb-3" />
          <p className="text-navy-700 font-medium mb-3">
            Join the conversation
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="btn-gold"
          >
            Login to Comment
          </button>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 skeleton" />
                <div className="h-16 w-full skeleton rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {comments.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                onReply={() => setReplyingTo(comment._id)}
                onLike={() => likeMutation.mutate(comment._id)}
                isReplying={replyingTo === comment._id}
                onSubmitReply={(content) => handleSubmit(content, comment._id)}
                onCancelReply={() => setReplyingTo(null)}
                currentUserId={user?._id}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {comments.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <HiOutlineChat className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <p className="text-navy-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

const Comment = ({
  comment,
  onReply,
  onLike,
  isReplying,
  onSubmitReply,
  onCancelReply,
  currentUserId,
  isAuthenticated
}) => {
  const isLiked = comment.likes?.includes(currentUserId);
  const avatarUrl = getFullImageUrl(comment.author?.avatar?.url);
  const hasDefaultAvatar = !comment.author?.avatar?.url || 
    comment.author.avatar.url.includes('default') || 
    comment.author.avatar.url === 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="group"
    >
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0
                     ${hasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}`}>
          {hasDefaultAvatar ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              <ModernAvatarIcon className="w-5 h-5" />
            </div>
          ) : (
            <img
              src={avatarUrl || '/default-avatar.svg'}
              alt={comment.author?.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/></svg></div>';
              }}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="bg-navy-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-navy-800">
                {comment.author?.username}
              </span>
              <span className="text-xs text-navy-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                {comment.isEdited && ' (edited)'}
              </span>
            </div>
            <p className="text-navy-700">{comment.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 ml-2">
            <button
              onClick={onLike}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 text-sm ${
                isLiked ? 'text-red-500' : 'text-navy-500 hover:text-red-500'
              } transition-colors`}
            >
              {isLiked ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
              <span>{comment.likesCount || 0}</span>
            </button>
            
            {isAuthenticated && (
              <button
                onClick={onReply}
                className="flex items-center gap-1 text-sm text-navy-500 hover:text-gold-600
                           transition-colors"
              >
                <HiOutlineReply className="w-4 h-4" />
                Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <CommentForm
                onSubmit={onSubmitReply}
                onCancel={onCancelReply}
                placeholder={`Reply to ${comment.author?.username}...`}
                isReply
              />
            </motion.div>
          )}

          {/* Replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-4 ml-4 space-y-4 border-l-2 border-navy-100 pl-4">
              {comment.replies.map((reply) => {
                const replyAvatarUrl = getFullImageUrl(reply.author?.avatar?.url);
                const replyHasDefaultAvatar = !reply.author?.avatar?.url || 
                  reply.author.avatar.url.includes('default') || 
                  reply.author.avatar.url === 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png';
                  
                return (
                  <div key={reply._id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg overflow-hidden flex-shrink-0
                                 ${replyHasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}`}>
                      {replyHasDefaultAvatar ? (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <ModernAvatarIcon className="w-4 h-4" />
                        </div>
                      ) : (
                        <img
                          src={replyAvatarUrl || '/default-avatar.svg'}
                          alt={reply.author?.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/></svg></div>';
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-navy-50/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-navy-800">
                            {reply.author?.username}
                          </span>
                          <span className="text-xs text-navy-400">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-navy-700">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CommentSection;