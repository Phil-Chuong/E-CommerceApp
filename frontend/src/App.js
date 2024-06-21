// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductDetail from './components/ProductDetail';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<RegisterPage />} exact />
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
