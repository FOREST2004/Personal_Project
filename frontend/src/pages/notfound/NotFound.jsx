import { Link } from 'react-router-dom';
import { FiHome, FiSearch, FiShoppingCart } from 'react-icons/fi';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="not-found-image">
            <h1>404</h1>
          </div>
          
          <h2>Trang không tìm thấy</h2>
          <p>Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
          
          <div className="not-found-actions">
            <Link to="/" className="action-btn home-btn">
              <FiHome />
              <span>Trang chủ</span>
            </Link>
            
            <Link to="/products" className="action-btn products-btn">
              <FiShoppingCart />
              <span>Sản phẩm</span>
            </Link>
            
            <Link to="/search" className="action-btn search-btn">
              <FiSearch />
              <span>Tìm kiếm</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;