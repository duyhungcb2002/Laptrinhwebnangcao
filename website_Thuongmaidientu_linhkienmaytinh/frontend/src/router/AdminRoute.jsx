import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, hasPermission, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingSpinner text="Đang kiểm tra quyền truy cập Quản trị..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin && !hasPermission('admin.access')) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
