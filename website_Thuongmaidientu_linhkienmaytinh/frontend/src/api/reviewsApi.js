import api from './axios';

export const reviewsApi = {
  getProductReviews: async (productId, params = {}) => {
    // Handle both object params { page, pageSize } and number page for backwards compatibility
    const queryParams = typeof params === 'number' ? { page: params } : params;
    const { data } = await api.get(`/products/${productId}/reviews`, { params: queryParams });
    return data;
  },

  getEligibleOrderItems: async (productId) => {
    const { data } = await api.get('/reviews/eligible-order-items', { params: { productId } });
    return data;
  },

  createReview: async (payload) => {
    // If orderItemId was passed directly as string, normalize payload
    const body = typeof payload === 'string' ? { orderItemId: payload } : payload;
    const { data } = await api.post('/reviews', body);
    return data;
  },

  getAdminReviews: async (params = {}) => {
    const { data } = await api.get('/admin/reviews', { params });
    return data;
  },

  updateReviewVisibility: async (reviewId, isVisible) => {
    const { data } = await api.patch(`/admin/reviews/${reviewId}/visibility`, { isVisible });
    return data;
  }
};

