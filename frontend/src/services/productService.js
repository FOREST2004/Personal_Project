import api from './api';

export const productService = {
  getAllProducts: async (params = {}) => {
    try {
      console.log('Calling API with params:', params);
      const response = await api.get('/products', { params });
      console.log('API response:', response);
      
      console.log('Products data:', response.data.data); 
      return {
        data: response.data.data || [],
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1,
        results: response.data.results || 0
      };
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      
      // Trả về cấu trúc default để tránh lỗi null
      if (error.response) {
        throw {
          message: error.response.data?.message || 'Lỗi khi lấy danh sách sản phẩm',
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
  
  getProductById: async (id) => {
    try {
      console.log('Getting product by ID:', id);
      const response = await api.get(`/products/${id}`);
      console.log('Product detail response:', response);
      
      return {
        data: response.data.data || null
      };
    } catch (error) {
      console.error('Error in getProductById:', error);
      
      if (error.response) {
        throw {
          message: error.response.data?.message || 'Không tìm thấy sản phẩm',
          status: error.response.status
        };
      } else {
        throw {
          message: 'Không thể kết nối đến server',
          status: 0
        };
      }
    }
  },
  
  getProductsByCategory: async (categoryId) => {
    try {
      console.log('Getting products by category:', categoryId);
      const response = await api.get(`/products/category/${categoryId}`);
      console.log('Products by category response:', response);
      
      return {
        data: response.data.data || [],
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1,
        results: response.data.results || 0
      };
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      
      if (error.response) {
        throw {
          message: error.response.data?.message || 'Lỗi khi lấy sản phẩm theo danh mục',
          status: error.response.status
        };
      } else {
        throw {
          message: 'Không thể kết nối đến server',
          status: 0
        };
      }
    }
  },
  
  // Thêm function để lấy sản phẩm của seller
  getSellerProducts: async (sellerId, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...params
      }).toString();
      
      const response = await api.get(`/products/seller/${sellerId}?${queryParams}`);
      
      // API trả về: { status: "success", data: { products: [...], pagination: {...} } }
      const responseData = response.data?.data || {};
      
      return {
        data: responseData.products || [], // Lấy products từ response.data.data.products
        totalPages: responseData.pagination?.totalPages || 1,
        currentPage: responseData.pagination?.currentPage || 1,
        results: responseData.products?.length || 0
      };
    } catch (error) {
      console.error('Error in getSellerProducts:', error);
      
      if (error.response) {
        throw {
          message: error.response.data?.message || 'Lỗi khi lấy sản phẩm của người bán',
          status: error.response.status
        };
      } else {
        throw {
          message: 'Không thể kết nối đến server',
          status: 0
        };
      }
    }
  },
  
  // Thêm function để lấy sản phẩm đã mua của user
  getBuyerProducts: async (buyerId, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...params
      }).toString();
      
      const response = await api.get(`/products/buyer/${buyerId}?${queryParams}`);
      
      const responseData = response.data?.data || {};
      
      return {
        data: responseData.products || [],
        totalPages: responseData.pagination?.totalPages || 1,
        currentPage: responseData.pagination?.currentPage || 1,
        results: responseData.products?.length || 0
      };
    } catch (error) {
      console.error('Error in getBuyerProducts:', error);
      
      if (error.response) {
        throw {
          message: error.response.data?.message || 'Lỗi khi lấy sản phẩm đã mua',
          status: error.response.status
        };
      } else {
        throw {
          message: 'Không thể kết nối đến server',
          status: 0
        };
      }
    }
  },
  
  // Thêm function để cập nhật buyer cho sản phẩm
  updateProductBuyer: async (productId, buyerId) => {
    try {
      const response = await api.put(`/products/${productId}/buyer`, { buyerId });
      return response.data;
    } catch (error) {
      console.error('Error in updateProductBuyer:', error);
      
      if (error.response) {
        throw {
          message: error.response.data?.message || 'Lỗi khi cập nhật người mua',
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