import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlinePencil,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineViewGrid,
  HiOutlineShieldCheck
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BASE_URL}${url}`;
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-navy-100/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-500 rounded-xl
                         shadow-gold flex items-center justify-center"
              whileHover={{ rotate: 5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-serif text-navy-900 font-bold text-lg" style={{ fontFamily: "'AlinurAtithi', serif" }}>ন</span>
            </motion.div>
            <span className="bengali-text text-xl md:text-2xl font-bold gradient-text hidden sm:block" style={{ fontFamily: "'AlinurAtithi', serif" }}>
              মনের কিছু কথা
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-navy-600 hover:text-navy-900 font-medium transition-colors"
            >
              Explore
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  className="btn-gold flex items-center gap-2"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                  Write
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-navy-50 transition-colors"
                  >
                    <img
                      src={getFullImageUrl(user?.avatar?.url) || '/default-avatar.svg'}
                      alt={user?.username}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-gold-300"
                      onError={(e) => {
                        e.target.src = '/default-avatar.svg';
                      }}
                    />
                    <span className="font-medium text-navy-800">{user?.username}</span>
                  </button>
                  
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl
                                   shadow-elegant-lg border border-navy-100 overflow-hidden"
                      >
                        <div className="p-2">
                          <Link
                            to={`/profile/${user?._id}`}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl
                                       hover:bg-navy-50 transition-colors"
                          >
                            <HiOutlineUser className="w-5 h-5 text-navy-500" />
                            <span className="text-navy-800">My Profile</span>
                          </Link>
                          <Link
                            to="/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl
                                       hover:bg-navy-50 transition-colors"
                          >
                            <HiOutlineViewGrid className="w-5 h-5 text-navy-500" />
                            <span className="text-navy-800">Profile Settings</span>
                          </Link>
                          {(user?.role === 'admin' || user?.role === 'moderator') && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl
                                         hover:bg-gold-50 transition-colors"
                            >
                              <HiOutlineShieldCheck className="w-5 h-5 text-gold-600" />
                              <span className="text-gold-700 font-semibold">Admin Panel</span>
                            </Link>
                          )}
                          <hr className="my-2 border-navy-100" />
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                       hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <HiOutlineLogout className="w-5 h-5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/create"
                  className="btn-gold flex items-center gap-2"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                  <span className="hidden lg:inline">Start Writing</span>
                </Link>
                <Link to="/auth" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-navy-50 transition-colors"
          >
            {isMenuOpen ? (
              <HiOutlineX className="w-6 h-6 text-navy-800" />
            ) : (
              <HiOutlineMenu className="w-6 h-6 text-navy-800" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-navy-100"
            >
              <div className="py-4 space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-navy-50 text-navy-800
                             font-medium transition-colors"
                >
                  Explore
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/create"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl bg-gold-400 text-navy-900
                                 font-semibold text-center"
                    >
                      Write a Blog
                    </Link>
                    <Link
                      to={`/profile/${user?._id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl hover:bg-navy-50
                                 text-navy-800 font-medium transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl hover:bg-navy-50
                                 text-navy-800 font-medium transition-colors"
                    >
                      Profile Settings
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'moderator') && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 rounded-xl hover:bg-gold-50
                                   text-gold-700 font-semibold transition-colors"
                      >
                        <HiOutlineShieldCheck className="w-5 h-5 inline mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50
                                 text-red-600 font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/create"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl bg-gold-400 hover:bg-gold-500
                                 text-navy-900 font-semibold text-center transition-colors
                                 shadow-lg shadow-gold-400/30"
                    >
                      <HiOutlinePencil className="w-5 h-5 inline mr-2" />
                      Start Writing
                    </Link>
                    <Link
                      to="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl bg-navy-800 hover:bg-navy-700
                                 text-white font-semibold text-center transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;