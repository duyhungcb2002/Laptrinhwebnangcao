import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_USERS } from '../data/mockData';
import { catalogApi } from '../api/catalogApi';
import { cartApi, ordersApi } from '../api/orderCartApi';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [cart, setCart] = useState({
    cartId: null,
    items: [],
    totalQuantity: 0,
    subtotal: 0
  });

  const [isLoadingCart, setIsLoadingCart] = useState(false);

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('techhub_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // UI state
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Confirm Modal Helper
  const confirmAction = (message, onConfirm) => {
    setConfirmModal({
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  // Fetch initial catalog from backend
  const refreshCategories = useCallback(async () => {
    try {
      const data = await catalogApi.getPublicCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Lỗi tải danh mục từ API:', err);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const data = await catalogApi.getPublicProducts({ page: 1, pageSize: 100 });
      setProducts(data.items || []);
    } catch (err) {
      console.error('Lỗi tải sản phẩm từ API:', err);
    }
  }, []);

  // Sync Cart with Backend API when authenticated
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ cartId: null, items: [], totalQuantity: 0, subtotal: 0 });
      return;
    }
    setIsLoadingCart(true);
    try {
      const data = await cartApi.getCart();
      setCart(data || { cartId: null, items: [], totalQuantity: 0, subtotal: 0 });
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err);
    } finally {
      setIsLoadingCart(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCategories();
    refreshProducts();
  }, [refreshCategories, refreshProducts]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => { localStorage.setItem('techhub_users', JSON.stringify(users)); }, [users]);

  // Cart API Actions
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', 'warning');
      return false;
    }
    try {
      const updatedCart = await cartApi.addItem(product.id, quantity);
      setCart(updatedCart);
      showToast(`Đã thêm ${product.name} vào giỏ hàng!`, 'success');
      return true;
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.detail || err.response?.data?.title || 'Không thể thêm vào giỏ hàng.';
      if (status === 409) {
        showToast(message, 'error');
      } else {
        showToast(message, 'error');
      }
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) return;
    try {
      await cartApi.removeItem(itemId);
      setCart(prev => {
        const remainingItems = prev.items.filter(item => item.id !== itemId);
        const subtotal = remainingItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const totalQuantity = remainingItems.reduce((sum, item) => sum + item.quantity, 0);
        return { ...prev, items: remainingItems, subtotal, totalQuantity };
      });
      showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
    } catch (err) {
      const message = err.response?.data?.detail || 'Lỗi khi xóa sản phẩm';
      showToast(message, 'error');
    }
  };

  const updateCartQty = async (itemId, newQuantity) => {
    if (!isAuthenticated) return;
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    try {
      const updatedCart = await cartApi.updateItem(itemId, newQuantity);
      setCart(updatedCart);
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.title || 'Không thể cập nhật số lượng';
      showToast(message, 'error');
      refreshCart();
    }
  };

  const clearCartState = () => {
    setCart({ cartId: null, items: [], totalQuantity: 0, subtotal: 0 });
  };

  // User Actions
  const toggleUserStatus = (userId) => {
    setUsers(prevUsers => {
      return prevUsers.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'Active' ? 'Blocked' : 'Active';
          return { ...u, status: newStatus };
        }
        return u;
      });
    });
    showToast('Cập nhật trạng thái người dùng thành công!', 'success');
  };

  return (
    <AppContext.Provider value={{
      products, categories, cart, isLoadingCart, users, toast, confirmModal,
      refreshCategories, refreshProducts, refreshCart,
      addToCart, removeFromCart, updateCartQty, clearCartState,
      toggleUserStatus,
      showToast, confirmAction, setToast, setConfirmModal
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
