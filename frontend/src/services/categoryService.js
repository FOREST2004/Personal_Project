import api from './api';

export const categoryService = {
  getAllCategories: async () => {
    try {
      console.log('Fetching all categories...');
      const response = await api.get('/categories');
      console.log('Categories response:', response);
      
      console.log('Categories data:', response.data.data); 
      return {
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      
      if (error.response) {
        throw {
          message: error.response.data?.message || 'Lỗi khi lấy danh sách danh mục',
          status: error.response.status
        };
      } else if (error.request) {
        throw {
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
          status: 0
        };
      } else {
        throw {
          message: error.message || 'Đã xảy ra lỗi không xác định',
          status: 0
        };
      }
    }
  },
  
  getCategoryById: async (id) => {
    try {
      console.log('Getting category by ID:', id);
      const response = await api.get(`/categories/${id}`);
      console.log('Category detail response:', response);
      
      return {
        data: response.data.data || null
      };
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      
      if (error.response) {
        throw {
          message: error.response.data?.message || 'Không tìm thấy danh mục',
          status: error.response.status
        };
      } else {
        throw {
          message: 'Không thể kết nối đến server',
          status: 0
        };
      }
    }
  }
};