import api from './axios';

export const inventoryApi = {
  getInventory: async (params = {}) => {
    const { data } = await api.get('/admin/inventory', { params });
    return data;
  },

  importStock: async (productId, quantity, note) => {
    const { data } = await api.post(`/admin/inventory/${productId}/import`, { quantity, note });
    return data;
  },

  exportStock: async (productId, quantity, note) => {
    const { data } = await api.post(`/admin/inventory/${productId}/export`, { quantity, note });
    return data;
  },

  adjustStock: async (productId, newQuantity, note) => {
    const { data } = await api.post(`/admin/inventory/${productId}/adjust`, { newQuantity, note });
    return data;
  },

  getHistory: async (params = {}) => {
    const { data } = await api.get('/admin/inventory/history', { params });
    return data;
  },

  getLowStock: async (threshold = 10) => {
    const { data } = await api.get('/admin/inventory/low-stock', { params: { threshold } });
    return data;
  }
};
