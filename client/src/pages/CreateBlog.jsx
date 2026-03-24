import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BlogEditor from '../components/Blog/BlogEditor';
import { useCreateBlog } from '../hooks/useBlogs';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const createMutation = useCreateBlog();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to create a blog');
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (formData) => {
    try {
      const result = await createMutation.mutateAsync(formData);
      if (result?.blog?.slug) {
        navigate(`/blog/${result.blog.slug}`);
      } else {
        toast.success('Blog created successfully!');
        navigate('/');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create blog. Please try again.';
      toast.error(message);
      console.error('Create blog error:', error);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-navy-200 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 mb-2">
            Create New Blog
          </h1>
          <p className="text-navy-500 mb-8">
            Share your story with the world. Let your creativity flow.
          </p>

          <BlogEditor
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isLoading}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default CreateBlog;