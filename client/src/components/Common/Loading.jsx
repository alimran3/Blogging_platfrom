import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} border-navy-200 border-t-gold-500 rounded-full`}
      />
      {text && (
        <p className="mt-4 text-navy-500 font-medium">{text}</p>
      )}
    </div>
  );
};

export const FullPageLoading = () => (
  <div className="fixed inset-0 bg-cream-50 flex items-center justify-center z-50">
    <div className="text-center">
      <motion.div
        className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-500 rounded-2xl
                   shadow-gold mx-auto mb-4"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <p className="font-serif text-xl text-navy-800">Loading...</p>
    </div>
  </div>
);

export default Loading;