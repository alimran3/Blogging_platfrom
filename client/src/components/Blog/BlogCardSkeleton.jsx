import React from 'react';

const BlogCardSkeleton = () => {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[16/10] skeleton" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="space-y-2">
            <div className="h-4 w-24 skeleton" />
            <div className="h-3 w-16 skeleton" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-6 w-full skeleton" />
          <div className="h-6 w-3/4 skeleton" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-2/3 skeleton" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 skeleton rounded-lg" />
          <div className="h-6 w-16 skeleton rounded-lg" />
          <div className="h-6 w-16 skeleton rounded-lg" />
        </div>
        <div className="flex justify-between pt-4 border-t border-navy-100">
          <div className="flex gap-4">
            <div className="h-5 w-12 skeleton" />
            <div className="h-5 w-12 skeleton" />
          </div>
          <div className="h-5 w-16 skeleton" />
        </div>
      </div>
    </div>
  );
};

export default BlogCardSkeleton;