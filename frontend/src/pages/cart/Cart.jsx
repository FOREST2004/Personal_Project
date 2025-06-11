import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  // Cart items state
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected items for checkout
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  // Mock data for cart items
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
          stock: 50,
          image: 'https://via.placeholder.com/150?text=iPhone+15',
        },
        {
          id: 2,
          name: 'Cáp sạc USB-C to Lightning 1m',
          price: 390000,
          originalPrice: 590000,
          discount: 33,
          quantity: 2,
          stock: 100,
          image: 'https://via.placeholder.com/150?text=Cáp+sạc',
        },
        {
          id: 3,
          name: 'Ốp lưng iPhone 15 Pro Max Silicon',
          price: 590000,
          originalPrice: 790000,
          discount: 25,
          quantity: 1,
          stock: 30,
          image: 'https://via.placeholder.com/150?text=Ốp+lưng',
        },
      ];
      
      setCartItems(mockCartItems);
      
      // Initialize selected items (all selected by default)
      const initialSelected = {};
      mockCartItems.forEach(item => {
        initialSelected[item.id] = true;
      });
      
      setSelectedItems(initialSelected);
      setSelectAll(true);
      setLoading(false);
    }, 500);
  }, []);
  
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  // Handle quantity change
  const handleQuantityChange = (id, newQuantity) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  // Handle remove item
  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    
    // Update selected items
    const newSelectedItems = { ...selectedItems };
    delete newSelectedItems[id];
    setSelectedItems(newSelectedItems);
  };
  
  // Handle item selection
  const handleSelectItem = (id) => {
    setSelectedItems({
      ...selectedItems,
      [id]: !selectedItems[id]
    });
    
    // Check if all items are selected after this change
    const willAllBeSelected = cartItems.every(item => 
      item.id === id ? !selectedItems[id] : !!selectedItems[item.id]
    );
    
    setSelectAll(willAllBeSelected);
  };
  
  // Handle select all
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelectedItems = {};
    cartItems.forEach(item => {
      newSelectedItems[item.id] = newSelectAll;
    });
    
    setSelectedItems(newSelectedItems);
  };
  
  // Calculate totals
  const calculateTotals = () => {
    let totalItems = 0;
    let subtotal = 0;
    let discount = 0;
    
    cartItems.forEach(item => {
      if (selectedItems[item.id]) {
        totalItems += item.quantity;
        subtotal += item.originalPrice * item.quantity;
        discount += (item.originalPrice - item.price) * item.quantity;
      }
    });
    
    const total = subtotal - discount;
    
    return {
      totalItems,
      subtotal,
      discount,
      total
    };
  };
  
  const { totalItems, subtotal, discount, total } = calculateTotals();
  
  // Check if any items are selected
  const hasSelectedItems = Object.values(selectedItems).some(selected => selected);
  
  // Increment quantity
  const incrementQuantity = (id, stock) => {
    const item = cartItems.find(item => item.id === id);
    if (item && item.quantity < stock) {
      handleQuantityChange(id, item.quantity + 1);
    }
  };
  
  // Decrement quantity
  const decrementQuantity = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item && item.quantity > 1) {
      handleQuantityChange(id, item.quantity - 1);
    }
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-cart">
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Giỏ hàng của bạn</h1>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <FiShoppingCart />
            </div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy tiếp tục mua sắm để tìm những sản phẩm ưng ý nhé!</p>
            <Link to="/products" className="btn-continue-shopping">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="cart-container">
            {/* Cart items */}
            <div className="cart-items">
              <div className="cart-header">
                <div className="select-all">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <span className="checkmark"></span>
                    <span>Chọn tất cả ({cartItems.length})</span>
                  </label>
                </div>
                
                <div className="cart-column-headers">
                  <div className="product-column">Sản phẩm</div>
                  <div className="price-column">Đơn giá</div>
                  <div className="quantity-column">Số lượng</div>
                  <div className="total-column">Thành tiền</div>
                  <div className="action-column"></div>
                </div>
              </div>
              
              <div className="cart-items-list">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-select">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={!!selectedItems[item.id]}
                          onChange={() => handleSelectItem(item.id)}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>
                    
                    <div className="item-info">
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      
                      <div className="item-name">
                        <Link to={`/products/${item.id}`}>{item.name}</Link>
                      </div>
                    </div>
                    
                    <div className="item-price">
                      <div className="current-price">{formatPrice(item.price)}</div>
                      {item.discount > 0 && (
                        <div className="original-price">{formatPrice(item.originalPrice)}</div>
                      )}
                    </div>
                    
                    <div className="item-quantity">
                      <div className="quantity-control">
                        <button
                          className="quantity-btn"
                          onClick={() => decrementQuantity(item.id)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="quantity-input"
                        />
                        <button
                          className="quantity-btn"
                          onClick={() => incrementQuantity(item.id, item.stock)}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    
                    <div className="item-action">
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-actions">
                <div className="select-all-bottom">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <span className="checkmark"></span>
                    <span>Chọn tất cả ({cartItems.length})</span>
                  </label>
                </div>
                
                <button
                  className="delete-selected-btn"
                  disabled={!hasSelectedItems}
                  onClick={() => {
                    const itemsToRemove = cartItems.filter(item => selectedItems[item.id]);
                    setCartItems(cartItems.filter(item => !selectedItems[item.id]));
                    setSelectedItems({});
                  }}
                >
                  Xóa đã chọn
                </button>
              </div>
            </div>
            
            {/* Checkout summary */}
            <div className="checkout-summary">
              <div className="summary-card">
                <h2 className="summary-title">Tóm tắt đơn hàng</h2>
                
                <div className="summary-item">
                  <span>Tạm tính ({totalItems} sản phẩm):</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="summary-item discount-item">
                  <span>Giảm giá:</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-total">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                <Link 
                  to="/checkout" 
                  className={`btn-checkout ${!hasSelectedItems ? 'disabled' : ''}`}
                  onClick={(e) => !hasSelectedItems && e.preventDefault()}
                >
                  Thanh toán
                  <FiChevronRight />
                </Link>
                
                <Link to="/products" className="btn-continue-shopping-alt">
                  Tiếp tục mua sắm
                </Link>
              </div>
              
              <div className="promo-card">
                <h3 className="promo-title">Mã giảm giá</h3>
                
                <div className="promo-item">
                  <div className="promo-badge">WELCOME</div>
                  <p>Giảm 10% cho đơn hàng đầu tiên</p>
                </div>
                
                <div className="promo-item">
                  <div className="promo-badge">FREESHIP</div>
                  <p>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;