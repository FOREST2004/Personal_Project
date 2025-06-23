import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiFacebook, FiTwitter, FiGithub } from 'react-icons/fi';
import './Login.css';
import { authService } from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        const response = await authService.login(email, password);
        console.log('Login successful:', response);
        
        // Chuyển hướng sau khi đăng nhập thành công
        navigate('/');
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ 
          auth: error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Đăng nhập</h1>
          <p>Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className={`form-group ${errors.email ? 'error' : ''}`}>
            <label htmlFor="email">Email</label>
            <div className="input-group">
              <span className="input-icon">
                <FiMail />
              </span>
              <input
                type="email"
                id="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
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
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleShowPassword}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          {/* <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span className="checkmark"></span>
              <span>Ghi nhớ đăng nhập</span>
            </label>
            
            <Link to="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div> */}
          
          <button type="submit" className="login-button">
            Đăng nhập
          </button>
        </form>
        
        {/* <div className="login-divider">
          <span>hoặc đăng nhập bằng</span>
        </div>
        
        <div className="social-login">
          <button className="social-button facebook">
            <FiFacebook />
            <span>Facebook</span>
          </button>
          
          <button className="social-button google">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
            <span>Google</span>
          </button>
          
          <button className="social-button github">
            <FiGithub />
            <span>Github</span>
          </button>
        </div> */}
        
        <div className="register-link">
          Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;