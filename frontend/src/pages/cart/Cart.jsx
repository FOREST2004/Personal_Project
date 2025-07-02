import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiChevronRight, FiTrash2, FiUser } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  // Cart items state
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected items for checkout (organized by seller)
  const [selectedItemsBySeller, setSelectedItemsBySeller] = useState({});
  
  // Load cart from localStorage
  useEffect(() => {
    setLoading(true);
    
    try {
      const savedCart = localStorage.getItem('cart');
      const cartData = savedCart ? JSON.parse(savedCart) : [];
      
      setCartItems(cartData);
      
      // Initialize selected items by seller
      const initialSelected = {};
      const groupedBySeller = groupItemsBySeller(cartData);
      
      Object.keys(groupedBySeller).forEach(seller => {
        initialSelected[seller] = {};
        groupedBySeller[seller].forEach(item => {
          initialSelected[seller][item.id] = false; // Default: không chọn
        });
      });
      
      setSelectedItemsBySeller(initialSelected);
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
  
  // Group items by seller
  const groupItemsBySeller = (items) => {
    return items.reduce((groups, item) => {
      const seller = item.seller || 'Người bán không xác định';
      if (!groups[seller]) {
        groups[seller] = [];
      }
      groups[seller].push(item);
      return groups;
    }, {});
  };
  
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
    const itemToRemove = cartItems.find(item => item.id === id);
    const seller = itemToRemove?.seller || 'Người bán không xác định';
    
    setCartItems(cartItems.filter(item => item.id !== id));
    
    // Update selected items
    setSelectedItemsBySeller(prev => {
      const newSelected = { ...prev };
      if (newSelected[seller] && newSelected[seller][id]) {
        delete newSelected[seller][id];
      }
      return newSelected;
    });
  };
  
  // Handle item selection
  const handleSelectItem = (seller, id) => {
    setSelectedItemsBySeller(prev => ({
      ...prev,
      [seller]: {
        ...prev[seller],
        [id]: !prev[seller]?.[id]
      }
    }));
  };
  
  // Handle select all items from a seller
  const handleSelectAllFromSeller = (seller, items) => {
    const allSelected = items.every(item => selectedItemsBySeller[seller]?.[item.id]);
    
    setSelectedItemsBySeller(prev => {
      const newSelected = { ...prev };
      if (!newSelected[seller]) newSelected[seller] = {};
      
      items.forEach(item => {
        newSelected[seller][item.id] = !allSelected;
      });
      
      return newSelected;
    });
  };
  
  // Calculate totals for a seller
  const calculateSellerTotals = (seller, items) => {
    let totalItems = 0;
    let subtotal = 0;
    
    items.forEach(item => {
      if (selectedItemsBySeller[seller]?.[item.id]) {
        totalItems += item.quantity;
        subtotal += item.price * item.quantity;
      }
    });
    
    return { totalItems, subtotal };
  };
  
  // Check if seller has selected items
  const hasSelectedItemsFromSeller = (seller) => {
    return Object.values(selectedItemsBySeller[seller] || {}).some(selected => selected);
  };
  
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
  
  // Handle checkout for specific seller
  const handleCheckoutSeller = (seller) => {
    const selectedItems = Object.keys(selectedItemsBySeller[seller] || {})
      .filter(itemId => selectedItemsBySeller[seller][itemId])
      .map(itemId => cartItems.find(item => item.id === parseInt(itemId)))
      .filter(Boolean);
    
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    
    // Store selected items for checkout
    localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    
    // Navigate to checkout page
    navigate('/checkout');
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
  
  const groupedItems = groupItemsBySeller(cartItems);
  
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
          <div className="cart-container-by-seller">
            {Object.entries(groupedItems).map(([seller, items]) => {
              const { totalItems, subtotal } = calculateSellerTotals(seller, items);
              const allSelected = items.every(item => selectedItemsBySeller[seller]?.[item.id]);
              const hasSelected = hasSelectedItemsFromSeller(seller);
              
              return (
                <div key={seller} className="seller-group">
                  {/* Seller Header */}
                  <div className="seller-header">
                    <div className="seller-info">
                      <FiUser className="seller-icon" />
                      <span className="seller-name">{seller}</span>
                      <span className="seller-item-count">({items.length} sản phẩm)</span>
                    </div>
                    
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={allSelected && items.length > 0}
                        onChange={() => handleSelectAllFromSeller(seller, items)}
                      />
                      <span className="checkmark"></span>
                      Chọn tất cả 
                    </label>
                  </div>
                  
                  {/* Products from this seller */}
                  <div className="seller-products">
                    <div className="cart-column-headers">
                      <span>Sản phẩm</span>
                      <span>Thành tiền</span>
                      <span></span>
                    </div>
                    
                    <div className="cart-items-list">
                      {items.map(item => (
                        <div key={item.id} className="cart-item">
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={!!selectedItemsBySeller[seller]?.[item.id]}
                              onChange={() => handleSelectItem(seller, item.id)}
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
                  </div>
                  
                  {/* Seller Checkout Summary */}
                  {hasSelected && (
                    <div className="seller-checkout">
                      <div className="seller-summary">
                        <div className="summary-info">
                          <span>Tổng ({totalItems} sản phẩm): {formatPrice(subtotal)}</span>
                        </div>
                        <button 
                          className="btn-checkout-seller"
                          onClick={() => handleCheckoutSeller(seller)}
                        >
                          <FiShoppingCart />
                          Mua từ {seller} ({totalItems})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="cart-bottom-actions">
              <Link to="/products" className="btn-continue-shopping-alt">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;