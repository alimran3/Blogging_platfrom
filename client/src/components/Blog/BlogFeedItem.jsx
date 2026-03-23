import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineChatAlt,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineShare,
  HiOutlineDotsHorizontal
} from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { useLikeBlog } from '../../hooks/useBlogs';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

// Modern Avatar Icon Component - Clean User Silhouette
const ModernAvatarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
  </svg>
);

const BlogFeedItem = ({ blog, index = 0 }) => {
  const { isAuthenticated } = useAuth();
  const likeMutation = useLikeBlog();
  const [isLiked, setIsLiked] = useState(blog.isLiked);
  const [likesCount, setLikesCount] = useState(blog.likesCount);
  const [imageError, setImageError] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await likeMutation.mutateAsync(blog._id);
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      setLikesCount(blog.likesCount);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${BASE_URL}${url}`;
  };

  const coverImageUrl = getFullImageUrl(blog.coverImage?.url);
  const authorAvatarUrl = getFullImageUrl(blog.author?.avatar?.url);
  const hasDefaultAvatar = !blog.author?.avatar?.url || 
    blog.author.avatar.url.includes('default') || 
    blog.author.avatar.url === 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png';

  const bengaliFontStyle = { fontFamily: "'AlinurAtithi', serif" };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-navy-100 overflow-hidden
                 hover:shadow-md transition-shadow duration-300"
    >
      {/* Header - Author Info */}
      <div className="flex items-center justify-between p-4 md:p-5">
        <Link to={`/profile/${blog.author?._id}`} className="flex items-center gap-3 group">
          <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-gold-200
                       ${hasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}`}>
            {hasDefaultAvatar ? (
              <div className="w-full h-full flex items-center justify-center text-white">
                <ModernAvatarIcon className="w-6 h-6" />
              </div>
            ) : (
              <img
                src={authorAvatarUrl || '/default-avatar.svg'}
                alt={blog.author?.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/></svg></div>';
                }}
              />
            )}
          </div>
          <div>
            <p className="font-semibold text-navy-800 group-hover:text-gold-700 transition-colors">
              {blog.author?.username}
            </p>
            <div className="flex items-center gap-2 text-xs text-navy-500">
              <HiOutlineClock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
              <span>•</span>
              <span className="capitalize">{blog.category}</span>
            </div>
          </div>
        </Link>
        <button className="p-2 hover:bg-navy-50 rounded-full transition-colors">
          <HiOutlineDotsHorizontal className="w-5 h-5 text-navy-400" />
        </button>
      </div>

      {/* Content */}
      <Link to={`/blog/${blog.slug}`} className="block">
        {/* Title */}
        <div className="px-4 md:px-5 mb-3">
          <h2
            className="font-serif text-xl md:text-2xl font-bold text-navy-900 mb-2
                       group-hover:text-gold-700 transition-colors duration-300"
            style={bengaliFontStyle}
          >
            {blog.title}
          </h2>
        </div>

        {/* Excerpt */}
        <div className="px-4 md:px-5 mb-4">
          <p
            className="text-navy-600 text-base leading-relaxed"
            style={bengaliFontStyle}
          >
            {blog.excerpt}
          </p>
        </div>

        {/* Cover Image */}
        {coverImageUrl && (
          <div className="relative w-full bg-navy-100">
            <img
              src={coverImageUrl}
              alt={blog.title}
              className="w-full max-h-[500px] object-cover"
              loading="lazy"
              onError={(e) => {
                setImageError(true);
                e.target.style.display = 'none';
              }}
            />
            {imageError && (
              <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-navy-200 to-navy-300">
                <svg
                  className="w-16 h-16 text-navy-400 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="px-4 md:px-5 py-3 flex flex-wrap gap-2 border-t border-navy-50">
            {blog.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1.5 bg-navy-50 text-navy-600 rounded-full
                           font-medium hover:bg-gold-100 hover:text-gold-700
                           transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Action Buttons - Like, Comment, Share */}
      <div className="px-4 md:px-5 py-3 border-t border-navy-100">
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-navy-500">
            <span className="flex items-center gap-1.5">
              <HiHeart className="w-4 h-4 text-red-500" />
              <span>{likesCount}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <HiOutlineChatAlt className="w-4 h-4" />
              <span>{blog.commentsCount}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <HiOutlineEye className="w-4 h-4" />
              <span>{blog.views}</span>
            </span>
          </div>

          {/* Read Time */}
          <span className="flex items-center gap-1.5 text-xs text-navy-400">
            <HiOutlineClock className="w-3 h-3" />
            <span>{blog.readTime} min read</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy-50">
          <motion.button
            onClick={handleLike}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors
                       ${isLiked
                         ? 'text-red-500 bg-red-50'
                         : 'text-navy-600 hover:bg-navy-50'
                       }`}
          >
            {isLiked ? (
              <HiHeart className="w-5 h-5" />
            ) : (
              <HiOutlineHeart className="w-5 h-5" />
            )}
            <span className="text-sm">Like</span>
          </motion.button>

          <Link
            to={`/blog/${blog.slug}#comments`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       text-navy-600 hover:bg-navy-50 font-medium transition-colors"
          >
            <HiOutlineChatAlt className="w-5 h-5" />
            <span className="text-sm">Comment</span>
          </Link>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       text-navy-600 hover:bg-navy-50 font-medium transition-colors"
          >
            <HiOutlineShare className="w-5 h-5" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogFeedItem;
