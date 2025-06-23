import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiList, FiFilter, FiX, FiChevronDown, FiChevronUp, FiStar } from 'react-icons/fi';
import ProductCard from '../../components/productCard/ProductCard';
import './ProductList.css';

// Thêm import
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State variables
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
  });
  
  // Thêm các biến state còn thiếu
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Filters state
  const [filters, setFilters] = useState({
    category: queryParams.get('category') || '',
    search: queryParams.get('search') || '',
    priceRange: [null, null],
    sort: queryParams.get('sort') || 'popular'
  });
  
  // Toggle expand/collapse filter sections
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Toggle mobile filter sidebar
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  

  
  // Handle category change
  const handleCategoryChange = (categorySlug) => {
    setFilters({ ...filters, category: categorySlug });

    if (filters.priceRange[0] > 0) {
      navigate(`/products?category=${categorySlug}&priceRange=${filters.priceRange[0]}-${filters.priceRange[1]}&sort=${filters.sort}`);
    } else {
      navigate(`/products?category=${categorySlug}&sort=${filters.sort}`);
    }
  };
  
  // Thêm state để track selected price range
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  
  // Handle price range change
  const handlePriceRangeChange = (min, max) => {
    setFilters({ ...filters, priceRange: [min, max] });
    setSelectedPriceRange(`${min}-${max}`); // Track selected range
  
    if (filters.category) {
      navigate(`/products?category=${filters.category}&priceRange=${min}-${max}&sort=${filters.sort}`);
    } else {
      navigate(`/products?priceRange=${min}-${max}&sort=${filters.sort}`);
    }
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const sort = e.target.value;
    setFilters({ ...filters, sort });
    
    // Update URL params
    if (filters.category) {
      navigate(`/products?category=${filters.category}&priceRange=${filters.priceRange[0]}-${filters.priceRange[1]}&sort=${sort}`);
    } else if (filters.priceRange[0] > 0) {
      navigate(`/products?priceRange=${filters.priceRange[0]}-${filters.priceRange[1]}&sort=${sort}`);
    } else {
      navigate(`/products?sort=${sort}`);
    }
  };
  
  // Reset all filters
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: '',
      search: '',
      priceRange: [null, null],
      sort: 'popular'
    });
    setSelectedPriceRange(null); // Reset selected price range
    
    navigate('/products');
  };
  
  // Fetch products data từ API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Xây dựng params từ filters
        const params = {
          page: currentPage,
          limit: 12,
          sort: filters.sort
        };
        
        if (filters.category) {
          params.category = filters.category;
        }
        
        if (filters.search) {
          params.search = filters.search;
        }
        
        if (filters.priceRange[0] > 0) {
          params.minPrice = filters.priceRange[0];
        }
        
        
        params.maxPrice = filters.priceRange[1];
        
        
        const response = await productService.getAllProducts(params);
        setProducts(response.data);
        setTotalPages(response.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filters, currentPage]);

  // Lấy danh sách danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data.map(cat => ({
          id: cat.id_category,
          name: cat.name,
          slug: cat.id_category.toString()
        })));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Update filters from URL params when component mounts
  useEffect(() => {
    const category = queryParams.get('category') || '';
    const search = queryParams.get('search') || '';
    const sort = queryParams.get('sort') || 'popular';
    
    setFilters(prev => ({
      ...prev,
      category,
      search,
      sort
    }));
  }, [location.search]);
  
  // Get the active category name for display
  const activeCategoryName = categories.find(cat => cat.slug === filters.category)?.name || 'Tất cả sản phẩm';
  
  return (
    <div className="product-list-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">{activeCategoryName}</h1>
          
          {filters.search && (
            <p className="search-results">
              Kết quả tìm kiếm cho: <span>"{filters.search}"</span>
            </p>
          )}
        </div>
        
        <div className="product-list-container">
          {/* Mobile filter toggle button */}
          <button className="filter-toggle-btn" onClick={toggleFilter}>
            <FiFilter />
            <span>Lọc</span>
          </button>
          
          {/* Filters sidebar */}
          <div className={`filters-sidebar ${filterOpen ? 'open' : ''}`}>
            <div className="filters-header">
              <h2>Bộ lọc</h2>
              <button className="filter-close-btn" onClick={toggleFilter}>
                <FiX />
              </button>
            </div>
            
            <div className="filters-content">
              {/* Category filter */}
              <div className="filter-section">
                <div 
                  className="filter-section-header" 
                  onClick={() => toggleSection('categories')}
                >
                  <h3>Danh mục</h3>
                  {expandedSections.categories ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                
                {expandedSections.categories && (
                  <div className="filter-section-content">
                    <ul className="category-list">
                      {categories.map((category) => (
                        <li key={category.id}>
                          <button 
                            className={`category-item ${filters.category === category.slug ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category.slug)}
                          >
                            {category.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Price range filter */}
              <div className="filter-section">
                <div 
                  className="filter-section-header" 
                  onClick={() => toggleSection('price')}
                >
                  <h3>Khoảng giá</h3>
                  {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                
                {expandedSections.price && (
                  <div className="filter-section-content">
                    <div className="price-inputs">
                      <input 
                        type="number" 
                        placeholder="Từ" 
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceRangeChange(parseInt(e.target.value) || 0, filters.priceRange[1])}
                      />
                      <span>-</span>
                      <input 
                        type="number" 
                        placeholder="Đến" 
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(filters.priceRange[0], parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="price-ranges">
                      <button 
                        className={selectedPriceRange === '0-2000000' ? 'active' : ''}
                        onClick={() => handlePriceRangeChange(0, 2000000)}
                      >
                        Dưới 2 triệu
                      </button>
                      <button 
                        className={selectedPriceRange === '2000000-5000000' ? 'active' : ''}
                        onClick={() => handlePriceRangeChange(2000000, 5000000)}
                      >
                        2 - 5 triệu
                      </button>
                      <button 
                        className={selectedPriceRange === '5000000-10000000' ? 'active' : ''}
                        onClick={() => handlePriceRangeChange(5000000, 10000000)}
                      >
                        5 - 10 triệu
                      </button>
                      <button 
                        className={selectedPriceRange === '10000000-20000000' ? 'active' : ''}
                        onClick={() => handlePriceRangeChange(10000000, 20000000)}
                      >
                        10 - 20 triệu
                      </button>
                      <button 
                        className={selectedPriceRange === '20000000-50000000' ? 'active' : ''}
                        onClick={() => handlePriceRangeChange(20000000, 50000000)}
                      >
                        Trên 20 triệu
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reset filters button */}
              <button className="reset-filters-btn" onClick={resetFilters}>
                Xóa tất cả
              </button>
            </div>
          </div>
          
          {/* Products content */}
          <div className="products-content">
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="view-options">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FiGrid />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FiList />
                </button>
                <span className="product-count">{products.length} sản phẩm</span>
              </div>
              
              <div className="sort-options">
                <label htmlFor="sort">Sắp xếp:</label>
                <select 
                  id="sort" 
                  value={filters.sort}
                  onChange={handleSortChange}
                >
                  <option value="popular">Phổ biến</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến cao</option>
                  <option value="price_desc">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>
            
            {/* Products display */}
            {loading ? (
              <div className="loading-products">
                <p>Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  Thử lại
                </button>
              </div>
            ) : products.length > 0 ? (
              <div className={`products-display ${viewMode}`}>
                {products.map((product) => (
                  <div key={product.id_product} className="product-item">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>Không tìm thấy sản phẩm phù hợp.</p>
                <button className="btn btn-primary" onClick={resetFilters}>
                  Xóa bộ lọc
                </button>
              </div>
            )}
            
            {/* Pagination */}
            {!loading && !error && products.length > 0 && totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn prev" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Trang trước
                </button>
                
                <div className="pagination-info">
                  Trang {currentPage} / {totalPages}
                </div>
                
                <button 
                  className="pagination-btn next" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;