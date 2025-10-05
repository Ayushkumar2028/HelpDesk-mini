import axios from 'axios';

const API = axios.create({
  baseURL: 'https://helpdesk-mini-4.onrender.com/api/',  
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default API;