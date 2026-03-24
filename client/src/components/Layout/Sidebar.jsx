import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineClock } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { blogService } from '../../services/blogService';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

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

const Sidebar = () => {
  const { isAuthenticated } = useAuth();

  const { data: activeUsersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['active-users'],
    queryFn: () => userService.getActiveUsers(8),
    staleTime: 60000,
  });

  const { data: topBlogsData, isLoading: loadingBlogs } = useQuery({
    queryKey: ['top-blogs'],
    queryFn: () => blogService.getTopBlogs(5),
    staleTime: 60000,
  });

  return (
    <aside className="space-y-6">
      {/* Active Users Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="card p-6"
      >
        <h3 className="font-serif text-xl font-bold text-navy-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Active Writers
        </h3>
        
        {loadingUsers ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 skeleton" />
                  <div className="h-3 w-16 skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {activeUsersData?.users?.map((user, index) => {
              const avatarUrl = getFullImageUrl(user.avatar?.url);
              const hasDefaultAvatar = !user.avatar?.url || 
                user.avatar.url.includes('default') || 
                user.avatar.url === 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png';
              
              return (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/profile/${user._id}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-xl
                               hover:bg-navy-50 transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 border-transparent
                                 ${hasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}
                                 group-hover:border-gold-300 transition-colors`}>
                      {hasDefaultAvatar ? (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <ModernAvatarIcon className="w-5 h-5" />
                        </div>
                      ) : (
                        <img
                          src={avatarUrl || '/default-avatar.svg'}
                          alt={user.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/></svg></div>';
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy-800 truncate group-hover:text-gold-600
                                    transition-colors">
                        {user.username}
                      </p>
                      <p className="text-xs text-navy-500 flex items-center gap-1">
                        <HiOutlineClock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                      </p>
                    </div>
                    {user.totalBlogsPublished > 0 && (
                      <span className="text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded-lg
                                       font-medium">
                        {user.totalBlogsPublished} posts
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Top Liked Blogs Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h3 className="font-serif text-xl font-bold text-navy-800 mb-4 flex items-center gap-2">
          <HiOutlineHeart className="w-5 h-5 text-red-500" />
          Top Liked
        </h3>
        
        {loadingBlogs ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full skeleton" />
                <div className="h-3 w-20 skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topBlogsData?.blogs?.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/blog/${blog.slug}`}
                  className="group block"
                >
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-gold-400 to-gold-500
                                     rounded-lg flex items-center justify-center
                                     font-bold text-xs text-navy-900">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-medium text-navy-800 line-clamp-2 group-hover:text-gold-600
                                   transition-colors text-sm leading-snug bengali-text"
                        style={{ fontFamily: "'AlinurAtithi', serif" }}
                      >
                        {blog.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-navy-500">
                        <span className="flex items-center gap-1">
                          <HiOutlineHeart className="w-3 h-3" />
                          {blog.likesCount}
                        </span>
                        <span>{blog.readTime} min read</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Decorative Element - CTA Card */}
      <div className="card p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-2 border-white/20 shadow-lg shadow-indigo-400/40">
        <h3 className="font-serif text-lg font-bold text-white mb-2">Share Your Story</h3>
        <p className="text-white/90 text-sm mb-4">
          Join our community of writers and share your unique perspective with the world.
        </p>
        {isAuthenticated ? (
          <Link
            to="/create"
            className="block w-full px-4 py-2.5 rounded-xl bg-white hover:bg-white/90
                       text-indigo-600 font-semibold text-sm transition-all shadow-md
                       hover:shadow-lg hover:scale-[1.02] text-center"
          >
            Start Writing
          </Link>
        ) : (
          <Link
            to="/auth"
            className="block w-full px-4 py-2.5 rounded-xl bg-white hover:bg-white/90
                       text-indigo-600 font-semibold text-sm transition-all shadow-md
                       hover:shadow-lg hover:scale-[1.02] text-center"
          >
            Sign Up / Login
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;