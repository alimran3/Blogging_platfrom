import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import BlogReader from '../components/Blog/BlogReader';
import { useBlog } from '../hooks/useBlogs';
import Loading from '../components/Common/Loading';

const BlogPage = () => {
  const { slug } = useParams();
  const { data, isLoading, error } = useBlog(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading blog..." />
      </div>
    );
  }

  if (error || !data?.blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-navy-800 mb-4">
            Blog not found
          </h1>
          <p className="text-navy-500 mb-6">
            The blog you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="btn-primary">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-navy-600 hover:text-gold-600
                       transition-colors font-medium"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </motion.div>

        {/* Blog Reader */}
        <BlogReader blog={data.blog} />
      </div>
    </div>
  );
};

export default BlogPage;