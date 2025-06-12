import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingCart, FiTruck, FiShield, FiCheck, FiArrowLeft, FiMapPin, FiUser, FiCalendar } from 'react-icons/fi';
import './ProductDetail.css';
import meoFallback from '../../assets/meo.jpg';
import { productService } from '../../services/productService'; // Sử dụng service có sẵn

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching product with ID:', id);
        const response = await productService.getProductById(id);
        
        console.log('Product response:', response);
        
        if (response && response.data) {
          setProduct(response.data);
        } else {
          throw new Error('Không tìm thấy sản phẩm');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status display
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'active':
        return { text: 'Còn hàng', color: '#00a699' };
      case 'out_of_stock':
        return { text: 'Hết hàng', color: '#ff5722' };
      case 'inactive':
        return { text: 'Ngừng bán', color: '#9e9e9e' };
      default:
        return { text: 'Không rõ', color: '#9e9e9e' };
    }
  };

  // Get category color
  const getCategoryColor = (categoryName) => {
    const colors = {
      'Chó': '#ff9800',
      'Mèo': '#2196f3',
      'Cá': '#00bcd4',
      'Chim': '#4caf50',
      'Sóc': '#795548',
      'Thức ăn thú cưng': '#ff5722',
      'Phụ kiện': '#9c27b0',
      'Dịch vụ': '#607d8b',
      'Y tế & Thuốc': '#f44336',
      'Chuồng, nhà & giường': '#3f51b5'
    };
    return colors[categoryName] || '#9e9e9e';
  };

  // Increase quantity
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  // Decrease quantity
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle quantity input change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (product.status !== 'active') {
      alert('Sản phẩm này hiện không khả dụng');
      return;
    }

    // In a real app, this would add to cart context/localStorage
    const cartItem = {
      id: product.id_product,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      seller: product.user?.name_display || 'Không rõ'
    };

    // Save to localStorage for now
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex(item => item.id === product.id_product);
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  // Buy now handler
  const handleBuyNow = () => {
    if (product.status !== 'active') {
      alert('Sản phẩm này hiện không khả dụng');
      return;
    }

    // Add to cart first
    handleAddToCart();
    // Then navigate to checkout
    navigate('/cart');
  };

  // Contact seller
  const handleContactSeller = () => {
    const sellerInfo = product.user || {};
    alert(`Liên hệ với ${sellerInfo.name_display || 'Người bán'}\nEmail: ${sellerInfo.email || 'N/A'}\nSĐT: ${sellerInfo.phone || 'N/A'}\nĐịa chỉ: ${sellerInfo.location || 'N/A'}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-container">
            <h2>❌ Lỗi</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/products')} className="btn-back">
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-container">
            <h2>🔍 Không tìm thấy sản phẩm</h2>
            <p>Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <button onClick={() => navigate('/products')} className="btn-back">
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(product.status);
  
  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-button">
          <FiArrowLeft /> Quay lại
        </button>

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/">Trang chủ</a>
          <span> &gt; </span>
          <a href="/products">Sản phẩm</a>
          <span> &gt; </span>
          <span style={{ color: getCategoryColor(product.category?.name) }}>
            {product.category?.name || 'Chưa phân loại'}
          </span>
          <span> &gt; </span>
          <span>{product.name}</span>
        </div>
        
        <div className="product-detail-container">
          {/* Product Images */}
          <div className="product-image-container">
            <div className="main-image">
              <img 
                src={product.image || meoFallback} 
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = meoFallback;
                }}
              />
            </div>
            {/* Additional images could be added here in the future */}
          </div>
          
          {/* Product Info */}
          <div className="product-info">
            {/* Category Badge */}
            <div className="category-badge" style={{ backgroundColor: getCategoryColor(product.category?.name) }}>
              {product.category?.name || 'Chưa phân loại'}
            </div>

            {/* Product Name */}
            <h1 className="product-name">{product.name}</h1>
            
            {/* Product Meta Info */}
            <div className="product-meta-info">
              <div className="meta-item">
                <FiCalendar className="meta-icon" />
                <span>Đăng ngày: {formatDate(product.date)}</span>
              </div>
              <div className="meta-item">
                <FiUser className="meta-icon" />
                <span>Người bán: {product.user?.name_display || 'Ẩn danh'}</span>
              </div>
              {product.user?.location && (
                <div className="meta-item">
                  <FiMapPin className="meta-icon" />
                  <span>Địa điểm: {product.user.location}</span>
                </div>
              )}
            </div>

            {/* Product Status */}
            <div className="product-status-badge" style={{ backgroundColor: statusInfo.color }}>
              {statusInfo.text}
            </div>
            
            {/* Product Price */}
            <div className="product-price">
              <span className="current-price">{formatPrice(product.price)}</span>
            </div>
            
       
            
            {/* Product Actions */}
            <div className="product-actions">
              {product.status === 'active' ? (
                <>
                  <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    <FiShoppingCart /> Thêm vào giỏ
                  </button>
                  <button className="buy-now-btn" onClick={handleBuyNow}>
                    Mua ngay
                  </button>
                </>
              ) : (
                <button className="contact-seller-btn" onClick={handleContactSeller}>
                  <FiUser /> Liên hệ người bán
                </button>
              )}
            </div>
            
            {/* Product Policies */}
            <div className="product-policies">
              <div className="policy-item">
                <FiTruck className="policy-icon" />
                <span>Giao hàng tận nơi</span>
              </div>
              <div className="policy-item">
                <FiShield className="policy-icon" />
                <span>Hỗ trợ đổi trả</span>
              </div>
              <div className="policy-item">
                <FiCheck className="policy-icon" />
                <span>Sản phẩm chính hãng</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Description */}
        <div className="product-description-container">
          <h2>Mô tả sản phẩm</h2>
          <div className="product-description">
            <p>{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>
            
            {/* Seller Information */}
            <div className="seller-info">
              <h3>Thông tin người bán</h3>
              <div className="seller-details">
                <p><strong>Tên:</strong> {product.user?.name_display || 'Ẩn danh'}</p>
                {product.user?.location && <p><strong>Địa chỉ:</strong> {product.user.location}</p>}
                <button className="contact-seller-btn" onClick={handleContactSeller}>
                  Liên hệ người bán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;