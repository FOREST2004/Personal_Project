const { query } = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sort, minPrice, maxPrice } = req.query;
    const offset = (page - 1) * limit;
    
    // Xây dựng câu truy vấn SQL cơ bản
    let sqlQuery = `
      SELECT p.*, c.name as category_name, u.name_display as user_name
      FROM products p
      LEFT JOIN categories c ON p.id_category = c.id_category
      LEFT JOIN users u ON p.id_user = u.id_user
      WHERE 1=1
    `;
    
    // Mảng chứa các tham số cho câu truy vấn
    const queryParams = [];
    
    // Thêm điều kiện tìm kiếm
    if (category) {
      queryParams.push(category);
      sqlQuery += ` AND p.id_category = $${queryParams.length}`;
    }
    
    if (search) {
      queryParams.push(`%${search}%`);
      sqlQuery += ` AND p.name ILIKE $${queryParams.length}`;
    }
    
    if (minPrice) {
      queryParams.push(minPrice);
      sqlQuery += ` AND p.price >= $${queryParams.length}`;
    }
    
    if (maxPrice) {
      queryParams.push(maxPrice);
      sqlQuery += ` AND p.price <= $${queryParams.length}`;
    }
    
    // Đếm tổng số sản phẩm (cho phân trang)
    const countQuery = `SELECT COUNT(*) FROM (${sqlQuery}) AS count_table`;
    const countResult = await query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Thêm phần ORDER BY
    switch(sort) {
      case 'price_asc':
        sqlQuery += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        sqlQuery += ` ORDER BY p.price DESC`;
        break;
      case 'newest':
        sqlQuery += ` ORDER BY p.date DESC`;
        break;
      default:
        sqlQuery += ` ORDER BY p.date DESC`;
    }
    
    // Thêm phần LIMIT và OFFSET cho phân trang
    queryParams.push(parseInt(limit));
    sqlQuery += ` LIMIT $${queryParams.length}`;
    
    queryParams.push(parseInt(offset));
    sqlQuery += ` OFFSET $${queryParams.length}`;
    
    // Thực hiện câu truy vấn
    const result = await query(sqlQuery, queryParams);
    
    // Định dạng lại dữ liệu để phù hợp với cấu trúc trả về
    const products = result.rows.map(row => ({
      id_product: row.id_product,
      name: row.name,
      price: row.price,
      description: row.description,
      image: row.image,
      status: row.status,
      date: row.date,
      id_user: row.id_user,
      id_category: row.id_category,
      category: {
        id_category: row.id_category,
        name: row.category_name
      },
      user: {
        id_user: row.id_user,
        name_display: row.user_name
      }
    }));
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      data: products
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
    const sqlQuery = `
      SELECT p.*, c.name as category_name, u.name_display as user_name
      FROM products p
      LEFT JOIN categories c ON p.id_category = c.id_category
      LEFT JOIN users u ON p.id_user = u.id_user
      WHERE p.id_product = $1
    `;
    
    const result = await query(sqlQuery, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    const row = result.rows[0];
    const product = {
      id_product: row.id_product,
      name: row.name,
      price: row.price,
      description: row.description,
      image: row.image,
      status: row.status,
      date: row.date,
      id_user: row.id_user,
      id_category: row.id_category,
      category: {
        id_category: row.id_category,
        name: row.category_name
      },
      user: {
        id_user: row.id_user,
        name_display: row.user_name
      }
    };
    
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
    const { categoryId } = req.params;
    const { page = 1, limit = 10, sort } = req.query;
    const offset = (page - 1) * limit;
    
    // Xây dựng câu truy vấn SQL cơ bản
    let sqlQuery = `
      SELECT p.*, c.name as category_name, u.name_display as user_name
      FROM products p
      LEFT JOIN categories c ON p.id_category = c.id_category
      LEFT JOIN users u ON p.id_user = u.id_user
      WHERE p.id_category = $1
    `;
    
    // Đếm tổng số sản phẩm (cho phân trang)
    const countResult = await query('SELECT COUNT(*) FROM products WHERE id_category = $1', [categoryId]);
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Thêm phần ORDER BY
    switch(sort) {
      case 'price_asc':
        sqlQuery += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        sqlQuery += ` ORDER BY p.price DESC`;
        break;
      case 'newest':
        sqlQuery += ` ORDER BY p.date DESC`;
        break;
      default:
        sqlQuery += ` ORDER BY p.date DESC`;
    }
    
    // Thêm phần LIMIT và OFFSET cho phân trang
    sqlQuery += ` LIMIT $2 OFFSET $3`;
    
    // Thực hiện câu truy vấn
    const result = await query(sqlQuery, [categoryId, parseInt(limit), parseInt(offset)]);
    
    // Định dạng lại dữ liệu để phù hợp với cấu trúc trả về
    const products = result.rows.map(row => ({
      id_product: row.id_product,
      name: row.name,
      price: row.price,
      description: row.description,
      image: row.image,
      status: row.status,
      date: row.date,
      id_user: row.id_user,
      id_category: row.id_category,
      category: {
        id_category: row.id_category,
        name: row.category_name
      },
      user: {
        id_user: row.id_user,
        name_display: row.user_name
      }
    }));
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      data: products
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
    const { name, price, description, image, id_category } = req.body;
    
    // Thêm id_user từ token JWT (giả sử đã có middleware xác thực)
    const id_user = req.user ? req.user.id_user : 1; // Default user for testing
    
    const result = await query(
      `INSERT INTO products (name, price, description, image, id_category, id_user, status, date)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW())
       RETURNING *`,
      [name, price, description, image, id_category, id_user]
    );
    
    res.status(201).json({
      status: 'success',
      data: result.rows[0]
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

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, id_category, status } = req.body;
    const id_user = req.user ? req.user.id_user : 1;
    
    // Tìm sản phẩm cần cập nhật
    const checkResult = await query('SELECT * FROM products WHERE id_product = $1', [req.params.id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    const product = checkResult.rows[0];
    
    // Kiểm tra quyền (chỉ người tạo hoặc admin mới được cập nhật)
    if (req.user && product.id_user !== id_user && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền cập nhật sản phẩm này'
      });
    }
    
    // Cập nhật sản phẩm
    const result = await query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           price = COALESCE($2, price),
           description = COALESCE($3, description),
           image = COALESCE($4, image),
           id_category = COALESCE($5, id_category),
           status = COALESCE($6, status)
       WHERE id_product = $7
       RETURNING *`,
      [name, price, description, image, id_category, status, req.params.id]
    );
    
    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id_user = req.user ? req.user.id_user : 1;
    
    // Tìm sản phẩm cần xóa
    const checkResult = await query('SELECT * FROM products WHERE id_product = $1', [req.params.id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    const product = checkResult.rows[0];
    
    // Kiểm tra quyền (chỉ người tạo hoặc admin mới được xóa)
    if (req.user && product.id_user !== id_user && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền xóa sản phẩm này'
      });
    }
    
    // Xóa sản phẩm
    await query('DELETE FROM products WHERE id_product = $1', [req.params.id]);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    });
  }
};