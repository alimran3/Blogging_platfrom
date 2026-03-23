import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHome } from 'react-icons/hi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-navy-100 to-navy-200 
                        rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="font-serif text-6xl font-bold text-navy-400">404</span>
        </div>
        <h1 className="font-serif text-4xl font-bold text-navy-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-navy-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <Link to="/" className="btn-gold inline-flex items-center gap-2">
          <HiOutlineHome className="w-5 h-5" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;