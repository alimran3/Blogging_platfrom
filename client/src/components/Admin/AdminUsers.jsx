import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineTrash,
  HiOutlineBan,
  HiOutlineCheck
} from 'react-icons/hi';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import Modal from '../Common/Modal';

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

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => adminService.getUsers({ page, search, role: roleFilter }),
    staleTime: 5000
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
      setShowRoleModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, isBanned }) => adminService.banUser(userId, isBanned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: () => {
      toast.error('Failed to update user status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
      setSelectedUser(null);
    },
    onError: () => {
      toast.error('Failed to delete user');
    }
  });

  const handleRoleChange = (role) => {
    if (selectedUser) {
      updateRoleMutation.mutate({ userId: selectedUser._id, role });
    }
  };

  const handleBan = () => {
    if (selectedUser) {
      banMutation.mutate({ userId: selectedUser._id, isBanned: selectedUser.isActive });
    }
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser._id);
    }
  };

  const users = data?.users || [];
  const pagination = data?.pagination || {};

  return (
    <div className="card p-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-elegant pl-12"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-elegant"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-500">Loading users...</p>
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Blogs</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-navy-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const avatarUrl = getFullImageUrl(user.avatar?.url);
                  const hasDefaultAvatar = !user.avatar?.url ||
                    user.avatar.url.includes('default') ||
                    user.avatar.url === 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png';

                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-navy-50 hover:bg-navy-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0
                                       ${hasDefaultAvatar ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : ''}`}>
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
                          <div>
                            <p className="font-medium text-navy-800">{user.username}</p>
                            <p className="text-xs text-navy-500">{user.university || '-'}</p>
                          </div>
                        </div>
                      </td>
                    <td className="py-3 px-4 text-sm text-navy-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium capitalize
                                      ${user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                        user.role === 'moderator' ? 'bg-purple-100 text-purple-700' :
                                        'bg-navy-100 text-navy-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-navy-600">{user.totalBlogsPublished || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium
                                      ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                          className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                          title="Change Role"
                        >
                          <HiOutlineShieldCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            handleBan();
                          }}
                          className={`p-2 rounded-lg transition-colors
                                    ${user.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={user.isActive ? 'Ban User' : 'Unban User'}
                        >
                          <HiOutlineBan className="w-5 h-5" />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              if (confirm(`Are you sure you want to delete ${user.username}?`)) {
                                handleDelete();
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-navy-100">
              <p className="text-sm text-navy-500">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-navy-200 text-navy-600 
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 rounded-lg border border-navy-200 text-navy-600 
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <Modal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          title={`Change Role - ${selectedUser.username}`}
        >
          <div className="space-y-3">
            <p className="text-sm text-navy-600 mb-4">
              Select a new role for this user:
            </p>
            {['user', 'moderator', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                disabled={updateRoleMutation.isLoading}
                className={`w-full p-3 rounded-xl text-left font-medium transition-all
                          ${selectedUser.role === role
                            ? 'bg-gold-100 text-gold-700 border-2 border-gold-400'
                            : 'bg-navy-50 text-navy-700 border-2 border-transparent hover:bg-navy-100'
                          }`}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{role}</span>
                  {selectedUser.role === role && (
                    <HiOutlineCheck className="w-5 h-5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsers;
