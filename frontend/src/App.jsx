import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';

// Layouts
import MainLayout from './components/layouts/mainLayout/MainLayout';

// Pages
import Home from './pages/home/Home';
import ProductList from './pages/productlist/ProductList';
import ProductDetail from './pages/productdetail/ProductDetail';
import Cart from './pages/cart/Cart';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Checkout from './pages/checkout/Checkout';
import NotFound from './pages/notfound/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;