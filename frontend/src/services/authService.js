import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
   //Get current user profile
   getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  //Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  //Change password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Kiểm tra user có đăng nhập không (optional)
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // // Lấy thông tin user hiện tại (nếu có)
  // getCurrentUser: () => {
  //   const token = localStorage.getItem('token');
  //   if (!token) return null;
    
  //   try {
  //     // Decode JWT token để lấy thông tin user (đơn giản)
  //     const payload = JSON.parse(atob(token.split('.')[1]));
  //     return payload;
  //   } catch {
  //     return null;
  //   }
  // }
};