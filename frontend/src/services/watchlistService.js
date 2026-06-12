import api from './api.js';

export const watchlistService = {
  async getWatchlist() {
    const response = await api.get('/watchlist');
    return response.data;
  },

  async addToWatchlist(symbol, exchange) {
    const response = await api.post('/watchlist/add', { symbol, exchange });
    return response.data;
  },

  async deleteFromWatchlist(id) {
    const response = await api.delete(`/watchlist/${id}`);
    return response.data;
  }
};
