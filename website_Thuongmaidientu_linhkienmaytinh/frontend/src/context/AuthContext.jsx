import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { setAccessToken, getAccessToken, clearAccessToken } from '../api/authTokenStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const applyAuthData = (authResponse) => {
    if (authResponse && authResponse.accessToken && authResponse.user) {
      setAccessToken(authResponse.accessToken);
      setUser({
        id: authResponse.user.id,
        fullName: authResponse.user.fullName,
        email: authResponse.user.email,
        name: authResponse.user.fullName,
        role: authResponse.user.roles.includes('Admin') ? 'Admin' : 'Customer'
      });
      setRoles(authResponse.user.roles || []);
      setPermissions(authResponse.user.permissions || []);
    }
  };

  const clearAuthData = () => {
    clearAccessToken();
    setUser(null);
    setRoles([]);
    setPermissions([]);
  };

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      applyAuthData(data);
      return true;
    } catch {
      clearAuthData();
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      applyAuthData(data);
      return { success: true, user: data.user };
    } catch (err) {
      clearAuthData();
      const message = err.response?.data?.detail || err.response?.data?.title || 'Đăng nhập thất bại';
      return { success: false, message };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { fullName, email, password });
      applyAuthData(data);
      return { success: true, user: data.user };
    } catch (err) {
      clearAuthData();
      const message = err.response?.data?.detail || err.response?.data?.title || 'Đăng ký thất bại';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network failure on logout
    } finally {
      clearAuthData();
    }
  };

  const hasPermission = (permissionCode) => {
    if (roles.includes('Admin') || permissions.includes('admin.access')) return true;
    return permissions.includes(permissionCode);
  };

  const isAuthenticated = !!user;
  const isAdmin = roles.includes('Admin') || permissions.includes('admin.access');
  const accessToken = getAccessToken();

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      roles,
      permissions,
      isAuthenticated,
      isAdmin,
      isInitializing,
      login,
      register,
      logout,
      refreshSession,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
