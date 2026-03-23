import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineLocationMarker, HiOutlineAcademicCap } from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BASE_URL}${url}`;
};

// Modern Avatar Icon Component - Clean User Silhouette
const ModernAvatarIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
  </svg>
);

const UserCard = ({ user, index = 0 }) => {
  const avatarUrl = getFullImageUrl(user.avatar?.url);
  const hasDefaultAvatar = !user.avatar?.url || 
    user.avatar.url.includes('default') || 
    user.avatar.url === 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card-interactive p-6"
    >
      <Link to={`/profile/${user._id}`} className="block">
        <div className="flex items-center gap-4">
          {/* Avatar with icon fallback */}
          <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 border-gold-200
                         ${hasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}`}>
            {hasDefaultAvatar ? (
              <div className="w-full h-full flex items-center justify-center text-white">
                <ModernAvatarIcon className="w-10 h-10" />
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
            <h3 className="font-semibold text-navy-800 truncate">
              {user.username}
            </h3>
            {user.university && (
              <p className="text-sm text-navy-500 flex items-center gap-1 truncate">
                <HiOutlineAcademicCap className="w-4 h-4 flex-shrink-0 text-gold-500" />
                {user.university}
              </p>
            )}
            {user.address?.city && (
              <p className="text-sm text-navy-500 flex items-center gap-1 truncate">
                <HiOutlineLocationMarker className="w-4 h-4 flex-shrink-0 text-pink-500" />
                {user.address.city}, {user.address.country}
              </p>
            )}
          </div>
        </div>

        {user.bio && (
          <p className="text-sm text-navy-600 mt-4 line-clamp-2 italic">
            "{user.bio}"
          </p>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-navy-100">
          <div className="text-center">
            <p className="font-bold text-navy-800">{user.totalBlogsPublished || 0}</p>
            <p className="text-xs text-navy-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-navy-800">{user.followers?.length || 0}</p>
            <p className="text-xs text-navy-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-navy-800">{user.totalLikesReceived || 0}</p>
            <p className="text-xs text-navy-500">Likes</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default UserCard;