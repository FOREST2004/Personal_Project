// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const newUser = await User.createUser(req.body);
    
    // Tạo token
    const token = jwt.sign({ id: newUser.id_user }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    
    if (error.message.includes('đã được sử dụng')) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
    
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
    
    // Tìm user theo email
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email hoặc mật khẩu không đúng'
      });
    }
    
    // Kiểm tra password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    
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

    console.log("Token of user logging:", token);
    
    // Loại bỏ password khỏi response
    delete user.password;
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Thêm các endpoints mới
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id_user);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Người dùng không tìm thấy'
      });
    }
    
    // Loại bỏ password
    delete user.password;
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thông tin người dùng',
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.updateProfile(req.user.id_user, req.body);
    
    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật thông tin',
      error: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    await User.changePassword(req.user.id_user, oldPassword, newPassword);
    
    res.status(200).json({
      status: 'success',
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    
    if (error.message.includes('không đúng')) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi đổi mật khẩu',
      error: error.message
    });
  }
};

// Thêm endpoint để lấy thống kê commercial user
exports.getCommercialStats = async (req, res) => {
  try {
    const userId = req.user.id_user;
    
    if (req.user.role !== 'commercial_user') {
      return res.status(403).json({
        status: 'fail',
        message: 'Chỉ commercial user mới có thể xem thống kê'
      });
    }
    
    const stats = await User.getCommercialUserStats(userId);
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error in getCommercialStats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};