// models/User.js
const BaseModel = require('./BaseModel');
const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

class User extends BaseModel {
  constructor() {
    super('users');
    this.primaryKey = 'id_user';
  }

  // Tìm user theo email
  async findByEmail(email) {
    try {
      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Tìm user theo username
  async findByUsername(username) {
    try {
      const result = await query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  // Tạo user mới với password đã hash
  async createUser(userData) {
    try {
      const { username, password, name_display, email, numberphone, location, role = 'user' } = userData;
      
      // Kiểm tra email đã tồn tại
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new Error('Email đã được sử dụng');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await this.create({
        username,
        password: hashedPassword,
        name_display,
        email,
        numberphone,
        location,
        role,
        status: 'active',
        wallet: 0,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Loại bỏ password khỏi response
      delete newUser.password;
      return newUser;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Xác thực password
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  // Cập nhật thông tin user (không bao gồm password)
  async updateProfile(id, profileData) {
    try {
      // Loại bỏ password nếu có trong data
      const { password, ...updateData } = profileData;
      updateData.updated_at = new Date();
      
      const updatedUser = await this.update(id, updateData);
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  // Thay đổi password
  async changePassword(id, oldPassword, newPassword) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Xác thực password cũ
      const isValidPassword = await this.verifyPassword(oldPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Mật khẩu cũ không đúng');
      }

      // Hash password mới
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      await this.update(id, { 
        password: hashedNewPassword,
        updated_at: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  // Lấy users theo role
  async findByRole(role, options = {}) {
    try {
      const result = await query(
        `SELECT id_user, username, name_display, email, numberphone, location, role, status, wallet, created_at
         FROM users WHERE role = $1 ORDER BY created_at DESC`,
        [role]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding users by role: ${error.message}`);
    }
  }

  // Lấy thống kê users
  async getUserStats() {
    try {
      const result = await query(`
        SELECT 
          role,
          status,
          COUNT(*) as count
        FROM users 
        GROUP BY role, status
        ORDER BY role, status
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  }

  // Cập nhật wallet
  async updateWallet(id, amount, operation = 'add') {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      let newWalletAmount;
      if (operation === 'add') {
        newWalletAmount = parseFloat(user.wallet) + parseFloat(amount);
      } else if (operation === 'subtract') {
        newWalletAmount = parseFloat(user.wallet) - parseFloat(amount);
        if (newWalletAmount < 0) {
          throw new Error('Số dư không đủ');
        }
      } else {
        newWalletAmount = parseFloat(amount);
      }

      const updatedUser = await this.update(id, { 
        wallet: newWalletAmount,
        updated_at: new Date()
      });
      
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      throw new Error(`Error updating wallet: ${error.message}`);
    }
  }
}

module.exports = new User();