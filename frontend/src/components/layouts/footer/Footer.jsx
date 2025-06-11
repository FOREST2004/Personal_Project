import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">Chợ Rất Tốt</h3>
            <p className="footer-description">
              Nền tảng mua bán trực tuyến uy tín hàng đầu Việt Nam
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><FiFacebook /></a>
              <a href="#" className="social-link"><FiTwitter /></a>
              <a href="#" className="social-link"><FiInstagram /></a>
              <a href="#" className="social-link"><FiYoutube /></a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Danh mục</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=dien-thoai">Điện thoại</Link></li>
              <li><Link to="/products?category=may-tinh">Máy tính</Link></li>
              <li><Link to="/products?category=thoi-trang">Thời trang</Link></li>
              <li><Link to="/products?category=do-gia-dung">Đồ gia dụng</Link></li>
              <li><Link to="/products?category=my-pham">Mỹ phẩm</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Hỗ trợ khách hàng</h4>
            <ul className="footer-links">
              <li><Link to="/help">Trung tâm trợ giúp</Link></li>
              <li><Link to="/guide">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/shipping">Phương thức vận chuyển</Link></li>
              <li><Link to="/return-policy">Chính sách đổi trả</Link></li>
              <li><Link to="/contact">Liên hệ hỗ trợ</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Đăng ký nhận tin</h4>
            <p>Nhận thông tin về sản phẩm mới và khuyến mãi</p>
            <div className="newsletter">
              <input type="email" placeholder="Email của bạn" />
              <button className="newsletter-btn">Đăng ký</button>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">© 2025 Chợ Rất Tốt. All rights reserved</p>
          <div className="footer-bottom-links">
            <Link to="/terms">Điều khoản sử dụng</Link>
            <Link to="/privacy">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;