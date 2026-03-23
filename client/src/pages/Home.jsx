import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineFilter, 
  HiOutlineSparkles, 
  HiOutlineLightBulb, 
  HiOutlineHeart, 
  HiOutlineMap, 
  HiOutlineCake, 
  HiOutlineBriefcase,
  HiFire, 
  HiChartBar, 
  HiClock,
  HiHeart 
} from 'react-icons/hi';
import BlogFeed from '../components/Blog/BlogFeed';
import Sidebar from '../components/Layout/Sidebar';
import { useInfiniteBlogs } from '../hooks/useBlogs';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const categories = [
  { value: 'all', label: 'All', icon: HiOutlineSparkles, gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50', text: 'text-purple-600', border: 'hover:border-purple-300' },
  { value: 'technology', label: 'Technology', icon: HiOutlineLightBulb, gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'hover:border-cyan-300' },
  { value: 'lifestyle', label: 'Lifestyle', icon: HiOutlineHeart, gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', text: 'text-pink-600', border: 'hover:border-pink-300' },
  { value: 'travel', label: 'Travel', icon: HiOutlineMap, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'hover:border-emerald-300' },
  { value: 'food', label: 'Food', icon: HiOutlineCake, gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-50', text: 'text-orange-600', border: 'hover:border-orange-300' },
  { value: 'health', label: 'Health', icon: HiHeart, gradient: 'from-red-500 to-pink-500', bg: 'bg-red-50', text: 'text-red-600', border: 'hover:border-red-300' },
  { value: 'business', label: 'Business', icon: HiOutlineBriefcase, gradient: 'from-slate-600 to-slate-800', bg: 'bg-slate-50', text: 'text-slate-600', border: 'hover:border-slate-300' }
];

const sortOptions = [
  { value: 'latest', label: 'Latest', icon: HiClock },
  { value: 'popular', label: 'Most Liked', icon: HiFire },
  { value: 'views', label: 'Most Viewed', icon: HiChartBar }
];

const Home = () => {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteBlogs({ category, sort, search });

  const { ref } = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  const blogs = data?.pages?.flatMap(page => page.blogs) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 py-10 md:py-12 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Bengali Welcome */}
            <p
              style={{ fontFamily: "'AlinurAtithi', serif", display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(34,211,238,0.3)', padding: '0.4rem 0.9rem', borderRadius: '9999px', marginBottom: '0.75rem', fontSize: '0.875rem' }}
            >
              <span className="text-cyan-300 font-semibold">
                ✨ স্বাগতম to মনের কিছু কথা
              </span>
            </p>

            {/* Main Heading */}
            <h1
              style={{ fontFamily: "'AlinurAtithi', serif", fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 'bold', marginBottom: '0.75rem', lineHeight: 'tight' }}
            >
              <span className="text-cyan-200">যেখানে আপনার কথা পাবে</span>{' '}
              <span className="text-cyan-400">নতুন ঠিকানা</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-cyan-200 mb-6 max-w-2xl mx-auto font-medium">
              A platform where thoughts become stories, stories connect people.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Blog Feed */}
            <div className="flex-1">
              {/* Category Section */}
              <div className="mb-6">
                {/* Section Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-5"
                >
                  <div>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-navy-900">
                      Explore Categories
                    </h2>
                    <p className="text-xs text-navy-500 mt-1">
                      Discover stories that match your interests
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gold-100 to-amber-100 rounded-full">
                    <HiOutlineSparkles className="w-3.5 h-3.5 text-gold-600" />
                    <span className="text-xs font-semibold text-gold-700">
                      {categories.length} Categories
                    </span>
                  </div>
                </motion.div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {categories.map((cat, index) => {
                    const Icon = cat.icon;
                    const isActive = category === cat.value;
                    
                    return (
                      <motion.button
                        key={cat.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setCategory(cat.value)}
                        className={`relative group p-3 rounded-xl border-2 transition-all duration-300
                                   ${isActive
                                     ? `bg-gradient-to-br ${cat.gradient} border-transparent shadow-md scale-105`
                                     : `${cat.bg} border-transparent ${cat.border} hover:shadow-sm`
                                   }`}
                      >
                        {/* Icon */}
                        <div className={`mb-1.5 flex justify-center transition-transform duration-300
                                       ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : cat.text}`} />
                        </div>
                        
                        {/* Label */}
                        <p className={`text-xs font-semibold text-center ${isActive ? 'text-white' : 'text-navy-700'}`}>
                          {cat.label}
                        </p>
                        
                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full shadow-md
                                       flex items-center justify-center"
                          >
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${cat.gradient}`} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Bar */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-navy-100">
                <p className="text-xs font-medium text-navy-600">
                  Showing {blogs.length} {blogs.length === 1 ? 'post' : 'posts'}
                </p>
                
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-navy-500 hidden sm:inline">Sort by:</span>
                  <div className="relative group">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="appearance-none bg-white border-2 border-navy-100 rounded-lg
                                 px-3 py-1.5 pr-8 text-xs font-semibold text-navy-700
                                 focus:border-gold-400 focus:outline-none cursor-pointer
                                 hover:border-navy-200 transition-colors shadow-sm"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                      <HiOutlineFilter className="w-3.5 h-3.5 text-navy-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Feed */}
              <BlogFeed blogs={blogs} isLoading={isLoading && !blogs.length} />

              {/* Load More Trigger */}
              <div ref={ref} className="py-8 flex justify-center">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-3 text-navy-500">
                    <span className="w-6 h-6 border-2 border-navy-200 border-t-gold-500 
                                     rounded-full animate-spin" />
                    Loading more...
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <Sidebar />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;