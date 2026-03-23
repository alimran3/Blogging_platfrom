import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineLocationMarker,
  HiOutlineAcademicCap,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineGlobe,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineBookmark,
  HiOutlineHeart,
  HiOutlineEye
} from 'react-icons/hi';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

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
const ModernAvatarIcon = ({ className = "w-14 h-14" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
  </svg>
);

const UserProfile = ({ user: initialUser, recentBlogs }) => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState(initialUser);
  const [isFollowing, setIsFollowing] = useState(initialUser?.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(initialUser?.followers?.length || 0);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state with props when they change
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setIsFollowing(initialUser.isFollowing || false);
      setFollowersCount(initialUser.followers?.length || 0);
    }
  }, [initialUser]);

  const isOwnProfile = currentUser?._id === user?._id;

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow users');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userService.followUser(user._id);
      setIsFollowing(response.isFollowing);
      setFollowersCount(response.followersCount);
      toast.success(response.isFollowing ? 'Following!' : 'Unfollowed');
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if avatar is default or missing
  const hasDefaultAvatar = !user.avatar?.url || 
    user.avatar.url.includes('default') || 
    user.avatar.url === 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png';

  // Check if cover image exists
  const hasCoverImage = user.coverImage?.url && 
    !user.coverImage.url.includes('default') &&
    user.coverImage.url !== '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Cover Image - Only render if cover image exists */}
      {hasCoverImage && (
        <div className="relative h-40 md:h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
          <img
            src={user.coverImage.url}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/40 to-transparent" />
          
          {/* Decorative elements */}
          <div className="absolute top-6 right-6 flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      )}

      {/* Profile Info */}
      <div className={`relative z-10 ${hasCoverImage ? 'mx-3 md:mx-6 -mt-14 md:-mt-16' : 'mx-3 md:mx-6'}`}>
        <div className={`card p-5 md:p-6 ${hasCoverImage ? 'pt-20 md:pt-24' : 'pt-6'} shadow-2xl`}>
          <div className="flex flex-col md:flex-row gap-5">
            {/* Avatar - Enhanced with icon fallback */}
            <div className={`flex-shrink-0 ${hasCoverImage ? '-mt-16 md:-mt-20' : ''}`}>
              <div className="relative group">
                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-3 border-white
                           shadow-elegant-lg ${hasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}`}>
                  {hasDefaultAvatar ? (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <ModernAvatarIcon className="w-16 h-16 md:w-20 md:h-20" />
                    </div>
                  ) : (
                    <img
                      src={getFullImageUrl(user.avatar?.url) || '/default-avatar.svg'}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/></svg></div>';
                      }}
                    />
                  )}
                </div>
                
                {/* Verified badge for own profile */}
                {isOwnProfile && (
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gold-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <svg className="w-3.5 h-3.5 text-navy-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy-900 flex items-center gap-2">
                    {user.username}
                    {user.isVerified && (
                      <span className="text-blue-500" title="Verified">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </h1>
                  {user.university && (
                    <p className="flex items-center gap-1.5 text-navy-600 mt-1.5">
                      <HiOutlineAcademicCap className="w-4 h-4 text-gold-500" />
                      <span className="font-medium text-sm">{user.university}</span>
                    </p>
                  )}
                </div>

                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    disabled={isLoading}
                    className={`${isFollowing ? 'btn-secondary' : 'btn-gold'} min-w-[100px] text-sm`}
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent
                                       rounded-full animate-spin" />
                    ) : (
                      isFollowing ? 'Following' : 'Follow'
                    )}
                  </button>
                )}
              </div>

              {/* Bio - Express yourself in one sentence */}
              {user.bio && (
                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-indigo-100">
                  <p className="text-navy-700 italic text-sm leading-relaxed flex items-start gap-2">
                    <span className="text-lg text-indigo-400 font-serif">"</span>
                    <span className="flex-1">{user.bio}</span>
                    <span className="text-lg text-indigo-400 font-serif">"</span>
                  </p>
                </div>
              )}

              {/* Stats - Enhanced */}
              <div className="grid grid-cols-4 gap-3 mt-5">
                <motion.div 
                  className="text-center p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center mb-0.5">
                    <HiOutlineBookmark className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                  </div>
                  <p className="text-xl font-bold text-navy-800">
                    {user.totalBlogsPublished || 0}
                  </p>
                  <p className="text-xs text-navy-500 font-medium">Posts</p>
                </motion.div>
                <motion.div 
                  className="text-center p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center mb-0.5">
                    <HiOutlineUser className="w-3.5 h-3.5 text-pink-500 mr-1" />
                  </div>
                  <p className="text-xl font-bold text-navy-800">{followersCount}</p>
                  <p className="text-xs text-navy-500 font-medium">Followers</p>
                </motion.div>
                <motion.div 
                  className="text-center p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center mb-0.5">
                    <HiOutlineUser className="w-3.5 h-3.5 text-cyan-500 mr-1 transform rotate-180" />
                  </div>
                  <p className="text-xl font-bold text-navy-800">
                    {user.following?.length || 0}
                  </p>
                  <p className="text-xs text-navy-500 font-medium">Following</p>
                </motion.div>
                <motion.div 
                  className="text-center p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center mb-0.5">
                    <HiOutlineHeart className="w-3.5 h-3.5 text-amber-500 mr-1" />
                  </div>
                  <p className="text-xl font-bold text-navy-800">
                    {user.totalLikesReceived || 0}
                  </p>
                  <p className="text-xs text-navy-500 font-medium">Likes</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Details - Enhanced Cards */}
        <div className="grid md:grid-cols-3 gap-5 mt-6">
          {/* Contact Information */}
          <div className="card p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
            <h3 className="font-semibold text-navy-800 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <HiOutlineMail className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-sm">Contact</span>
            </h3>
            <div className="space-y-2.5">
              {user.email && (
                <div className="flex items-center gap-2.5 p-2 bg-white rounded-lg">
                  <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiOutlineMail className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span className="text-xs text-navy-700 truncate">{user.email}</span>
                </div>
              )}

              {user.contactNumber && (
                <div className="flex items-center gap-2.5 p-2 bg-white rounded-lg">
                  <div className="w-7 h-7 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiOutlinePhone className="w-3.5 h-3.5 text-pink-600" />
                  </div>
                  <span className="text-xs text-navy-700">{user.contactNumber}</span>
                </div>
              )}

              {(user.address?.fullAddress || user.address?.city || user.address?.country) && (
                <div className="flex items-start gap-2.5 p-2 bg-white rounded-lg">
                  <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineLocationMarker className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <span className="text-xs text-navy-700">
                    {[user.address.fullAddress, user.address.city, user.address.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}

              {!user.email && !user.contactNumber && !user.address?.city && (
                <p className="text-xs text-navy-400 italic text-center py-3">No contact info added</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="card p-5 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
            <h3 className="font-semibold text-navy-800 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-cyan-100 rounded-lg">
                <HiOutlineGlobe className="w-4 h-4 text-cyan-600" />
              </div>
              <span className="text-sm">Social Links</span>
            </h3>
            <div className="space-y-1.5">
              {user.socialLinks?.website && (
                <a
                  href={user.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2 bg-white rounded-lg hover:shadow-md transition-all text-cyan-700"
                >
                  <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiOutlineGlobe className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <span className="text-xs truncate">{user.socialLinks.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {user.socialLinks?.twitter && (
                <a
                  href={user.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2 bg-white rounded-lg hover:shadow-md transition-all text-cyan-700"
                >
                  <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                  <span className="text-xs truncate">{user.socialLinks.twitter.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {user.socialLinks?.linkedin && (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2 bg-white rounded-lg hover:shadow-md transition-all text-cyan-700"
                >
                  <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <span className="text-xs truncate">{user.socialLinks.linkedin.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {user.socialLinks?.github && (
                <a
                  href={user.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2 bg-white rounded-lg hover:shadow-md transition-all text-cyan-700"
                >
                  <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <span className="text-xs truncate">{user.socialLinks.github.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {!user.socialLinks?.website && !user.socialLinks?.twitter && !user.socialLinks?.linkedin && !user.socialLinks?.github && (
                <p className="text-xs text-navy-400 italic text-center py-3">No social links added</p>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
            <h3 className="font-semibold text-navy-800 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <HiOutlineCalendar className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-sm">Activity</span>
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 bg-white rounded-lg">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineCalendar className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-xs text-navy-700">
                  Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-white rounded-lg">
                <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <span className="text-xs text-navy-700">
                  Last active {format(new Date(user.lastActive), 'MMM d, yyyy')}
                </span>
              </div>

              {user.university && (
                <div className="flex items-center gap-2.5 p-2 bg-white rounded-lg">
                  <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiOutlineAcademicCap className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <span className="text-xs text-navy-700">{user.university}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;