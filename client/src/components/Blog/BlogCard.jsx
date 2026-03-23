import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineChatAlt,
  HiOutlineClock,
  HiOutlineEye
} from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { useLikeBlog } from '../../hooks/useBlogs';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

// Helper function to get full image URL
const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BASE_URL}${url}`;
};

// Modern Avatar Icon Component - Clean User Silhouette
const ModernAvatarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
  </svg>
);

const BlogCard = ({ blog, index = 0 }) => {
  const { isAuthenticated } = useAuth();
  const likeMutation = useLikeBlog();
  const [isLiked, setIsLiked] = useState(blog.isLiked);
  const [likesCount, setLikesCount] = useState(blog.likesCount);
  const [imageError, setImageError] = useState(false);

  // Check if avatar is default or missing
  const avatarUrl = getFullImageUrl(blog.author?.avatar?.url);
  const hasDefaultAvatar = !blog.author?.avatar?.url || 
    blog.author.avatar.url.includes('default') || 
    blog.author.avatar.url === 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png';

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

  const coverImageUrl = getFullImageUrl(blog.coverImage?.url);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="card-interactive group"
    >
      <Link to={`/blog/${blog.slug}`} className="block">
        {/* Cover Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-navy-200">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={blog.title}
              className="w-full h-full object-cover transform group-hover:scale-105
                         transition-transform duration-700 ease-out"
              onError={(e) => {
                setImageError(true);
                e.target.style.display = 'none';
              }}
            />
          ) : null}

          {/* Fallback placeholder when image fails or doesn't exist */}
          {imageError || !coverImageUrl ? (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-300 to-navy-400">
              <svg
                className="w-16 h-16 text-navy-500 opacity-50"
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
          ) : null}

          {/* Category Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full
                             text-xs font-semibold text-navy-800 capitalize
                             shadow-sm">
              {blog.category}
            </span>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Author Row */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className={`w-8 h-8 rounded-xl overflow-hidden border-2 border-gold-200 
                         ${hasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}`}>
              {hasDefaultAvatar ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <ModernAvatarIcon className="w-5 h-5" />
                </div>
              ) : (
                <img
                  src={avatarUrl || '/default-avatar.svg'}
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
              <p className="font-medium text-navy-800 text-xs">
                {blog.author?.username}
              </p>
              <p className="text-xs text-navy-500">
                {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Title */}
          <h2
            className="font-serif text-lg md:text-xl font-bold text-navy-900 mb-2
                       group-hover:text-gold-700 transition-colors duration-300
                       line-clamp-2"
            style={{ fontFamily: "'AlinurAtithi', serif" }}
          >
            {blog.title}
          </h2>

          {/* Excerpt */}
          <p
            className="text-navy-600 text-sm leading-relaxed line-clamp-3 mb-3"
            style={{ fontFamily: "'AlinurAtithi', serif" }}
          >
            {blog.excerpt}
          </p>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {blog.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-navy-50 text-navy-600 rounded-lg
                             font-medium hover:bg-gold-100 hover:text-gold-700
                             transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {blog.tags.length > 3 && (
                <span className="text-xs text-navy-400">
                  +{blog.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-navy-100">
            <div className="flex items-center gap-3">
              {/* Like Button */}
              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.9 }}
                className={`flex items-center gap-1 text-xs font-medium
                           ${isLiked
                             ? 'text-red-500'
                             : 'text-navy-500 hover:text-red-500'
                           } transition-colors`}
              >
                {isLiked ? (
                  <HiHeart className="w-4 h-4" />
                ) : (
                  <HiOutlineHeart className="w-4 h-4" />
                )}
                <span>{likesCount}</span>
              </motion.button>

              {/* Comments */}
              <span className="flex items-center gap-1 text-xs text-navy-500">
                <HiOutlineChatAlt className="w-4 h-4" />
                <span>{blog.commentsCount}</span>
              </span>

              {/* Views */}
              <span className="flex items-center gap-1 text-xs text-navy-500">
                <HiOutlineEye className="w-4 h-4" />
                <span>{blog.views}</span>
              </span>
            </div>

            {/* Read Time */}
            <span className="flex items-center gap-1 text-xs text-navy-500">
              <HiOutlineClock className="w-3.5 h-3.5" />
              <span>{blog.readTime} min</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default BlogCard;