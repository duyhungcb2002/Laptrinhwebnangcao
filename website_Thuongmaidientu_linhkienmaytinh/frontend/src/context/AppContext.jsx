import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_USERS, INITIAL_REVIEWS } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('techhub_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('techhub_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('techhub_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('techhub_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('techhub_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('techhub_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // UI state
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Sync persistence
  useEffect(() => { localStorage.setItem('techhub_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('techhub_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('techhub_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('techhub_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('techhub_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('techhub_reviews', JSON.stringify(reviews)); }, [reviews]);

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

  // Cart Actions
  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`Sản phẩm ${product.name} đã hết hàng!`, 'error');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const currentQty = existing ? existing.qty : 0;
      const newQty = currentQty + quantity;

      if (newQty > product.stock) {
        showToast(`Chỉ còn ${product.stock} sản phẩm trong kho!`, 'error');
        return prev;
      }

      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: newQty } : item);
      }
      return [...prev, { ...product, qty: quantity }];
    });

    showToast(`Đã thêm ${product.name} vào giỏ hàng!`, 'success');
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQty = item.qty + delta;
        if (product && newQty > product.stock) {
          showToast(`Số lượng vượt quá tồn kho (${product.stock} sản phẩm)`, 'error');
          return item;
        }
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  // Product Actions
  const saveProduct = (productData) => {
    if (productData.id) {
      setProducts(prev => prev.map(p => p.id === productData.id ? { ...p, ...productData } : p));
      showToast('Cập nhật thông tin sản phẩm thành công!', 'success');
    } else {
      const newProduct = {
        ...productData,
        id: Date.now().toString(),
        rating: 5.0,
        reviewCount: 0,
        img: productData.img || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80'
      };
      setProducts(prev => [newProduct, ...prev]);
      showToast('Thêm mới sản phẩm thành công!', 'success');
    }
  };

  const deleteProduct = (id) => {
    confirmAction('Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?', () => {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Đã xóa sản phẩm thành công', 'success');
    });
  };

  // Category Actions
  const saveCategory = (categoryData) => {
    if (categories.some(c => c.id === categoryData.id)) {
      setCategories(prev => prev.map(c => c.id === categoryData.id ? categoryData : c));
      showToast('Cập nhật danh mục thành công!', 'success');
    } else {
      setCategories(prev => [...prev, { ...categoryData, count: 0 }]);
      showToast('Thêm danh mục mới thành công!', 'success');
    }
  };

  const deleteCategory = (id) => {
    confirmAction('Bạn có chắc chắn muốn xóa danh mục này?', () => {
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast('Đã xóa danh mục!', 'info');
    });
  };

  // Order Actions
  const createOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Processing',
      ...orderData
    };

    setProducts(prevProducts => prevProducts.map(p => {
      const orderedItem = orderData.items.find(item => item.id === p.id);
      if (orderedItem) {
        return { ...p, stock: Math.max(0, p.stock - orderedItem.qty) };
      }
      return p;
    }));

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    showToast('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.', 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Đã cập nhật trạng thái đơn hàng ${orderId}`, 'success');
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

  // Reviews
  const addReview = (productId, comment, rating, userName = 'Khách hàng') => {
    const newRev = {
      id: `REV-${Date.now()}`,
      productId,
      userName,
      rating: Number(rating),
      comment,
      date: new Date().toISOString().substring(0, 10)
    };
    setReviews(prev => [newRev, ...prev]);
    showToast('Cảm ơn bạn đã gửi đánh giá sản phẩm!', 'success');
  };

  const deleteReview = (id) => {
    confirmAction('Bạn có chắc chắn muốn xóa đánh giá này?', () => {
      setReviews(prev => prev.filter(r => r.id !== id));
      showToast('Đã xóa đánh giá', 'info');
    });
  };

  return (
    <AppContext.Provider value={{
      products, categories, cart, orders, users, reviews, toast, confirmModal,
      addToCart, removeFromCart, updateCartQty, clearCart,
      saveProduct, deleteProduct, saveCategory, deleteCategory,
      createOrder, updateOrderStatus, toggleUserStatus,
      addReview, deleteReview,
      showToast, confirmAction, setToast, setConfirmModal
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
