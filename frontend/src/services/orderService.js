import api from './api.js';

export const orderService = {
  async getOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async deleteOrder(orderId) {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  }
};