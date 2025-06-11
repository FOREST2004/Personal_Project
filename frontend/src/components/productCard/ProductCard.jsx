import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import './ProductCard.css';
import meoFallback from '../../assets/meo.jpg';

const ProductCard = ({ product }) => {
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (

    <Link to={`/products/${product.id_product}`} className="product-card">
      <div className="product-image-container">
        <img
          src={product.image || meoFallback}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = meoFallback;
          }}
        />

      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-date">
          <span className="product-date-text">Ngày đăng: </span>
          <span className="product-date-text">{formatDate(product.date)}</span>
        </div>
       
        <div className="product-status">
          <span className="product-status-text">
            {product.status === 'active' ? 'Còn hàng' :
              product.status === 'out_of_stock' ? 'Hết hàng' :
                'Không khả dụng'}
          </span>
        </div>
        <div className="product-price">
          <span className="current-price">{formatPrice(product.price)}</span>
        </div>



      </div>
    </Link>
  );
};


export default ProductCard;