import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineTrash,
  HiOutlineExternalLink
} from 'react-icons/hi';
import { adminService } from '../../services/adminService';
import { Link } from 'react-router-dom';
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

const AdminBlogs = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blogs', page, search, statusFilter],
    queryFn: () => adminService.getBlogs({ page, search, status: statusFilter }),
    staleTime: 5000
  });

  const deleteMutation = useMutation({
    mutationFn: (blogId) => adminService.deleteBlog(blogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Blog deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete blog');
    }
  });

  const handleDelete = (blogId) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      deleteMutation.mutate(blogId);
    }
  };

  const blogs = data?.blogs || [];
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
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-elegant pl-12"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-elegant"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-500">Loading blogs...</p>
        </div>
      ) : (
        <>
          {/* Blogs List */}
          <div className="space-y-4">
            {blogs.map((blog) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-4 bg-navy-50 rounded-xl"
              >
                {/* Cover Image */}
                <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
                  {blog.coverImage?.url ? (
                    <img
                      src={getFullImageUrl(blog.coverImage.url)}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HiOutlineExternalLink className="w-6 h-6 text-white/70" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="font-medium text-navy-800 hover:text-gold-600 truncate block"
                  >
                    {blog.title}
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-navy-500 mt-1">
                    <span>by {blog.author?.username}</span>
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

                {/* Status */}
                <span className={`text-xs px-2 py-1 rounded-lg font-medium capitalize
                                ${blog.status === 'published' ? 'bg-green-100 text-green-700' :
                                  blog.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                                  'bg-navy-100 text-navy-700'}`}>
                  {blog.status}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`/blog/${blog.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                    title="View Blog"
                  >
                    <HiOutlineExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Blog"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
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
    </div>
  );
};

export default AdminBlogs;
