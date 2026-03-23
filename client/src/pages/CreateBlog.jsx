import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BlogEditor from '../components/Blog/BlogEditor';
import { useCreateBlog } from '../hooks/useBlogs';

const CreateBlog = () => {
  const navigate = useNavigate();
  const createMutation = useCreateBlog();

  const handleSubmit = async (formData) => {
    try {
      const result = await createMutation.mutateAsync(formData);
      navigate(`/blog/${result.blog.slug}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

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