import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BlogEditor from '../components/Blog/BlogEditor';
import { useBlog, useUpdateBlog } from '../hooks/useBlogs';
import Loading from '../components/Common/Loading';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useBlog(id);
  const updateMutation = useUpdateBlog();

  const handleSubmit = async (formData) => {
    try {
      const result = await updateMutation.mutateAsync({ id, formData });
      navigate(`/blog/${result.blog.slug}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading blog..." />
      </div>
    );
  }

  if (!data?.blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-navy-500">Blog not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 mb-2">
            Edit Blog
          </h1>
          <p className="text-navy-500 mb-8">
            Update your story and make it even better.
          </p>

          <BlogEditor
            initialData={data.blog}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isLoading}
            submitLabel="Update"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default EditBlog;