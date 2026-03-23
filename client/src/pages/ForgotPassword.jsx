import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineKey, HiOutlineHeart } from 'react-icons/hi';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Verify Hobby, 3: Reset Password
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [securityHobby, setSecurityHobby] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [userHobby, setUserHobby] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1: Verify email and get hobby hint
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Just verify email exists (we'll do hobby check in step 2)
      const response = await api.post('/password-reset/verify-hobby', { 
        email, 
        securityHobby: 'temp' // Temporary, will fail but tells us if email exists
      });
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('No account found with this email');
        setIsLoading(false);
        return;
      }
      // Other errors are expected here
    }
    
    setStep(2);
    setIsLoading(false);
  };

  // Step 2: Verify hobby
  const handleVerifyHobby = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post('/password-reset/verify-hobby', { 
        email, 
        securityHobby 
      });
      setResetToken(response.data.resetToken);
      setUserHobby(response.data.hint);
      toast.success('Hobby verified!');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Incorrect hobby answer');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      await api.post('/password-reset/reset-password', { resetToken, newPassword });
      toast.success('Password reset successfully! Please login.');
      setTimeout(() => navigate('/auth'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-navy-50 to-navy-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-500 rounded-2xl
                            shadow-gold mx-auto mb-4 flex items-center justify-center">
              <HiOutlineKey className="w-8 h-8 text-navy-900" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy-900">
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Security Question'}
              {step === 3 && 'New Password'}
            </h1>
            <p className="text-navy-500 mt-2">
              {step === 1 && 'Enter your email to continue'}
              {step === 2 && 'Answer your security question'}
              {step === 3 && 'Create a new password'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  s === step ? 'bg-gold-500 w-8' : 'bg-navy-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Email Form */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyEmail}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-elegant pl-12"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-gold w-full"
                >
                  {isLoading ? 'Checking...' : 'Continue'}
                </button>
              </motion.form>
            )}

            {/* Step 2: Hobby Verification */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyHobby}
                className="space-y-5"
              >
                <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gold-800 font-medium">
                    🔒 For your security, please answer your security question
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    <HiOutlineHeart className="w-4 h-4 inline mr-1 text-gold-500" />
                    What is your hobby?
                  </label>
                  <div className="relative">
                    <HiOutlineKey className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <input
                      type="text"
                      value={securityHobby}
                      onChange={(e) => setSecurityHobby(e.target.value)}
                      className="input-elegant pl-12"
                      placeholder="Enter your hobby (e.g., reading, gaming)"
                      required
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-navy-400 mt-2">
                    This is the hobby you set during registration
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !securityHobby.trim()}
                  className="btn-gold w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify Answer'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-navy-500 hover:text-gold-600 transition-colors"
                  >
                    ← Back to Email
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Hobby verified for: <strong>{userHobby}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-elegant pl-12"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-elegant pl-12"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-gold w-full"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/auth"
              className="text-sm text-navy-500 hover:text-gold-600 transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
