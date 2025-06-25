import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiUser, FiShoppingCart } from 'react-icons/fi';
import { authService } from '../../../services/authService';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Kiểm tra authentication state
  const isAuthenticated = authService.isAuthenticated();
  const cartItemCount = 0; // TODO: Kết nối với cart state thực tế
  

 // ✅ Fetch thông tin user khi đã đăng nhập
 useEffect(() => {
  const fetchUserProfile = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const response = await authService.getProfile();
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Nếu lỗi 401, có thể token hết hạn
        if (error.status === 401) {
          authService.logout();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
    }
  };

  fetchUserProfile();
}, [isAuthenticated]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null); // Xóa thông tin user
    navigate('/');
    setIsOpen(false);
    // Refresh để cập nhật UI
    window.location.reload();
  };

   // ✅ Function để hiển thị tên user
   const getUserDisplayName = () => {
    if (loading) return 'Đang tải...';
    if (!user) return 'User';
    
    return user.name_display || user.username || user.email?.split('@')[0] || 'User';
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Link to="/">Xù Pet Shop</Link>
        </div>
        
        <div className="navbar-toggle" onClick={handleToggle}>
          {isOpen ? <FiX /> : <FiMenu />}
        </div>
        
        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/products?sort=popular" className="nav-link" onClick={() => setIsOpen(false)}>
                Sản phẩm
              </Link>
            </li>
            
          </ul>
        </div>
        
        <div className="navbar-search">
          <form onSubmit={handleSearch}>
            <div className="search-group">
              <input 
                type="text" 
                placeholder="Tìm kiếm thú cưng, thức ăn, phụ kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-button">
                <FiSearch />
              </button>
            </div>
          </form>
        </div>
        
        <div className="navbar-actions">
          {/* Cart - Hiển thị cho cả user đã và chưa đăng nhập */}
          <Link to="/cart" className="nav-icon-link">
            <div className="icon-container">
              <FiShoppingCart />
              {cartItemCount > 0 && <span className="badge">{cartItemCount}</span>}
            </div>
          </Link>

          {isAuthenticated ? (
            <div className="dropdown">
              <button className="dropdown-toggle">
                <FiUser />
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-item" style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', marginBottom: '5px', paddingBottom: '10px' }}>
                  Xin chào, {getUserDisplayName()}
                </div>
                <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
                  Tài khoản của tôi
                </Link>
                <Link to="/orders" className="dropdown-item" onClick={() => setIsOpen(false)}>
                  Đơn hàng
                </Link>
                <Link to="/my-products" className="dropdown-item" onClick={() => setIsOpen(false)}>
                  Sản phẩm của tôi
                </Link>
                <button className="dropdown-item" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-button login-button" onClick={() => setIsOpen(false)}>
                Đăng nhập
              </Link>
              <Link to="/register" className="nav-button register-button" onClick={() => setIsOpen(false)}>
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className={`mobile-search ${isOpen ? 'active' : ''}`}>
        <form onSubmit={handleSearch}>
          <div className="search-group">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              <FiSearch />
            </button>
          </div>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;