// frontend/src/services/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://techtitan.onrender.com', // Replace with your backend URL
});

export default api;

