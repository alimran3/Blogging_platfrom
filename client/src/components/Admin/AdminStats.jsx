import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChatAlt,
  HiOutlineUserGroup,
  HiOutlineTrendingUp,
  HiOutlineClock
} from 'react-icons/hi';
import { adminService } from '../../services/adminService';
import { Link } from 'react-router-dom';
import Loading from '../Common/Loading';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BASE_URL}${url}`;
};

// Modern Avatar Icon Component
const ModernAvatarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
  </svg>
);

const AdminStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const stats = data?.stats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading size="lg" text="Loading statistics..." />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: HiOutlineUsers,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Blogs',
      value: stats?.totalBlogs || 0,
      icon: HiOutlineDocumentText,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Comments',
      value: stats?.totalComments || 0,
      icon: HiOutlineChatAlt,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: HiOutlineUserGroup,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'New Users Today',
      value: stats?.newUsersToday || 0,
      icon: HiOutlineTrendingUp,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'New Blogs Today',
      value: stats?.newBlogsToday || 0,
      icon: HiOutlineClock,
      color: 'from-rose-500 to-red-500',
      bgColor: 'bg-rose-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4 text-center"
            >
              <div className={`${stat.bgColor} w-12 h-12 rounded-xl mx-auto mb-3 
                            flex items-center justify-center`}>
                <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} 
                      style={{ WebkitTextFillColor: 'transparent' }} />
              </div>
              <p className="text-2xl font-bold text-navy-800">{stat.value}</p>
              <p className="text-xs text-navy-500 mt-1">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Top Bloggers */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-serif text-xl font-bold text-navy-800 mb-4">
            Top Bloggers
          </h3>
          <div className="space-y-3">
            {stats?.topBloggers?.map((blogger, index) => {
              const avatarUrl = getFullImageUrl(blogger.avatar?.url);
              const hasDefaultAvatar = !blogger.avatar?.url || 
                blogger.avatar.url.includes('default') || 
                blogger.avatar.url === 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png';
              
              return (
              <motion.div
                key={blogger._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-navy-50 rounded-xl"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-500
                               rounded-full flex items-center justify-center text-navy-900 font-bold text-sm">
                  {index + 1}
                </div>
                <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0
                             ${hasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}`}>
                  {hasDefaultAvatar ? (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <ModernAvatarIcon className="w-5 h-5" />
                    </div>
                  ) : (
                    <img
                      src={avatarUrl || '/default-avatar.svg'}
                      alt={blogger.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/></svg></div>';
                      }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-navy-800">{blogger.username}</p>
                  <p className="text-xs text-navy-500">{blogger.totalBlogsPublished} blogs</p>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card p-6">
          <h3 className="font-serif text-xl font-bold text-navy-800 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats?.recentActivities?.map((activity, index) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-navy-50 rounded-xl"
              >
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full 
                                 ${activity.status === 'published' ? 'bg-green-500' : 'bg-amber-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/blog/${activity.slug}`}
                    className="font-medium text-navy-800 hover:text-gold-600 truncate block"
                  >
                    {activity.title}
                  </Link>
                  <p className="text-xs text-navy-500">
                    by {activity.author?.username} • {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium capitalize
                                ${activity.status === 'published' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-amber-100 text-amber-700'}`}>
                  {activity.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
