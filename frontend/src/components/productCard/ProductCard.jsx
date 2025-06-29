import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import './ProductCard.css';
import meoFallback from '../../assets/meo.jpg';

const ProductCard = ({ product, showSellerInfo = false, showBuyerInfo = false }) => {
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Hàm để lấy class CSS dựa trên trạng thái
  const getStatusClass = (status) => {
    switch(status) {
      case 'active':
        return 'card-availability card-availability-active';
      case 'sold':
        return 'card-availability card-availability-sold';
      default:
        return 'card-availability card-availability-unavailable';
    }
  };

  return (
    <Link to={`/products/${product.id_product}`} className="product-card">
      <div className="card-img-wrapper">
        <img
          src={product.image || meoFallback}
          alt={product.name}
          className="card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = meoFallback;
          }}
        />
      </div>

      <div className="card-content">
        <h3 className="card-title">{product.name}</h3>
        
        {/* Hiển thị thông tin seller nếu có */}
        {showSellerInfo && product.seller && (
          <div className="card-seller">
            <span>Người bán: {product.seller.name_display}</span>
          </div>
        )}
        
        <div className="card-post-date">
          <span>Ngày đăng: {formatDate(product.date)}</span>
        </div>
       
        <div className={getStatusClass(product.status)}>
          <span>
            {product.status === 'active' ? 'Còn hàng' :
              product.status === 'sold' ? 'Đã bán' :
                'Không khả dụng'}
          </span>
        </div>
        
        <div className="card-pricing">
          <span className="card-price-main">{formatPrice(product.price)}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;