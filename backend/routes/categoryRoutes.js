const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// 🔓 PUBLIC ROUTES - Không cần đăng nhập
// Lấy tất cả danh mục
router.get('/', categoryController.getAllCategories);

// Lấy danh mục theo ID
router.get('/:id', categoryController.getCategoryById);

// 🔒 ADMIN ONLY ROUTES - Cần đăng nhập và quyền admin
// Thêm danh mục mới (yêu cầu quyền admin)
router.post('/', protect, restrictTo('admin'), categoryController.createCategory);

// Cập nhật danh mục (yêu cầu quyền admin)
router.put('/:id', protect, restrictTo('admin'), categoryController.updateCategory);

// Xóa danh mục (yêu cầu quyền admin)
router.delete('/:id', protect, restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;