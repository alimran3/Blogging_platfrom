import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineHeart
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(data.email, data.password);
      } else {
        await registerUser(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-500 rounded-2xl
                            shadow-gold mx-auto mb-4 flex items-center justify-center">
              <span className="bengali-text text-2xl font-bold text-navy-900" style={{ fontFamily: "'AlinurAtithi', serif" }}>ন</span>
            </div>
            <h1 className="bengali-text text-3xl font-bold text-navy-900" style={{ fontFamily: "'AlinurAtithi', serif" }}>
              {isLogin ? 'Welcome Back' : 'Join মনের কিছু কথা'}
            </h1>
            <p className="text-navy-500 mt-2">
              {isLogin 
                ? 'Sign in to continue your journey' 
                : 'Create an account to start sharing'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5"
                >
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 
                                                w-5 h-5 text-navy-400" />
                      <input
                        type="text"
                        {...register('username', {
                          required: !isLogin && 'Username is required',
                          minLength: {
                            value: 3,
                            message: 'Username must be at least 3 characters'
                          }
                        })}
                        className="input-elegant pl-12"
                        placeholder="johndoe"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                    )}
                  </div>

                  {/* University */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      University (optional)
                    </label>
                    <div className="relative">
                      <HiOutlineAcademicCap className="absolute left-4 top-1/2 -translate-y-1/2
                                                       w-5 h-5 text-navy-400" />
                      <input
                        type="text"
                        {...register('university')}
                        className="input-elegant pl-12"
                        placeholder="Stanford University"
                      />
                    </div>
                  </div>

                  {/* Security Hobby */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Security Hobby *
                    </label>
                    <div className="relative">
                      <HiOutlineHeart className="absolute left-4 top-1/2 -translate-y-1/2
                                                       w-5 h-5 text-navy-400" />
                      <input
                        type="text"
                        {...register('securityHobby', {
                          required: !isLogin && 'Security hobby is required',
                          minLength: {
                            value: 3,
                            message: 'Hobby must be at least 3 characters'
                          }
                        })}
                        className="input-elegant pl-12"
                        placeholder="Reading, gaming, traveling..."
                      />
                    </div>
                    <p className="text-xs text-navy-400 mt-1">
                      This will be used for password recovery
                    </p>
                    {errors.securityHobby && (
                      <p className="text-red-500 text-sm mt-1">{errors.securityHobby.message}</p>
                    )}
                  </div>

                  {/* Hobbies */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Hobbies (optional)
                    </label>
                    <div className="relative">
                      <HiOutlineHeart className="absolute left-4 top-1/2 -translate-y-1/2
                                                       w-5 h-5 text-navy-400" />
                      <input
                        type="text"
                        {...register('hobbies')}
                        className="input-elegant pl-12"
                        placeholder="Reading, traveling, coding, music..."
                      />
                    </div>
                    <p className="text-xs text-navy-400 mt-1">
                      Separate with commas (e.g., reading, traveling, coding)
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Email
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 
                                          w-5 h-5 text-navy-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Please enter a valid email'
                    }
                  })}
                  className="input-elegant pl-12"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 
                                                w-5 h-5 text-navy-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="input-elegant pl-12 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400
                             hover:text-navy-600"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
              {isLogin && (
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-gold-600 hover:text-gold-700 font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-navy-300 border-t-navy-600 
                                   rounded-full animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-navy-500">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-2 text-gold-600 font-semibold hover:text-gold-700"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;