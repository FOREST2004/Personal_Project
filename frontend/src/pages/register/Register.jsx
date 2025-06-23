import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiMapPin, FiUsers } from 'react-icons/fi';
import './Register.css';

import {authService} from '../../services/authService'


const Register = () => {
 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    numberphone: '',
    name_display: '',
    password: '',
    location: '',
    confirmPassword: '',
    role: 'user' // Thêm role với giá trị mặc định
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên người dùng';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Tên người dùng phải có ít nhất 2 ký tự';
    }

    if (!formData.name_display.trim()) {
      newErrors.name_display = 'Vui lòng nhập tên hiển thị';
    } else if (formData.name_display.trim().length < 2) {
      newErrors.name_display = 'Tên hiển thị phải có ít nhất 2 ký tự';
    }
    
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.numberphone) {
      newErrors.numberphone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.numberphone)) {
      newErrors.numberphone = 'Số điện thoại phải có 10-11 chữ số';  
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Vui lòng nhập địa chỉ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
  
    
    if (!agreeTerms) {
      newErrors.terms = 'Bạn phải đồng ý với điều khoản sử dụng';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        setErrors({});

        const registerData = {
          username: formData.username,
          name_display: formData.name_display,
          email: formData.email,
          password: formData.password,
          location: formData.location,
          numberphone: formData.numberphone,
          role: formData.role 
        };

        console.log('Sending registration data:', registerData);
        const response = await authService.register(registerData);
        console.log('Registration response:', response);
        
        // alert(`Đăng ký thành công! Chào mừng ${formData.name_display} đến với Pet Shop!`);
        navigate('/login');
        
      } catch (error) {
        console.error('Error during registration:', error);
        
        // Xử lý lỗi chi tiết
        if (error.message) {
          if (error.message.includes('email') || error.message.includes('Email')) {
            setErrors({ auth: 'Email đã được sử dụng. Vui lòng chọn email khác.' });
          } else if (error.message.includes('username') || error.message.includes('Username')) {
            setErrors({ auth: 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.' });
          } else {
            setErrors({ auth: error.message });
          }
        } else {
          setErrors({ auth: 'Đăng ký thất bại. Vui lòng thử lại sau.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Đăng ký tài khoản</h1>
          <p>Tạo tài khoản để mua sắm và tận hưởng ưu đãi!</p>
        </div>
        
        <form className="register-form" onSubmit={handleSubmit}>
          <div className={`form-group ${errors.username ? 'error' : ''}`}>
            <label htmlFor="username">Họ và tên</label>
            <div className="input-group">
              <span className="input-icon">
                <FiUser />
              </span>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Nhập họ và tên"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>

          <div className={`form-group ${errors.name_display ? 'error' : ''}`}>
            <label htmlFor="name_display">Hiển thị tên</label>
            <div className="input-group">
              <span className="input-icon">
                <FiUser />
              </span>
              <input
                type="text"
                id="name_display"
                name="name_display"
                placeholder="Hiển thị tên"
                value={formData.name_display}
                onChange={handleChange}
              />
            </div>
            {errors.name_display && <div className="error-message">{errors.name_display}</div>}
          </div>
          
          
          <div className={`form-group ${errors.email ? 'error' : ''}`}>
            <label htmlFor="email">Email</label>
            <div className="input-group">
              <span className="input-icon">
                <FiMail />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className={`form-group ${errors.numberphone ? 'error' : ''}`}>
            <label htmlFor="numberphone">Số điện thoại</label>
            <div className="input-group">
              <span className="input-icon">
                <FiPhone />
              </span>
              <input
                type="tel"
                id="numberphone"
                name="numberphone"
                placeholder="Nhập số điện thoại"
                value={formData.numberphone}
                onChange={handleChange}
              />
            </div>
            {errors.numberphone && <div className="error-message">{errors.numberphone}</div>}
          </div>

          <div className={`form-group ${errors.location ? 'error' : ''}`}>
            <label htmlFor="location">Địa chỉ</label>
            <div className="input-group">
              <span className="input-icon">
                <FiMapPin />
              </span>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Nhập địa chỉ"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            {errors.location && <div className="error-message">{errors.location}</div>}
          </div>

          <div className="form-group">
            <label>Loại tài khoản</label>
            <div className="role-selection">
              <label className="checkbox-container">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                <span>Người dùng thông thường</span>
              </label>
              <label className="checkbox-container">
                <input
                  type="radio"
                  name="role"
                  value="commercial_user"
                  checked={formData.role === 'commercial_user'}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                <span>Người bán hàng</span>
              </label>
            </div>
          </div>
          
          <div className={`form-group ${errors.password ? 'error' : ''}`}>
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-group">
              <span className="input-icon">
                <FiLock />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <div className="input-group">
              <span className="input-icon">
                <FiLock />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
          <div className={`form-group terms-group ${errors.terms ? 'error' : ''}`}>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
              />
              <span className="checkmark"></span>
              <span>
                Tôi đồng ý với <Link to="/terms">Điều khoản sử dụng</Link> và{' '}
                <Link to="/privacy">Chính sách bảo mật</Link>
              </span>
            </label>
            {errors.terms && <div className="error-message">{errors.terms}</div>}
          </div>
          
          <button type="submit" className="register-button">
            Đăng ký
          </button>
        </form>
        
        <div className="login-link">
          Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
