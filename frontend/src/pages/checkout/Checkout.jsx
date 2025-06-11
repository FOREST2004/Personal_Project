import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiUser, FiPhone, FiCreditCard, FiDollarSign, FiCheck, FiChevronRight } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    province: '',
    district: '',
    ward: '',
    paymentMethod: 'cod',
    notes: ''
  });
  
  // Cart items
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get mock cart data
  useEffect(() => {
    setLoading(true);
    
    // Mock cart data
    setTimeout(() => {
      const mockCartItems = [
        {
          id: 1,
          name: 'iPhone 15 Pro Max 256GB',
          price: 28990000,
          originalPrice: 32990000,
          discount: 12,
          quantity: 1,
          image: 'https://via.placeholder.com/150?text=iPhone+15',
        },
        {
          id: 2,
          name: 'Cáp sạc USB-C to Lightning 1m',
          price: 390000,
          originalPrice: 590000,
          discount: 33,
          quantity: 2,
          image: 'https://via.placeholder.com/150?text=Cáp+sạc',
        },
      ];
      
      setCartItems(mockCartItems);
      setLoading(false);
    }, 500);
  }, []);
  
  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.phone || !formData.address || 
        !formData.province || !formData.district || !formData.ward) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    
    // Process checkout
    console.log('Checkout data:', formData);
    alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
  };
  
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let discount = 0;
    
    cartItems.forEach(item => {
      subtotal += item.originalPrice * item.quantity;
      discount += (item.originalPrice - item.price) * item.quantity;
    });
    
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal - discount + shippingFee;
    
    return {
      subtotal,
      discount,
      shippingFee,
      total
    };
  };
  
  const { subtotal, discount, shippingFee, total } = calculateTotals();
  
  // Mock provinces data
  const provinces = ['Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
  
  // Mock districts and wards (would be dynamic based on province in real app)
  const districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5'];
  const wards = ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'];
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-checkout">
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Thanh toán</h1>
        </div>
        
        <div className="checkout-content">
          <div className="checkout-form-container">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <div className="section-header">
                  <FiMapPin className="section-icon" />
                  <h2>Thông tin giao hàng</h2>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Họ và tên</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="Nhập họ và tên"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Địa chỉ</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường)"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="province">Tỉnh/Thành phố</label>
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map((province, index) => (
                        <option key={index} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="district">Quận/Huyện</label>
                    <select
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((district, index) => (
                        <option key={index} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="ward">Phường/Xã</label>
                    <select
                      id="ward"
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((ward, index) => (
                        <option key={index} value={ward}>{ward}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Ghi chú (tùy chọn)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                    value={formData.notes}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
              
              <div className="form-section">
                <div className="section-header">
                  <FiCreditCard className="section-icon" />
                  <h2>Phương thức thanh toán</h2>
                </div>
                
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                    />
                    <div className="payment-method-content">
                      <div className="payment-method-icon">
                        <FiDollarSign />
                      </div>
                      <div className="payment-method-info">
                        <h3>Thanh toán khi nhận hàng (COD)</h3>
                        <p>Bạn chỉ phải thanh toán khi nhận được hàng</p>
                      </div>
                      {formData.paymentMethod === 'cod' && (
                        <div className="payment-method-check">
                          <FiCheck />
                        </div>
                      )}
                    </div>
                  </label>
                  
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="banking"
                      checked={formData.paymentMethod === 'banking'}
                      onChange={handleChange}
                    />
                    <div className="payment-method-content">
                      <div className="payment-method-icon banking">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Bank-transfer-icon.png" alt="Banking" />
                      </div>
                      <div className="payment-method-info">
                        <h3>Chuyển khoản ngân hàng</h3>
                        <p>Thực hiện thanh toán vào tài khoản ngân hàng của chúng tôi</p>
                      </div>
                      {formData.paymentMethod === 'banking' && (
                        <div className="payment-method-check">
                          <FiCheck />
                        </div>
                      )}
                    </div>
                  </label>
                  
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={formData.paymentMethod === 'momo'}
                      onChange={handleChange}
                    />
                    <div className="payment-method-content">
                      <div className="payment-method-icon momo">
                        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" />
                      </div>
                      <div className="payment-method-info">
                        <h3>Thanh toán qua Ví MoMo</h3>
                        <p>Thanh toán qua ứng dụng MoMo</p>
                      </div>
                      {formData.paymentMethod === 'momo' && (
                        <div className="payment-method-check">
                          <FiCheck />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="checkout-actions">
                <Link to="/cart" className="back-to-cart-btn">
                  Quay lại giỏ hàng
                </Link>
                
                <button type="submit" className="place-order-btn">
                  Đặt hàng
                  <FiChevronRight />
                </button>
              </div>
            </form>
          </div>
          
          <div className="checkout-summary-container">
            <div className="checkout-summary">
              <h2>Tóm tắt đơn hàng</h2>
              
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                      <span className="item-quantity">{item.quantity}</span>
                    </div>
                    
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <div className="item-price">
                        <span className="current-price">{formatPrice(item.price)}</span>
                        {item.discount > 0 && (
                          <span className="original-price">{formatPrice(item.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="coupon-section">
                <input
                  type="text"
                  placeholder="Mã giảm giá"
                  className="coupon-input"
                />
                <button className="apply-coupon-btn">Áp dụng</button>
              </div>
              
              <div className="order-summary">
                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="summary-row discount">
                  <span>Giảm giá:</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {shippingFee > 0 ? formatPrice(shippingFee) : 'Miễn phí'}
                  </span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
            
            <div className="payment-secure-info">
              <p>
                <FiLock /> Thông tin thanh toán của bạn được bảo mật.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;