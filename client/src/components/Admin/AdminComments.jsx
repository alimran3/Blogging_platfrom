import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineChatAlt
} from 'react-icons/hi';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const AdminComments = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-comments', page],
    queryFn: () => adminService.getComments({ page }),
    staleTime: 5000
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => adminService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Comment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    }
  });

  const handleDelete = (commentId) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(commentId);
    }
  };

  const comments = data?.comments || [];
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
              placeholder="Search comments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-elegant pl-12"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-500">Loading comments...</p>
        </div>
      ) : (
        <>
          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-navy-50 rounded-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 
                                   flex items-center justify-center flex-shrink-0">
                      <HiOutlineChatAlt className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-navy-800">{comment.author?.username}</span>
                        <span className="text-xs text-navy-400">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-navy-700 mb-2">{comment.content}</p>
                      <div className="flex items-center gap-2 text-xs text-navy-500">
                        <span>on</span>
                        <span className="font-medium text-gold-600">{comment.blog?.title || 'Deleted Blog'}</span>
                        {comment.likesCount > 0 && (
                          <span className="flex items-center gap-1 ml-2">
                            <HiOutlineChatAlt className="w-3 h-3" />
                            {comment.likesCount} likes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Delete Comment"
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

export default AdminComments;
