import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineTrash,
  HiOutlineCog,
  HiOutlinePhotograph,
  HiOutlineGlobe
} from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { blogService } from '../services/blogService';
import { userService } from '../services/userService';
import { useDeleteBlog } from '../hooks/useBlogs';
import Modal from '../components/Common/Modal';
import ImageUpload from '../components/Common/ImageUpload';
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

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('blogs');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const deleteMutation = useDeleteBlog();

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['my-blogs'],
    queryFn: () => blogService.getUserBlogs(user._id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    hobbies: user?.hobbies || '',
    university: user?.university || '',
    contactNumber: user?.contactNumber || '',
    address: user?.address?.fullAddress || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    country: user?.address?.country || '',
    website: user?.socialLinks?.website || '',
    twitter: user?.socialLinks?.twitter || '',
    linkedin: user?.socialLinks?.linkedin || '',
    github: user?.socialLinks?.github || ''
  });

  // Update profile data when user data changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        bio: user.bio || '',
        hobbies: user.hobbies || '',
        university: user.university || '',
        contactNumber: user.contactNumber || '',
        address: user.address?.fullAddress || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        country: user.address?.country || '',
        website: user.socialLinks?.website || '',
        twitter: user.socialLinks?.twitter || '',
        linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || ''
      });
    }
  }, [user]);

  const handleDeleteBlog = async (blogId) => {
    try {
      await deleteMutation.mutateAsync(blogId);
      setDeleteConfirm(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.updateProfile({
        username: profileData.username,
        bio: profileData.bio,
        hobbies: profileData.hobbies,
        university: profileData.university,
        contactNumber: profileData.contactNumber,
        address: {
          fullAddress: profileData.address,
          city: profileData.city,
          state: profileData.state,
          country: profileData.country
        },
        socialLinks: {
          website: profileData.website,
          twitter: profileData.twitter,
          linkedin: profileData.linkedin,
          github: profileData.github
        }
      });
      updateUser(response.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (file) => {
    console.log('Avatar upload triggered - file:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    
    console.log('FormData created, uploading...');

    try {
      const response = await userService.updateAvatar(formData);
      console.log('Upload response:', response);
      updateUser({ avatar: response.avatar });
      toast.success('Avatar updated!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to update avatar');
    }
  };

  const blogs = blogsData?.blogs || [];

  const stats = [
    { label: 'Total Blogs', value: blogs.length, icon: HiOutlinePencil },
    { label: 'Total Views', value: blogs.reduce((acc, b) => acc + b.views, 0), icon: HiOutlineEye },
    { label: 'Total Likes', value: blogs.reduce((acc, b) => acc + b.likesCount, 0), icon: HiOutlineHeart }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-900">
              Profile Settings
            </h1>
            <p className="text-navy-500 mt-2">
              Manage your profile and personal settings
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-navy-800">{stat.value}</p>
                <p className="text-sm text-navy-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-6 py-3 rounded-xl font-medium transition-all
                         ${activeTab === 'blogs'
                           ? 'bg-gold-400 text-navy-900 shadow-lg shadow-gold-400/30'
                           : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
                         }`}
            >
              My Blogs
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-xl font-medium transition-all
                         ${activeTab === 'settings'
                           ? 'bg-gold-400 text-navy-900 shadow-lg shadow-gold-400/30'
                           : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
                         }`}
            >
              Settings
            </button>
          </div>

          {/* Content */}
          {activeTab === 'blogs' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-6"
            >
              <div className="border-b border-navy-100 pb-4 mb-4 flex justify-between items-center">
                <h2 className="font-semibold text-navy-800 text-lg">Your Blogs</h2>
                <Link to="/create" className="btn-gold text-sm">
                  Create New
                </Link>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-navy-200 border-t-gold-500 
                                  rounded-full animate-spin mx-auto" />
                </div>
              ) : blogs.length === 0 ? (
                <div className="p-12 text-center">
                  <HiOutlinePencil className="w-12 h-12 text-navy-300 mx-auto mb-4" />
                  <p className="text-navy-500 mb-4">You haven't written any blogs yet</p>
                  <Link to="/create" className="btn-primary">
                    Write Your First Blog
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-navy-100">
                  {blogs.map((blog) => {
                    const hasCoverImage = blog.coverImage?.url && 
                      !blog.coverImage.url.includes('default') &&
                      blog.coverImage.url !== '';
                    
                    return (
                      <div key={blog._id} className="p-4 flex items-center gap-4 border-b border-navy-50 last:border-0">
                        {hasCoverImage ? (
                          <img
                            src={blog.coverImage.url}
                            alt={blog.title}
                            className="w-20 h-14 object-cover rounded-xl flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="w-20 h-14 rounded-xl flex-shrink-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center"><svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="w-20 h-14 rounded-xl flex-shrink-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              to={`/blog/${blog.slug}`}
                              className="font-medium text-navy-800 hover:text-gold-600
                                         transition-colors line-clamp-1"
                            >
                              {blog.title}
                            </Link>
                            {/* Status Badge */}
                            {blog.status === 'draft' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                Draft
                              </span>
                            )}
                            {/* Visibility Badge */}
                            {blog.visibility === 'private' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Private
                              </span>
                            )}
                            {blog.visibility === 'unlisted' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Unlisted
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-navy-500 mt-1">
                            <span>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</span>
                            <span className="flex items-center gap-1">
                              <HiOutlineEye className="w-4 h-4" />
                              {blog.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <HiOutlineHeart className="w-4 h-4" />
                              {blog.likesCount}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/edit/${blog._id}`}
                            className="p-2 text-navy-500 hover:text-gold-600
                                       hover:bg-gold-50 rounded-lg transition-colors"
                          >
                            <HiOutlinePencil className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(blog._id)}
                            className="p-2 text-navy-500 hover:text-red-500
                                       hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-6"
            >
              <h2 className="font-semibold text-navy-800 mb-6 flex items-center gap-2">
                <HiOutlineCog className="w-5 h-5" />
                Profile Settings
              </h2>

              {/* Avatar Section */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-navy-100">
                <div className="relative">
                  <img
                    src={getFullImageUrl(user?.avatar?.url) || '/default-avatar.svg'}
                    alt={user?.username}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-gold-200"
                    onError={(e) => {
                      e.target.src = '/default-avatar.svg';
                    }}
                  />
                  <label className="absolute -bottom-2 -right-2 p-2 bg-gold-400 
                                    text-navy-900 rounded-full cursor-pointer
                                    hover:bg-gold-500 transition-colors shadow-lg">
                    <HiOutlinePhotograph className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarUpload(e.target.files[0])}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-semibold text-navy-800">{user?.username}</h3>
                  <p className="text-sm text-navy-500">{user?.email}</p>
                  <p className="text-xs text-navy-400 mt-1">
                    Max 2MB • JPEG, PNG, WebP
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="input-elegant"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      value={profileData.university}
                      onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                      className="input-elegant"
                      placeholder="Your university"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="input-elegant resize-none"
                    rows={4}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <p className="text-sm text-navy-400 mt-1 text-right">
                    {profileData.bio.length}/500
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Hobbies
                  </label>
                  <input
                    type="text"
                    value={profileData.hobbies}
                    onChange={(e) => setProfileData({ ...profileData, hobbies: e.target.value })}
                    className="input-elegant"
                    placeholder="Reading, traveling, coding, music, sports..."
                    maxLength={300}
                  />
                  <p className="text-sm text-navy-400 mt-1 text-right">
                    {profileData.hobbies.length}/300
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.contactNumber}
                      onChange={(e) => setProfileData({ ...profileData, contactNumber: e.target.value })}
                      className="input-elegant"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      className="input-elegant"
                      placeholder="Dhaka"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                      className="input-elegant"
                      placeholder="Bangladesh"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="input-elegant"
                    placeholder="123 Main Street, House #45"
                  />
                </div>

                {/* Social Links Section */}
                <div className="pt-4 border-t border-navy-100">
                  <h3 className="font-semibold text-navy-800 mb-4">Social Links</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        <HiOutlineGlobe className="w-4 h-4 inline mr-1" />
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        className="input-elegant"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={profileData.twitter}
                        onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                        className="input-elegant"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                        className="input-elegant"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={profileData.github}
                        onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                        className="input-elegant"
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" className="btn-gold">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Blog"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineTrash className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-navy-600 mb-6">
            Are you sure you want to delete this blog? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteBlog(deleteConfirm)}
              disabled={deleteMutation.isLoading}
              className="px-6 py-3 bg-red-500 text-white font-semibold rounded-2xl
                         hover:bg-red-600 transition-colors"
            >
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;