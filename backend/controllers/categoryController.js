// controllers/categoryController.js
const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => {
  try {
    const includeProductCount = req.query.include_product_count === 'true';
    
    let categories;
    if (includeProductCount) {
      categories = await Category.findAllWithProductCount();
    } else {
      categories = await Category.findAll();
    }
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách danh mục',
      error: error.message
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const includeDetails = req.query.include_details === 'true';
    
    let category;
    if (includeDetails) {
      category = await Category.findByIdWithDetails(req.params.id);
    } else {
      category = await Category.findById(req.params.id);
    }
    
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy danh mục'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thông tin danh mục',
      error: error.message
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const newCategory = await Category.createCategory(req.body);
    
    res.status(201).json({
      status: 'success',
      data: newCategory
    });
  } catch (error) {
    console.error('Error in createCategory:', error);
    
    if (error.message.includes('đã tồn tại')) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi tạo danh mục',
      error: error.message
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.updateCategory(req.params.id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error in updateCategory:', error);
    
    if (error.message.includes('không tìm thấy') || error.message.includes('đã tồn tại')) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật danh mục',
      error: error.message
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.deleteCategory(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    
    if (error.message.includes('không tìm thấy') || error.message.includes('không thể xóa')) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xóa danh mục',
      error: error.message
    });
  }
};

// Thêm endpoints mới
exports.getPopularCategories = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const categories = await Category.getPopularCategories(limit);
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error in getPopularCategories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh mục phổ biến',
      error: error.message
    });
  }
};

exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Category.getCategoryStats();
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error in getCategoryStats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thống kê danh mục',
      error: error.message
    });
  }
};