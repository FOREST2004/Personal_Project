import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiTruck, FiShield, FiStar, FiCreditCard } from 'react-icons/fi';
import ProductCard from '../../components/productCard/ProductCard';
import './Home.css';
import meoFallback from '../../assets/meo.jpg';

import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';

// Banner carousel component
const HomeBanner = () => {
  const bannerImages = [
    meoFallback,
    meoFallback,
    meoFallback,
    meoFallback,
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="banner-container">
      <div className="banner">
        {bannerImages.map((image, index) => (
          <div 
            key={index} 
            className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          ></div>
        ))}
        
        <button className="banner-btn prev" onClick={prevSlide}>
          <FiChevronLeft />
        </button>
        <button className="banner-btn next" onClick={nextSlide}>
          <FiChevronRight />
        </button>
        
        <div className="banner-indicators">
          {bannerImages.map((_, index) => (
            <span 
              key={index} 
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

const CategorySection = ({ categories, loading, error }) => {
  if (loading) {
    return (
      <div className="categories-section">
        <h2 className="section-title">Danh mục sản phẩm</h2>
        <div className="loading">Đang tải danh mục...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-section">
        <h2 className="section-title">Danh mục sản phẩm</h2>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-section">
      <h2 className="section-title">Danh mục sản phẩm</h2>
      <div className="categories-grid">
        {categories.map((category) => (
          <Link 
            to={`/products?category=${category.id_category}`} 
            key={category.id_category} 
            className="category-item"
          >
            
            <span className="category-name">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Trong component Home
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Starting to fetch data...');
        
        // Lấy danh sách danh mục
        setCategoriesLoading(true);
        setCategoriesError(null);
        
        try {
          const categoriesResponse = await categoryService.getAllCategories();
          console.log('Categories fetched:', categoriesResponse);
          setCategories(categoriesResponse.data || []);
        } catch (categoryError) {
          console.error('Error fetching categories:', categoryError);
          setCategoriesError(categoryError.message || 'Lỗi khi tải danh mục');
        } finally {
          setCategoriesLoading(false);
        }
        
        // Lấy sản phẩm mới nhất
        try {
          const newProductsResponse = await productService.getAllProducts({ 
            sort: 'newest',
            limit: 20
          });
          console.log('New products fetched:', newProductsResponse);
          setNewProducts(newProductsResponse.data || []);
        } catch (productError) {
          console.error('Error fetching new products:', productError);
        }
        
        // Lấy sản phẩm nổi bật (có thể thêm trường featured trong database)
        try {
          const featuredProductsResponse = await productService.getAllProducts({ 
            limit: 20
          });
          console.log('Featured products fetched:', featuredProductsResponse);
          setFeaturedProducts(featuredProductsResponse.data || []);
        } catch (productError) {
          console.error('Error fetching featured products:', productError);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="home-page">
        <HomeBanner />
        <div className="loading-container">
          <div className="loading">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="home-page">
        <HomeBanner />
        <div className="error-container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        </div>
      </div>
    );
  }

  // Render success state
  return (
    <div className="home-page">
      {/* Hiển thị banner */}
      <HomeBanner />
      
      {/* Hiển thị danh mục sản phẩm */}
      <CategorySection 
        categories={categories} 
        loading={categoriesLoading} 
        error={categoriesError} 
      />
      
      {/* Hiển thị sản phẩm nổi bật */}
      <section className="featured-products">
        <h2 className="section-title">Sản phẩm nổi bật</h2>
        {featuredProducts.length > 0 ? (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id_product} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">Không có sản phẩm nổi bật</div>
        )}
      </section>
      
      {/* Hiển thị sản phẩm mới */}
      <section className="new-products">
        <h2 className="section-title">Sản phẩm mới</h2>
        {newProducts.length > 0 ? (
          <div className="products-grid">
            {newProducts.map(product => (
              <ProductCard key={product.id_product} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">Không có sản phẩm mới</div>
        )}
      </section>
    </div>
  );
};

export default Home;