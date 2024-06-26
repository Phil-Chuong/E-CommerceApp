import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductDetail from './components/ProductDetail';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';
import PrivateRoutes from './Routes/PrivateRoutes';
import CartPage from './components/CartPage';

function App() {
  return (
    <Router>
      <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/Register" element={<RegisterPage />} />

          {/* Private routes */}
          <Route element={<PrivateRoutes />}>
            <Route element={<HomePage />} path='/HomePage' exact/>
            <Route element={<ProductDetail />} path='/products/:id' />
            <Route element={<CartPage />} path='/cart' exact/>
          </Route>    
      </Routes>
    </Router>
  );
}

export default App;
