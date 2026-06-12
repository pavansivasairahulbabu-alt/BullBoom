import api from './api.js';

export const profileService = {
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  async uploadProfileImage(formData) {
    const response = await api.post('/user/upload-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/user/account');
    return response.data;
  }
};
