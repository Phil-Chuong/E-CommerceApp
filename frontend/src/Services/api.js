// frontend/src/services/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000', // Replace with your backend URL
});

export default api;

