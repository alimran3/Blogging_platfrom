import React from 'react';
import BlogFeedItem from './BlogFeedItem';
import BlogCardSkeleton from './BlogCardSkeleton';
import { motion } from 'framer-motion';

const BlogFeed = ({ blogs, isLoading, skeletonCount = 3 }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-[700px] mx-auto">
        {[...Array(skeletonCount)].map((_, i) => (
          <BlogCardSkeleton key={i} variant="feed" />
        ))}
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 max-w-[700px] mx-auto"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-navy-100 rounded-full
                        flex items-center justify-center">
          <svg
            className="w-12 h-12 text-navy-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </div>
        <h3 className="font-serif text-2xl font-bold text-navy-800 mb-2">
          No blogs found
        </h3>
        <p className="text-navy-500">
          Be the first to share your story with the world.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[700px] mx-auto">
      {blogs.map((blog, index) => (
        <BlogFeedItem key={blog._id} blog={blog} index={index} />
      ))}
    </div>
  );
};

export default BlogFeed;
