import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import BlogPage from './pages/BlogPage';
import ProfilePage from './pages/ProfilePage';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedRoute from './components/Common/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Standalone Pages (no layout) */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Pages with Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog/:slug" element={<BlogPage />} />
        <Route path="profile/:id" element={<ProfilePage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="create" element={<CreateBlog />} />
          <Route path="edit/:id" element={<EditBlog />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;