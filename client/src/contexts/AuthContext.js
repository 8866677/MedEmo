import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('medemo_token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Load user data
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('medemo_token');
      delete axios.defaults.headers.common['x-auth-token'];
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      
      if (res.data.token) {
        localStorage.setItem('medemo_token', res.data.token);
        setToken(res.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
        toast.success('Registration successful! Welcome to MedEmo!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const res = await axios.post('/api/auth/login', credentials);
      
      if (res.data.token) {
        localStorage.setItem('medemo_token', res.data.token);
        setToken(res.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.firstName}!`);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('medemo_token');
    delete axios.defaults.headers.common['x-auth-token'];
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('Password reset instructions sent to your email');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      await axios.post('/api/auth/reset-password', { token, password });
      toast.success('Password reset successful! Please login with your new password.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/users/profile', profileData);
      setUser(res.data);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await axios.put('/api/users/change-password', passwordData);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Verify email
  const verifyEmail = async (verificationToken) => {
    try {
      const res = await axios.post('/api/auth/verify-email', { token: verificationToken });
      setUser(res.data.user);
      toast.success('Email verified successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Resend verification email
  const resendVerification = async () => {
    try {
      await axios.post('/api/auth/resend-verification');
      toast.success('Verification email sent successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send verification email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Enable/disable 2FA
  const toggleTwoFactor = async () => {
    try {
      const res = await axios.post('/api/auth/toggle-2fa');
      setUser(res.data.user);
      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to toggle 2FA';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Verify 2FA code
  const verifyTwoFactor = async (code) => {
    try {
      const res = await axios.post('/api/auth/verify-2fa', { code });
      if (res.data.token) {
        localStorage.setItem('medemo_token', res.data.token);
        setToken(res.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
        toast.success('2FA verification successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.error || '2FA verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    
    switch (permission) {
      case 'admin':
        return user.userType === 'admin';
      case 'doctor':
        return ['admin', 'doctor'].includes(user.userType);
      case 'hospital':
        return ['admin', 'hospital'].includes(user.userType);
      case 'ambulance':
        return ['admin', 'ambulance'].includes(user.userType);
      case 'blood-bank':
        return ['admin', 'blood-bank'].includes(user.userType);
      case 'patient':
        return ['admin', 'doctor', 'hospital'].includes(user.userType);
      default:
        return false;
    }
  };

  // Check if user can access specific feature
  const canAccess = (feature) => {
    if (!user) return false;
    
    switch (feature) {
      case 'emergency-alerts':
        return true; // All users can create emergency alerts
      case 'ambulance-dispatch':
        return ['admin', 'hospital'].includes(user.userType);
      case 'doctor-consultations':
        return ['admin', 'doctor', 'patient'].includes(user.userType);
      case 'blood-bank-access':
        return true; // All users can access blood bank info
      case 'hospital-management':
        return ['admin', 'hospital'].includes(user.userType);
      case 'user-management':
        return user.userType === 'admin';
      default:
        return false;
    }
  };

  const value = {
    user,
    loading,
    token,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    verifyEmail,
    resendVerification,
    toggleTwoFactor,
    verifyTwoFactor,
    hasPermission,
    canAccess,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
