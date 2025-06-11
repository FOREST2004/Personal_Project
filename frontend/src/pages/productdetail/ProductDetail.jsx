// Thêm import
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../../services/productService';

// Trong component ProductDetail
const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductById(id);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Có lỗi xảy ra khi tải thông tin sản phẩm. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchProductDetail();
  }, [id]);
  
  // Phần còn lại của component giữ nguyên, chỉ thay đổi dữ liệu từ API thay vì mock data
  
  // Thêm phần return để hiển thị UI
  return (
    <div className="product-detail-container">
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : product ? (
        <div className="product-detail">
          <h1>{product.name}</h1>
          {/* Thêm các phần hiển thị chi tiết sản phẩm ở đây */}
        </div>
      ) : (
        <div className="error-message">Không tìm thấy sản phẩm</div>
      )}
    </div>
  );
};

// Thêm dòng này để export component
export default ProductDetail;