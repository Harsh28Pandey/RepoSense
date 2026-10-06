import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      // Unauthenticated redirect handled by auth context
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default API;
