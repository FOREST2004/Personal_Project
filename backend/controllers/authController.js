const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { username, password, name_display, email, numberphone, location } = req.body;
    
    // Kiểm tra email đã tồn tại chưa
    const checkResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Tạo user mới
    const result = await query(
      `INSERT INTO users (username, password, name_display, email, numberphone, location, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'user', 'active', NOW(), NOW())
       RETURNING id_user, username, email, name_display`,
      [username, hashedPassword, name_display, email, numberphone, location]
    );
    
    const newUser = result.rows[0];
    
    // Tạo token
    const token = jwt.sign({ id: newUser.id_user }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser.id_user,
          username: newUser.username,
          email: newUser.email,
          name_display: newUser.name_display
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Kiểm tra user tồn tại
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email hoặc mật khẩu không đúng'
      });
    }
    
    const user = result.rows[0];
    
    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email hoặc mật khẩu không đúng'
      });
    }
    
    // Tạo token
    const token = jwt.sign({ id: user.id_user }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id_user,
          username: user.username,
          email: user.email,
          name_display: user.name_display
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server',
      error: error.message
    });
  }
};