// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

exports.protect = async (req, res, next) => {
  try {
    // 1) Lấy token từ header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.'
      });
    }
    
    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3) Kiểm tra user có tồn tại không
    const result = await query('SELECT * FROM users WHERE id_user = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Người dùng với token này không còn tồn tại'
      });
    }
    
    // 4) Gán user vào request
    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Không được phép truy cập'
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }
    
    next();
  };
};