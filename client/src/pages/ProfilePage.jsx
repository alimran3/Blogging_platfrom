import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import UserProfile from '../components/User/UserProfile';
import BlogGrid from '../components/Blog/BlogGrid';
import { userService } from '../services/userService';
import { blogService } from '../services/blogService';
import Loading from '../components/Common/Loading';

const ProfilePage = () => {
  const { id } = useParams();

  const { data: userData, isLoading: loadingUser, error: userError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: blogsData, isLoading: loadingBlogs } = useQuery({
    queryKey: ['user-blogs', id],
    queryFn: () => blogService.getUserBlogs(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    console.log('ProfilePage - User ID:', id);
    console.log('ProfilePage - User Data:', userData);
    console.log('ProfilePage - Loading:', loadingUser);
    console.log('ProfilePage - Error:', userError);
  }, [id, userData, loadingUser, userError]);

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (userError || !userData?.user) {
    console.error('Profile error:', userError);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-navy-800 mb-4">
            User not found
          </h1>
          <p className="text-navy-500">
            This user doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Profile Section */}
        <UserProfile
          user={userData.user}
          recentBlogs={userData.user.recentBlogs}
        />

        {/* User's Blogs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="font-serif text-2xl font-bold text-navy-800 mb-6">
            Published Blogs
          </h2>
          <BlogGrid
            blogs={blogsData?.blogs || []}
            isLoading={loadingBlogs}
            skeletonCount={3}
          />
        </motion.section>
      </div>
    </div>
  );
};

export default ProfilePage;