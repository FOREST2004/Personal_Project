// controllers/productController.js
const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const result = await Product.findAllWithDetails(req.query, { sort: req.query.sort });
    
    res.status(200).json({
      status: 'success',
      results: result.products.length,
      totalPages: result.pagination.totalPages,
      currentPage: result.pagination.currentPage,
      totalCount: result.pagination.totalCount,
      data: result.products
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: error.message
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByIdWithDetails(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thông tin sản phẩm',
      error: error.message
    });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const result = await Product.findByCategory(
      req.params.categoryId, 
      { 
        filters: req.query, 
        sort: req.query.sort 
      }
    );
    
    res.status(200).json({
      status: 'success',
      results: result.products.length,
      totalPages: result.pagination.totalPages,
      currentPage: result.pagination.currentPage,
      data: result.products
    });
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy sản phẩm theo danh mục',
      error: error.message
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const sellerId = req.user ? req.user.id_user : 1;
    
    // Kiểm tra quyền tạo sản phẩm (chỉ commercial_user và admin)
    if (req.user && req.user.role === 'user') {
      return res.status(403).json({
        status: 'fail',
        message: 'Chỉ người bán hàng mới có thể tạo sản phẩm'
      });
    }
    
    const newProduct = await Product.createProduct(req.body, sellerId);
    
    res.status(201).json({
      status: 'success',
      data: newProduct
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi tạo sản phẩm',
      error: error.message
    });
  }
};

// Thêm endpoint để lấy sản phẩm của seller
exports.getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.params.sellerId || (req.user ? req.user.id_user : null);

    
    // Không set status mặc định cho seller products
    const filters = { ...req.query };
    delete filters.status; // Xóa status filter để lấy tất cả sản phẩm
    
    const result = await Product.findBySeller(sellerId, {
      filters: filters,
      sort: req.query.sort
    });
    

    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
  
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy sản phẩm của người bán',
      error: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const sellerId = req.user ? req.user.id_user : null;
    const userRole = req.user ? req.user.role : null;
    
    const updatedProduct = await Product.updateProduct(
      req.params.id, 
      req.body, 
      sellerId, 
      userRole
    );
    
    res.status(200).json({
      status: 'success',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    
    if (error.message.includes('không có quyền') || error.message.includes('không tìm thấy')) {
      return res.status(403).json({
        status: 'fail',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user ? req.user.id_user : null;
    const userRole = req.user ? req.user.role : null;
    
    await Product.deleteProduct(req.params.id, sellerId, userRole);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    
    if (error.message.includes('không có quyền') || error.message.includes('không tìm thấy')) {
      return res.status(403).json({
        status: 'fail',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    });
  }
};

// Thêm endpoint mới cho thống kê
exports.getProductStats = async (req, res) => {
  try {
    const stats = await Product.getProductStats();
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error in getProductStats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thống kê sản phẩm',
      error: error.message
    });
  }
};

// Thêm endpoint để lấy sản phẩm đã mua của user
exports.getBuyerProducts = async (req, res) => {
  try {
    const buyerId = req.params.buyerId || (req.user ? req.user.id_user : null);
    
    const result = await Product.findByBuyer(buyerId, {
      filters: req.query,
      sort: req.query.sort
    });
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy sản phẩm đã mua',
      error: error.message
    });
  }
};