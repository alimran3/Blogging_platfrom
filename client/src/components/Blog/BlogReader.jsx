import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineShare,
  HiOutlineBookmark
} from 'react-icons/hi';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import EmbedRenderer from './EmbedRenderer';
import CommentSection from '../Interactions/CommentSection';
import { useLikeBlog } from '../../hooks/useBlogs';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

// Modern Avatar Icon Component - Clean User Silhouette
const ModernAvatarIcon = ({ className = "w-7 h-7" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
  </svg>
);

const BlogReader = ({ blog, navigate }) => {
  const { isAuthenticated } = useAuth();
  const likeMutation = useLikeBlog();
  const [isLiked, setIsLiked] = React.useState(blog.isLiked);
  const [likesCount, setLikesCount] = React.useState(blog.likesCount);

  // Handle both absolute URLs (Cloudinary) and relative URLs (local storage)
  const getFullImageUrl = (url) => {
    if (!url) return null;
    // If it's already an absolute URL (like Cloudinary), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it's a relative path, prepend the base URL
    return `${BASE_URL}${url}`;
  };

  const coverImageUrl = getFullImageUrl(blog.coverImage?.url);
  const authorAvatarUrl = getFullImageUrl(blog.author?.avatar?.url);
  const hasDefaultAvatar = !blog.author?.avatar?.url ||
    blog.author.avatar.url.includes('default') ||
    blog.author.avatar.url === 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png';

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
      return;
    }

    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await likeMutation.mutateAsync(blog._id);
    } catch (error) {
      setIsLiked(isLiked);
      setLikesCount(blog.likesCount);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const sanitizedContent = DOMPurify.sanitize(blog.content);

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Hero Section */}
      <header className="mb-8">
        {/* Category */}
        <div className="mb-4">
          <span className="px-4 py-2 bg-gold-100 text-gold-700 rounded-full
                           text-sm font-semibold capitalize">
            {blog.category}
          </span>
        </div>

        {/* Title */}
        <h1 
          className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold
                     text-navy-900 mb-6 leading-tight"
          style={{ fontFamily: "'AlinurAtithi', serif" }}
        >
          {blog.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Link
            to={`/profile/${blog.author._id}`}
            className="flex items-center gap-3 group"
          >
            <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 border-gold-200
                         ${hasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}`}>
              {hasDefaultAvatar ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <ModernAvatarIcon className="w-7 h-7" />
                </div>
              ) : (
                <img
                  src={authorAvatarUrl || '/default-avatar.svg'}
                  alt={blog.author.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/></svg></div>';
                  }}
                />
              )}
            </div>
            <div>
              <p className="font-semibold text-navy-800 group-hover:text-gold-600
                            transition-colors">
                {blog.author.username}
              </p>
              <p className="text-sm text-navy-500">
                {format(new Date(blog.publishedAt || blog.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-sm text-navy-500">
            <span className="flex items-center gap-1">
              <HiOutlineClock className="w-4 h-4" />
              {blog.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineEye className="w-4 h-4" />
              {blog.views} views
            </span>
          </div>
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-navy-50 text-navy-600 rounded-lg
                           text-sm font-medium hover:bg-navy-100 transition-colors
                           cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Cover Image - Only show if exists */}
      {coverImageUrl && (
        <div className="mb-10 rounded-3xl overflow-hidden shadow-elegant-lg bg-navy-200">
          <div className="relative w-full" style={{ maxHeight: '500px' }}>
            <img
              src={coverImageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
              style={{ maxHeight: '500px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      <div className="sticky top-24 z-30 flex justify-center mb-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 p-2 bg-white rounded-full shadow-elegant
                     border border-navy-100"
        >
          <motion.button
            onClick={handleLike}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium
                       ${isLiked 
                         ? 'bg-red-50 text-red-500' 
                         : 'hover:bg-navy-50 text-navy-600'
                       } transition-colors`}
          >
            {isLiked ? (
              <HiHeart className="w-5 h-5" />
            ) : (
              <HiOutlineHeart className="w-5 h-5" />
            )}
            <span>{likesCount}</span>
          </motion.button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full
                       hover:bg-navy-50 text-navy-600 transition-colors font-medium"
          >
            <HiOutlineShare className="w-5 h-5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full
                       hover:bg-navy-50 text-navy-600 transition-colors font-medium"
          >
            <HiOutlineBookmark className="w-5 h-5" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </motion.div>
      </div>

      {/* Blog Content */}
      <div className="card p-6 md:p-10 lg:p-12 mb-10 blog-content-container">
        <div
          className="blog-content bengali-text"
          style={{ fontFamily: "'AlinurAtithi', serif", lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Embeds */}
        {blog.embeds?.length > 0 && (
          <div className="mt-10 space-y-6">
            {blog.embeds.map((embed, index) => (
              <EmbedRenderer key={index} embed={embed} />
            ))}
          </div>
        )}
      </div>

      {/* Author Card */}
      <div className="card p-6 md:p-8 mb-10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link to={`/profile/${blog.author._id}`}>
            <div className={`w-20 h-20 rounded-2xl overflow-hidden border-3 border-gold-300
                         ${hasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}`}>
              {hasDefaultAvatar ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <ModernAvatarIcon className="w-12 h-12" />
                </div>
              ) : (
                <img
                  src={authorAvatarUrl || '/default-avatar.svg'}
                  alt={blog.author.username}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/></svg></div>';
                  }}
                />
              )}
            </div>
          </Link>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-navy-500 mb-1">Written by</p>
            <Link 
              to={`/profile/${blog.author._id}`}
              className="font-serif text-2xl font-bold text-navy-800 hover:text-gold-600
                         transition-colors"
            >
              {blog.author.username}
            </Link>
            {blog.author.bio && (
              <p className="text-navy-600 mt-2 line-clamp-2">{blog.author.bio}</p>
            )}
            {blog.author.university && (
              <p className="text-sm text-navy-500 mt-1">{blog.author.university}</p>
            )}
          </div>
          <Link
            to={`/profile/${blog.author._id}`}
            className="btn-secondary"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection blogId={blog._id} navigate={navigate} />
    </motion.article>
  );
};

export default BlogReader;