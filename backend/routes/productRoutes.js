const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// 🔓 PUBLIC ROUTES - Không cần đăng nhập
// Lấy tất cả sản phẩm với phân trang và lọc
router.get('/', productController.getAllProducts);

// Lấy sản phẩm theo ID
router.get('/:id', productController.getProductById);

// Lấy sản phẩm theo danh mục
router.get('/category/:categoryId', productController.getProductsByCategory);

// 🔒 PROTECTED ROUTES - Cần đăng nhập
// Thêm sản phẩm mới (yêu cầu đăng nhập)
router.post('/', protect, productController.createProduct);

// Cập nhật sản phẩm (yêu cầu đăng nhập và quyền)
router.put('/:id', protect, productController.updateProduct);

// Xóa sản phẩm (yêu cầu đăng nhập và quyền)
router.delete('/:id', protect, productController.deleteProduct);

// Thêm route cho seller products
router.get('/seller/:sellerId?', protect, restrictTo('commercial_user'), productController.getSellerProducts);

// Thêm route cho buyer products (user và commercial_user đều xem được danh sách mua hàng của mình)
router.get('/buyer/:buyerId?', protect, restrictTo('user', 'commercial_user'), productController.getBuyerProducts);

module.exports = router;