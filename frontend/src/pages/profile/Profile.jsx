import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiSettings, 
  FiLock, 
  FiPackage, 
  FiEdit3, 
  FiSave, 
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiShoppingBag,
  FiPlus // Thêm icon cho tạo sản phẩm
} from 'react-icons/fi';
import ProductCard from '../../components/productCard/ProductCard';
import { authService } from '../../services/authService';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService'; // Thêm import
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [commercialStats, setCommercialStats] = useState(null);
  const [productFilter, setProductFilter] = useState('all');
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  
  // Thêm state cho tạo sản phẩm
  const [categories, setCategories] = useState([]);
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    id_category: ''
  });
  const [productFormErrors, setProductFormErrors] = useState({});
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Fetch categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Fetch commercial stats nếu user là commercial_user
  useEffect(() => {
    const fetchCommercialStats = async () => {
      if (user && user.role === 'commercial_user') {
        try {
          const response = await authService.getCommercialStats();
          setCommercialStats(response.data);
        } catch (error) {
          console.error('Error fetching commercial stats:', error);
        }
      }
    };

    fetchCommercialStats();
  }, [user]);

  // Fetch user products when my-products tab is active
  useEffect(() => {
    const fetchProducts = async () => {
      if (activeTab === 'my-products' && user && user.role === 'commercial_user') {
        try {
          const response = await productService.getSellerProducts(user.id_user);
          const products = response.data || [];
          setUserProducts(Array.isArray(products) ? products : []);
        } catch (error) {
          console.error('Error fetching products:', error);
          setUserProducts([]);
        }
      }
    };

    fetchProducts();
  }, [activeTab, user]);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getProfile();
        setUser(response.data.user);
        setFormData(response.data.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      
      const response = await authService.updateProfile(formData);
      setUser(response.data.user);
      setEditMode(false);
      setSuccess('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Đổi mật khẩu thành công!');
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    }
  };
  // Fetch purchased products for both user and commercial_user
  useEffect(() => {
    const fetchPurchasedProducts = async () => {
      if (user && (user.role === 'user' || user.role === 'commercial_user')) {
        try {
          const response = await productService.getBuyerProducts(user.id_user);
          const products = response.data || [];
          setPurchasedProducts(products);
        } catch (error) {
          console.error('Error fetching purchased products:', error);
          setPurchasedProducts([]);
        }
      }
    };

    fetchPurchasedProducts();
  }, [user]);
  
  // Thêm useEffect để log state sau khi update
  useEffect(() => {
    console.log('State purchasedProducts updated:', purchasedProducts);
    console.log('State purchasedProducts length:', purchasedProducts.length);
  }, [purchasedProducts]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">
          <p>Đang tải thông tin profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="error-message">
          <p>Không thể tải thông tin người dùng</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="content-body">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            {!editMode ? (
              <div>
                <div className="stats-grid">
                  {/* Stats cho user thường */}
                  {user.role !== 'commercial_user' && (
                    <>
                      <div className="stat-card">
                        <div className="stat-value">{purchasedProducts.length || 0}</div> 
                        <div className="stat-label">Số sản phẩm đã mua</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{new Intl.NumberFormat('vi-VN').format(user.wallet || 0)}đ</div>
                        <div className="stat-label">Số dư ví</div>
                      </div>
                    </>
                  )}
                  
                  {/* Stats cho commercial user */}
                  {user.role === 'commercial_user' && commercialStats && (
                    <>
                      <div className="stat-card">
                        <div className="stat-value">{new Intl.NumberFormat('vi-VN').format(commercialStats.total_revenue || 0)}đ</div>
                        <div className="stat-label">Tổng doanh thu</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{purchasedProducts.length || 0}</div>
                        <div className="stat-label">Số sản phẩm đã mua</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{new Intl.NumberFormat('vi-VN').format(user.wallet || 0)}đ</div>
                        <div className="stat-label">Số dư ví</div>
                      </div>
                 
                      <div className="stat-card">
                        <div className="stat-value">{commercialStats.total_products_sold || 0}</div>
                        <div className="stat-label">Sản phẩm đã bán</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{commercialStats.total_active_products || 0}</div>
                        <div className="stat-label">Sản phẩm đang bán</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{commercialStats.total_inactive_products || 0}</div>
                        <div className="stat-label">Sản phẩm đang ngưng bán</div>
                      </div>
                   
                    
                    </>
                  )}
                </div>

                <div className="profile-details">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên hiển thị</label>
                      <input 
                        type="text" 
                        value={user.name_display || ''} 
                        readOnly 
                      />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input 
                        type="text" 
                        value={user.username || ''} 
                        readOnly 
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        value={user.email || ''} 
                        readOnly 
                      />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input 
                        type="tel" 
                        value={user.numberphone || ''} 
                        readOnly 
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Địa chỉ</label>
                    <textarea 
                      value={user.location || ''} 
                      readOnly 
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setEditMode(true)}
                    >
                      <FiEdit3 />
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleUpdateProfile}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên hiển thị *</label>
                    <input 
                      type="text" 
                      name="name_display"
                      value={formData.name_display || ''}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input 
                      type="text" 
                      name="username"
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input 
                      type="tel" 
                      name="numberphone"
                      value={formData.numberphone || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <textarea 
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    <FiSave />
                    Lưu thay đổi
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditMode(false);
                      setFormData(user);
                    }}
                  >
                    <FiX />
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        );

      case 'password':
        return (
          <div className="content-body">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label>Mật khẩu hiện tại *</label>
                <input 
                  type="password" 
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Mật khẩu mới *</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Xác nhận mật khẩu mới *</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required 
                />
              </div>
              
              <div className="password-requirements">
                <h4>Yêu cầu mật khẩu:</h4>
                <ul>
                  <li>Ít nhất 6 ký tự</li>
                  <li>Nên chứa chữ hoa, chữ thường và số</li>
                  <li>Không sử dụng thông tin cá nhân</li>
                </ul>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <FiLock />
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        );

      case 'create-product':
        return (
          <div className="content-body">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleCreateProduct} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="productName">Tên sản phẩm *</label>
                  <input
                    type="text"
                    id="productName"
                    name="name"
                    value={productFormData.name}
                    onChange={handleProductFormChange}
                    placeholder="Nhập tên sản phẩm"
                    className={productFormErrors.name ? 'error' : ''}
                  />
                  {productFormErrors.name && <div className="error-message">{productFormErrors.name}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="productPrice">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    id="productPrice"
                    name="price"
                    value={productFormData.price}
                    onChange={handleProductFormChange}
                    placeholder="Nhập giá sản phẩm"
                    min="0"
                    // step="1000"
                    className={productFormErrors.price ? 'error' : ''}
                  />
                  {productFormErrors.price && <div className="error-message">{productFormErrors.price}</div>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="productCategory">Danh mục *</label>
                  <select
                    id="productCategory"
                    name="id_category"
                    value={productFormData.id_category}
                    onChange={handleProductFormChange}
                    className={productFormErrors.id_category ? 'error' : ''}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category.id_category} value={category.id_category}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {productFormErrors.id_category && <div className="error-message">{productFormErrors.id_category}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="productImage">URL Hình ảnh *</label>
                  <input
                    type="url"
                    id="productImage"
                    name="image"
                    value={productFormData.image}
                    onChange={handleProductFormChange}
                    placeholder="https://example.com/image.jpg"
                    className={productFormErrors.image ? 'error' : ''}
                  />
                  {productFormErrors.image && <div className="error-message">{productFormErrors.image}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="productDescription">Mô tả sản phẩm *</label>
                <textarea
                  id="productDescription"
                  name="description"
                  value={productFormData.description}
                  onChange={handleProductFormChange}
                  placeholder="Nhập mô tả chi tiết về sản phẩm"
                  rows="4"
                  className={productFormErrors.description ? 'error' : ''}
                />
                {productFormErrors.description && <div className="error-message">{productFormErrors.description}</div>}
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isCreatingProduct}
                >
                  <FiPlus />
                  {isCreatingProduct ? 'Đang tạo...' : 'Tạo sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        );

      /////////////////////
      case 'purchased-products':
        // Logic cho sản phẩm đã mua (purchasedProducts) - cho cả user và commercial_user
        const safePurchasedProducts = Array.isArray(purchasedProducts) ? purchasedProducts : [];
        
        return (
          <div className="content-body">
            <div className="user-products">
              <div className="products-header">
                <h3>Sản phẩm đã mua ({safePurchasedProducts.length})</h3>
              </div>
              
              {safePurchasedProducts.length > 0 ? (
                <div className="products-grid">
                  {safePurchasedProducts.map(product => (
                    <ProductCard key={product.id_product} product={product} />
                  ))}
                </div>
              ) : (
                <div className="no-products">
                  <p>Bạn chưa mua sản phẩm nào</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'my-products':
        // Logic cho sản phẩm của commercial_user
        const safeUserProducts = Array.isArray(userProducts) ? userProducts : [];
        
        // Lọc sản phẩm theo status
        const filteredUserProducts = productFilter !== 'all' 
          ? safeUserProducts.filter(product => product.status === productFilter)
          : safeUserProducts;
    
        return (
          <div className="content-body">
            <div className="user-products">
              <div className="products-header">
                <h3>Sản phẩm của bạn ({safeUserProducts.length})</h3>
                
                {/* Filter buttons */}
                <div className="product-filter">
                  <button 
                    className={`filter-btn ${productFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setProductFilter('all')}
                  >
                    Tất cả ({safeUserProducts.length})
                  </button>
                  <button 
                    className={`filter-btn ${productFilter === 'active' ? 'active' : ''}`}
                    onClick={() => setProductFilter('active')}
                  >
                    Đang bán ({safeUserProducts.filter(p => p.status === 'active').length})
                  </button>
                  <button 
                    className={`filter-btn ${productFilter === 'sold' ? 'active' : ''}`}
                    onClick={() => setProductFilter('sold')}
                  >
                    Đã bán ({safeUserProducts.filter(p => p.status === 'sold').length})
                  </button>
                  <button 
                    className={`filter-btn ${productFilter === 'inactive' ? 'active' : ''}`}
                    onClick={() => setProductFilter('inactive')}
                  >
                    Tạm dừng ({safeUserProducts.filter(p => p.status === 'inactive').length})
                  </button>
                </div>
              </div>
              
              {filteredUserProducts.length > 0 ? (
                <div className="products-grid">
                  {filteredUserProducts.map(product => (
                    <ProductCard key={product.id_product} product={product} />
                  ))}
                </div>
              ) : (
                <div className="no-products">
                  {productFilter === 'all' ? (
                    <p>Bạn chưa đăng sản phẩm nào</p>
                  ) : (
                    <p>Không có sản phẩm nào ở trạng thái này</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Thêm function xử lý tạo sản phẩm
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error khi user nhập
    if (productFormErrors[name]) {
      setProductFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProductForm = () => {
    const errors = {};
    
    if (!productFormData.name.trim()) {
      errors.name = 'Vui lòng nhập tên sản phẩm';
    }
    
    if (!productFormData.price || parseFloat(productFormData.price) < 1000) {
      errors.price = 'Vui lòng nhập giá lớn hơn hoặc bằng 1000 VNĐ';
    }
    
    if (!productFormData.description.trim()) {
      errors.description = 'Vui lòng nhập mô tả sản phẩm';
    }
    
    if (!productFormData.id_category) {
      errors.id_category = 'Vui lòng chọn danh mục';
    }
    
    if (!productFormData.image.trim()) {
      errors.image = 'Vui lòng nhập URL hình ảnh';
    }
    
    return errors;
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    const errors = validateProductForm();
    if (Object.keys(errors).length > 0) {
      setProductFormErrors(errors);
      return;
    }
    
    try {
      setIsCreatingProduct(true);
      setError(null);
      setSuccess(null);
      
      await productService.createProduct(productFormData);
      
      // Reset form
      setProductFormData({
        name: '',
        price: '',
        description: '',
        image: '',
        id_category: ''
      });
      
      setSuccess('Tạo sản phẩm thành công!');
      
      // Refresh products list nếu đang ở tab my-products
      if (activeTab === 'my-products') {
        // Trigger refresh products
        const response = await productService.getSellerProducts(user.id_user);
        const products = response.data || [];
        setUserProducts(Array.isArray(products) ? products : []);
      }
      
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Render create product form
  // const renderCreateProductForm = () => {
  //   return (
  //     <div className="content-body">
  //       {error && <div className="error-message">{error}</div>}
  //       {success && <div className="success-message">{success}</div>}
        
  //       <form onSubmit={handleCreateProduct} className="profile-form">
  //         <div className="form-row">
  //           <div className="form-group">
  //             <label htmlFor="productName">Tên sản phẩm *</label>
  //             <input
  //               type="text"
  //               id="productName"
  //               name="name"
  //               value={productFormData.name}
  //               onChange={handleProductFormChange}
  //               placeholder="Nhập tên sản phẩm"
  //               className={productFormErrors.name ? 'error' : ''}
  //             />
  //             {productFormErrors.name && <div className="error-message">{productFormErrors.name}</div>}
  //           </div>
            
  //           <div className="form-group">
  //             <label htmlFor="productPrice">Giá (VNĐ) *</label>
  //             <input
  //               type="number"
  //               id="productPrice"
  //               name="price"
  //               value={productFormData.price}
  //               onChange={handleProductFormChange}
  //               placeholder="Nhập giá sản phẩm"
  //               min="0"
  //               step="1000"
  //               className={productFormErrors.price ? 'error' : ''}
  //             />
  //             {productFormErrors.price && <div className="error-message">{productFormErrors.price}</div>}
  //           </div>
  //         </div>
          
  //         <div className="form-row">
  //           <div className="form-group">
  //             <label htmlFor="productCategory">Danh mục *</label>
  //             <select
  //               id="productCategory"
  //               name="id_category"
  //               value={productFormData.id_category}
  //               onChange={handleProductFormChange}
  //               className={productFormErrors.id_category ? 'error' : ''}
  //             >
  //               <option value="">Chọn danh mục</option>
  //               {categories.map(category => (
  //                 <option key={category.id_category} value={category.id_category}>
  //                   {category.name}
  //                 </option>
  //               ))}
  //             </select>
  //             {productFormErrors.id_category && <div className="error-message">{productFormErrors.id_category}</div>}
  //           </div>
            
  //           <div className="form-group">
  //             <label htmlFor="productImage">URL Hình ảnh *</label>
  //             <input
  //               type="url"
  //               id="productImage"
  //               name="image"
  //               value={productFormData.image}
  //               onChange={handleProductFormChange}
  //               placeholder="https://example.com/image.jpg"
  //               className={productFormErrors.image ? 'error' : ''}
  //             />
  //             {productFormErrors.image && <div className="error-message">{productFormErrors.image}</div>}
  //           </div>
  //         </div>
          
  //         <div className="form-group">
  //           <label htmlFor="productDescription">Mô tả sản phẩm *</label>
  //           <textarea
  //             id="productDescription"
  //             name="description"
  //             value={productFormData.description}
  //             onChange={handleProductFormChange}
  //             placeholder="Nhập mô tả chi tiết về sản phẩm"
  //             rows="4"
  //             className={productFormErrors.description ? 'error' : ''}
  //           />
  //           {productFormErrors.description && <div className="error-message">{productFormErrors.description}</div>}
  //         </div>
          
  //         <div className="form-actions">
  //           <button 
  //             type="submit" 
  //             className="btn btn-primary"
  //             disabled={isCreatingProduct}
  //           >
  //             <FiPlus />
  //             {isCreatingProduct ? 'Đang tạo...' : 'Tạo sản phẩm'}
  //           </button>
  //         </div>
  //       </form>
  //     </div>
  //   );
  // };

  return (
    <div className="profile-page">
      {loading ? (
        <div className="profile-container">
          <div className="loading-spinner">
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      ) : error ? (
        <div className="profile-container">
          <div className="error-message">
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-header">
              <div className="profile-avatar">
                {getInitials(user.name_display)}
              </div>
              <h2 className="profile-name">{user.name_display || 'Người dùng'}</h2>
              <p className="profile-email">{user.email}</p>
            </div>
            
            <nav className="profile-nav">
              <div className="profile-nav-item">
                <button
                  className={`profile-nav-link ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <FiUser className="profile-nav-icon" />
                  Thông tin cá nhân
                </button>
              </div>
              
              <div className="profile-nav-item">
                <button
                  className={`profile-nav-link ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  <FiLock className="profile-nav-icon" />
                  Đổi mật khẩu
                </button>
              </div>
              
              {/* Tab tạo sản phẩm - chỉ cho commercial_user */}
              {user.role === 'commercial_user' && (
                <div className="profile-nav-item">
                  <button
                    className={`profile-nav-link ${activeTab === 'create-product' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create-product')}
                  >
                    <FiPlus className="profile-nav-icon" />
                    Tạo sản phẩm
                  </button>
                </div>
              )}
              
              {/* Tab sản phẩm của tôi - chỉ cho commercial_user */}
              {user.role === 'commercial_user' && (
                <div className="profile-nav-item">
                  <button
                    className={`profile-nav-link ${activeTab === 'my-products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-products')}
                  >
                    <FiPackage className="profile-nav-icon" />
                    Sản phẩm của tôi
                  </button>
                </div>
              )}
              
              {/* Tab sản phẩm đã mua - cho cả user và commercial_user */}
              <div className="profile-nav-item">
                <button
                  className={`profile-nav-link ${activeTab === 'purchased-products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('purchased-products')}
                >
                  <FiShoppingBag className="profile-nav-icon" />
                  Sản phẩm đã mua
                </button>
              </div>
            </nav>
          </div>
          
          <div className="profile-content">
            <div className="content-header">
              <h1 className="content-title">
                {activeTab === 'info' && 'Thông tin cá nhân'}
                {activeTab === 'password' && 'Đổi mật khẩu'}
                {activeTab === 'create-product' && 'Tạo sản phẩm mới'}
                {activeTab === 'my-products' && 'Sản phẩm của tôi'}
                {activeTab === 'purchased-products' && 'Sản phẩm đã mua'}
              </h1>
            </div>
            
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
