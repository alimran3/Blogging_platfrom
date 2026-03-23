import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi';

const LikeButton = ({ 
  isLiked, 
  count, 
  onClick, 
  disabled = false,
  size = 'md' 
}) => {
  const sizes = {
    sm: { icon: 'w-4 h-4', text: 'text-sm', padding: 'px-3 py-1.5' },
    md: { icon: 'w-5 h-5', text: 'text-base', padding: 'px-4 py-2' },
    lg: { icon: 'w-6 h-6', text: 'text-lg', padding: 'px-5 py-2.5' }
  };

  const currentSize = sizes[size];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      className={`flex items-center gap-2 ${currentSize.padding} rounded-full font-medium
                 ${isLiked 
                   ? 'bg-red-50 text-red-500' 
                   : 'bg-navy-50 text-navy-600 hover:bg-red-50 hover:text-red-500'
                 } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <motion.span
        key={isLiked ? 'liked' : 'not-liked'}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        {isLiked ? (
          <HiHeart className={currentSize.icon} />
        ) : (
          <HiOutlineHeart className={currentSize.icon} />
        )}
      </motion.span>
      <span className={currentSize.text}>{count}</span>
    </motion.button>
  );
};

export default LikeButton;