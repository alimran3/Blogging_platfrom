import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChatAlt,
  HiOutlineChartBar,
  HiOutlineUserCircle,
  HiOutlineShieldCheck
} from 'react-icons/hi';
import AdminStats from '../../components/Admin/AdminStats';
import AdminUsers from '../../components/Admin/AdminUsers';
import AdminBlogs from '../../components/Admin/AdminBlogs';
import AdminComments from '../../components/Admin/AdminComments';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');

  // Check if user is admin or moderator
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: HiOutlineChartBar },
    { id: 'users', label: 'Users', icon: HiOutlineUsers },
    { id: 'blogs', label: 'Blogs', icon: HiOutlineDocumentText },
    { id: 'comments', label: 'Comments', icon: HiOutlineChatAlt }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats />;
      case 'users':
        return <AdminUsers />;
      case 'blogs':
        return <AdminBlogs />;
      case 'comments':
        return <AdminComments />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-navy-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-500 rounded-2xl">
              <HiOutlineShieldCheck className="w-8 h-8 text-navy-900" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-900">
                Admin Dashboard
              </h1>
              <p className="text-navy-500 mt-1">
                Manage your blog platform
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="card p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                             ${activeTab === tab.id
                               ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 shadow-md'
                               : 'text-navy-600 hover:bg-navy-50'
                             }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
