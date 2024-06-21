// frontend/src/services/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // Replace with your backend URL
});

export default api;

