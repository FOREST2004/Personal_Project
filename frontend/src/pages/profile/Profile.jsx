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
  FiDollarSign
} from 'react-icons/fi';
import ProductCard from '../../components/productCard/ProductCard';
import { authService } from '../../services/authService';
import { productService } from '../../services/productService';
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

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getProfile();
        setUser(response.data.user);
        setFormData(response.data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Không thể tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch user products when products tab is active
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (activeTab === 'products' && user) {
        try {
          const response = await productService.getAllProducts({
            userId: user.id_user
          });
          setUserProducts(response.data || []);
        } catch (error) {
          console.error('Error fetching user products:', error);
        }
      }
    };

    fetchUserProducts();
  }, [activeTab, user]);

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
              // View Mode
              <div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{userProducts.length}</div>
                    <div className="stat-label">Sản phẩm đã đăng</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{new Intl.NumberFormat('vi-VN').format(user.wallet || 0)}đ</div>
                    <div className="stat-label">Số dư ví</div>
                  </div>
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

      case 'products':
        return (
          <div className="content-body">
            <div className="user-products">
              <div className="products-header">
                <h3>Sản phẩm của bạn ({userProducts.length})</h3>
              </div>
              
              {userProducts.length > 0 ? (
                <div className="products-grid">
                  {userProducts.map(product => (
                    <ProductCard key={product.id_product} product={product} />
                  ))}
                </div>
              ) : (
                <div className="no-products">
                  <p>Bạn chưa đăng sản phẩm nào</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Sidebar */}
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
            <div className="profile-nav-item">
              <button 
                className={`profile-nav-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <FiPackage className="profile-nav-icon" />
                Sản phẩm của tôi
              </button>
            </div>
          </nav>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          <div className="content-header">
            <h1 className="content-title">
              {activeTab === 'info' && 'Thông tin cá nhân'}
              {activeTab === 'password' && 'Đổi mật khẩu'}
              {activeTab === 'products' && 'Sản phẩm của tôi'}
            </h1>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;