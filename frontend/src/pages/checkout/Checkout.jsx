import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiWallet } from 'react-icons/bi';
import { FiMapPin, FiUser, FiPhone, FiCreditCard, FiDollarSign, FiCheck, FiChevronRight, FiLock, FiAlertTriangle } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    province: '',
    district: '',
    ward: '',
    paymentMethod: 'wallet',
    notes: ''
  });
  
  // Cart items
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Wallet state
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  // Get cart data from localStorage and wallet balance
  useEffect(() => {
    setLoading(true);
    setWalletLoading(true);
    
    try {
      // Get selected items from localStorage
      const checkoutItems = localStorage.getItem('checkoutItems');
      
      if (!checkoutItems) {
        // Nếu không có dữ liệu checkout, chuyển về trang giỏ hàng
        alert('Không có sản phẩm nào được chọn để thanh toán. Vui lòng quay lại giỏ hàng.');
        navigate('/cart');
        return;
      }
      
      const selectedItems = JSON.parse(checkoutItems);
      
      // Kiểm tra nếu mảng rỗng
      if (!selectedItems || selectedItems.length === 0) {
        alert('Không có sản phẩm nào được chọn để thanh toán. Vui lòng quay lại giỏ hàng.');
        navigate('/cart');
        return;
      }
      
      // Mock wallet balance - 35 triệu VND (có thể thay thế bằng API call thực)
      const mockWalletBalance = 35000000;
      
      setCartItems(selectedItems);
      setWalletBalance(mockWalletBalance);
      setLoading(false);
      setWalletLoading(false);
      
    } catch (error) {
      console.error('Error loading checkout data:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
      navigate('/cart');
    }
  }, [navigate]);

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
    
    // Check wallet balance if paying with wallet
    if (formData.paymentMethod === 'wallet') {
      const { total } = calculateTotals();
      if (walletBalance < total) {
        alert('Số dư ví không đủ để thanh toán. Vui lòng chọn phương thức thanh toán khác hoặc nạp thêm tiền vào ví.');
        return;
      }
    }
    
    // Process checkout
    console.log('Checkout data:', formData);
    console.log('Selected items:', cartItems);
    
    if (formData.paymentMethod === 'wallet') {
      const { total } = calculateTotals();
      const newBalance = walletBalance - total;
      setWalletBalance(newBalance);
      
      // Xóa dữ liệu checkout sau khi thanh toán thành công
      localStorage.removeItem('checkoutItems');
      
      alert(`Đặt hàng thành công! Số dư ví còn lại: ${formatPrice(newBalance)}`);
      navigate('/'); // Chuyển về trang chủ
    } else {
      // Xóa dữ liệu checkout sau khi thanh toán thành công
      localStorage.removeItem('checkoutItems');
      
      alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
      navigate('/'); // Chuyển về trang chủ
    }
  };
  
  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let discount = 0;
    
    cartItems.forEach(item => {
      // Sử dụng originalPrice nếu có, nếu không thì dùng price
      const originalPrice = item.originalPrice || item.price;
      subtotal += originalPrice * item.quantity;
      discount += (originalPrice - item.price) * item.quantity;
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
  
  // Check if wallet has enough balance
  const hasEnoughBalance = walletBalance >= total;
  const remainingBalance = walletBalance - total;
  

  
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
                    <label htmlFor="fullName">Họ và tên người nhận</label>
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
                      value="wallet"
                      checked={formData.paymentMethod === 'wallet'}
                      onChange={handleChange}
                    />
                    <div className="payment-method-content">
                      <div className="payment-method-icon wallet">
                        <BiWallet />
                      </div>
                      <div className="payment-method-info">
                        <h3>Thanh toán bằng ví điện tử</h3>
                        <p>Số dư hiện tại: <strong>{formatPrice(walletBalance)}</strong></p>
                        {formData.paymentMethod === 'wallet' && (
                          <div className="wallet-info">
                            {hasEnoughBalance ? (
                              <p className="balance-sufficient">
                                <FiCheck className="check-icon" />
                                Số dư sau khi mua: <strong>{formatPrice(remainingBalance)}</strong>
                              </p>
                            ) : (
                              <p className="balance-insufficient">
                                <FiAlertTriangle className="warning-icon" />
                                Số dư không đủ. Thiếu: <strong>{formatPrice(total - walletBalance)}</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {formData.paymentMethod === 'wallet' && (
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
                
                <button 
                  type="submit" 
                  className={`place-order-btn ${
                    (formData.paymentMethod === 'wallet' && !hasEnoughBalance) ? 'disabled' : ''
                  }`}
                  disabled={formData.paymentMethod === 'wallet' && !hasEnoughBalance}
                  title={
                    formData.paymentMethod === 'wallet' && !hasEnoughBalance 
                      ? 'Số dư ví không đủ để thanh toán' 
                      : 'Đặt hàng ngay'
                  }
                >
                  {formData.paymentMethod === 'wallet' && !hasEnoughBalance ? (
                    <>
                      <FiAlertTriangle />
                      Số dư không đủ
                    </>
                  ) : (
                    <>
                      Đặt hàng
                      <FiChevronRight />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="checkout-summary-container">
            {/* Wallet Summary */}
            {!walletLoading && (
              <div className="wallet-summary">
                <div className="wallet-header">
                  <BiWallet className="wallet-icon" />
                  <h3>Ví điện tử</h3>
                </div>
                <div className="wallet-balance">
                  <span>Số dư hiện tại:</span>
                  <span className="balance-amount">{formatPrice(walletBalance)}</span>
                </div>
                <div className="wallet-calculation">
                  <div className="calculation-row">
                    <span>Tổng thanh toán:</span>
                    <span>- {formatPrice(total)}</span>
                  </div>
                  <div className="calculation-divider"></div>
                  <div className={`calculation-row final ${hasEnoughBalance ? 'sufficient' : 'insufficient'}`}>
                    <span>Số dư sau khi mua:</span>
                    <span>{formatPrice(remainingBalance)}</span>
                  </div>
                  {!hasEnoughBalance && (
                    <div className="insufficient-notice">
                      <FiAlertTriangle />
                      <span>Số dư không đủ để thanh toán</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
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