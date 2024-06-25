import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductDetail from './components/ProductDetail';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/Register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
