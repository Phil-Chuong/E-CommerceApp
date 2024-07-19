import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductDetail from './Routes/products/ProductDetail';
import LoginPage from './components/login/LoginPage';
import HomePage from './Routes/homepage/HomePage';
import RegisterPage from './components/register/RegisterPage';
import PrivateRoutes from './Routes/PrivateRoutes';
import CartPage from './Routes/cart/CartPage';
import ProductList from './Routes/productlist/ProductList';
import Accounts from './Routes/accounts/accounts';
import AuthenticatedLayout from './Routes/AuthenticatedLayout';
import axios from 'axios';
import CheckoutPage from './Routes/checkout/CheckoutPage';

axios.defaults.baseURL = 'http://localhost:4000';


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
            <Route element={<AuthenticatedLayout />}> 
              <Route element={<HomePage />} path='/HomePage' exact/>
              <Route element={<ProductList />} path='/products' exact/>
              <Route element={<ProductDetail />} path='/products/:id' exact/>
              <Route element={<Accounts />} path='/accounts' exact/>
              <Route element={<CartPage />} path='/cart' exact/>  
              <Route element={<CheckoutPage />} path='/checkout' exact/>
            </Route>
          </Route>                    
      </Routes>
    </Router>
  );
}

export default App;
