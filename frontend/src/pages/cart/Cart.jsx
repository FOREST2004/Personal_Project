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
  
  // Load cart from localStorage
  useEffect(() => {
    setLoading(true);
    
    try {
      const savedCart = localStorage.getItem('cart');
      const cartData = savedCart ? JSON.parse(savedCart) : [];
      
      setCartItems(cartData);
      
      // Initialize selected items (all selected by default)
      const initialSelected = {};
      cartData.forEach(item => {
        initialSelected[item.id] = true;
      });
      
      setSelectedItems(initialSelected);
      setSelectAll(cartData.length > 0);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);
  
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  // Handle quantity change
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
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
    
    cartItems.forEach(item => {
      if (selectedItems[item.id]) {
        totalItems += item.quantity;
        subtotal += item.price * item.quantity;
      }
    });
    
    return {
      totalItems,
      subtotal,
      total: subtotal
    };
  };
  
  const { totalItems, subtotal, total } = calculateTotals();
  
  // Check if any items are selected
  const hasSelectedItems = Object.values(selectedItems).some(selected => selected);
  
  // Increment quantity
  const incrementQuantity = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
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
                    Chọn tất cả ({cartItems.length} sản phẩm)
                  </label>
                </div>
                
                <div className="cart-column-headers">
                  <span>Sản phẩm</span>
                  <span>Thành tiền</span>
                  <span></span>
                </div>
              </div>
              
              <div className="cart-items-list">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={!!selectedItems[item.id]}
                        onChange={() => handleSelectItem(item.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    
                    <div className="item-info">
                      <div className="item-image">
                        <img src={item.image || '/src/assets/meo.jpg'} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <div className="item-name">
                          <Link to={`/products/${item.id}`}>{item.name}</Link>
                        </div>
                        {item.seller && (
                          <div className="item-seller">
                            Người bán: {item.seller}
                          </div>
                        )}
                      </div>
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
                          className="quantity-input"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          min="1"
                        />
                        <button 
                          className="quantity-btn"
                          onClick={() => incrementQuantity(item.id)}
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
                        title="Xóa sản phẩm"
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
                    Chọn tất cả
                  </label>
                </div>
                
                <button 
                  className="delete-selected-btn"
                  disabled={!hasSelectedItems}
                  onClick={() => {
                    const remainingItems = cartItems.filter(item => !selectedItems[item.id]);
                    setCartItems(remainingItems);
                    setSelectedItems({});
                    setSelectAll(false);
                  }}
                >
                  Xóa đã chọn
                </button>
              </div>
            </div>
            
            {/* Checkout summary */}
            <div className="checkout-summary">
              <div className="summary-card">
                <h3 className="summary-title">Tóm tắt đơn hàng</h3>
                
                <div className="summary-item">
                  <span>Tạm tính ({totalItems} sản phẩm):</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-total">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                <button 
                  className={`btn-checkout ${!hasSelectedItems ? 'disabled' : ''}`}
                  disabled={!hasSelectedItems}
                >
                  <FiShoppingCart />
                  Mua hàng ({totalItems})
                </button>
                
                <Link to="/products" className="btn-continue-shopping-alt">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;