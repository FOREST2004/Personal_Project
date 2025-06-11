const { query } = require('../config/db');

exports.getAllCategories = async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories');
    const categories = result.rows;
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách danh mục',
      error: error.message
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories WHERE id_category = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy danh mục'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thông tin danh mục',
      error: error.message
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Kiểm tra xem danh mục đã tồn tại chưa
    const checkResult = await query('SELECT * FROM categories WHERE name = $1', [name]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Danh mục này đã tồn tại'
      });
    }
    
    const result = await query(
      'INSERT INTO categories (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
      [name]
    );
    
    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi tạo danh mục',
      error: error.message
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Tìm danh mục
    const checkResult = await query('SELECT * FROM categories WHERE id_category = $1', [req.params.id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy danh mục'
      });
    }
    
    // Cập nhật danh mục
    const result = await query(
      'UPDATE categories SET name = $1, updated_at = NOW() WHERE id_category = $2 RETURNING *',
      [name, req.params.id]
    );
    
    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật danh mục',
      error: error.message
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    // Tìm danh mục
    const checkResult = await query('SELECT * FROM categories WHERE id_category = $1', [req.params.id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy danh mục'
      });
    }
    
    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    const productsCount = await query('SELECT COUNT(*) FROM products WHERE id_category = $1', [req.params.id]);
    
    if (parseInt(productsCount.rows[0].count) > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Không thể xóa danh mục này vì có sản phẩm liên quan. Hãy xóa sản phẩm trước.'
      });
    }
    
    // Xóa danh mục
    await query('DELETE FROM categories WHERE id_category = $1', [req.params.id]);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xóa danh mục',
      error: error.message
    });
  }
};