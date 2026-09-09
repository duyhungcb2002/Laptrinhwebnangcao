import api from './axios';

export const reportsApi = {
  getDashboardReport: async (params = {}) => {
    const { data } = await api.get('/admin/reports/dashboard', { params });
    return data;
  }
};
