import api from './axios';

export const cartApi = {
  getCart: async () => {
    const { data } = await api.get('/cart');
    return data;
  },

  addItem: async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/items', { productId, quantity });
    return data;
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
    return data;
  },

  removeItem: async (itemId) => {
    await api.delete(`/cart/items/${itemId}`);
  }
};

export const ordersApi = {
  checkout: async (checkoutData) => {
    const { data } = await api.post('/checkout', checkoutData);
    return data;
  },

  getMyOrders: async (params = {}) => {
    const { data } = await api.get('/orders', { params });
    return data;
  },

  getOrderById: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  cancelOrder: async (id) => {
    const { data } = await api.post(`/orders/${id}/cancel`);
    return data;
  },

  // Admin APIs
  getAdminOrders: async (params = {}) => {
    const { data } = await api.get('/admin/orders', { params });
    return data;
  },

  getAdminOrderById: async (id) => {
    const { data } = await api.get(`/admin/orders/${id}`);
    return data;
  },

  updateOrderStatus: async (id, status) => {
    const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
    return data;
  }
};
