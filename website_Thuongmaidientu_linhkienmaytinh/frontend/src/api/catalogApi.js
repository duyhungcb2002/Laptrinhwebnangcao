import api from './axios';

export const catalogApi = {
  // Public Categories
  getPublicCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Public Products
  getPublicProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getPublicProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Admin Categories
  getAdminCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  createAdminCategory: async (data) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  updateAdminCategory: async (id, data) => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteAdminCategory: async (id) => {
    await api.delete(`/admin/categories/${id}`);
  },

  // Admin Products
  getAdminProducts: async (params = {}) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  getAdminProductById: async (id) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  createAdminProduct: async (data) => {
    const response = await api.post('/admin/products', data);
    return response.data;
  },

  updateAdminProduct: async (id, data) => {
    const response = await api.put(`/admin/products/${id}`, data);
    return response.data;
  },

  deleteAdminProduct: async (id) => {
    await api.delete(`/admin/products/${id}`);
  },

  restoreAdminProduct: async (id) => {
    const response = await api.patch(`/admin/products/${id}/restore`);
    return response.data;
  },

  uploadAdminProductImage: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAdminProductImage: async (id, imageId) => {
    await api.delete(`/admin/products/${id}/images/${imageId}`);
  },
};
