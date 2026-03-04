import axios from 'axios';
import type { AuthResponse, User, Customer, Category, Product, Order, DashboardStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (login: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { login, password });

export const getMe = () => api.get<User>('/auth/me');

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.patch('/auth/password', { currentPassword, newPassword });

// Admins (admin only)
export const getAdmins = () => api.get<{ id: number; login: string; name: string; createdAt: string }[]>('/admin/admins');

export const createAdmin = (data: { login: string; password: string; name: string }) =>
  api.post('/admin/admins', data);

// Customers (admin only)
export const getCustomers = () => api.get<Customer[]>('/admin/customers');

export const createCustomer = (data: { login: string; password: string; name: string }) =>
  api.post<Customer>('/admin/customers', data);

export const updateCustomer = (id: number, data: { login?: string; name?: string }) =>
  api.put<Customer>(`/admin/customers/${id}`, data);

export const resetCustomerPassword = (id: number, newPassword: string) =>
  api.patch(`/admin/customers/${id}/password`, { newPassword });

export const deleteCustomer = (id: number) => api.delete(`/admin/customers/${id}`);

// Categories
export const getCategories = () => api.get<Category[]>('/categories');

export const createCategory = (data: { name: string; description?: string }) =>
  api.post<Category>('/categories', data);

export const updateCategory = (id: number, data: { name?: string; description?: string }) =>
  api.put<Category>(`/categories/${id}`, data);

export const deleteCategory = (id: number) => api.delete(`/categories/${id}`);

// Products
export const getProducts = (params?: { categoryId?: number; search?: string; inStock?: boolean }) =>
  api.get<Product[]>('/products', { params });

export const getProduct = (id: number) => api.get<Product>(`/products/${id}`);

export const createProduct = (data: FormData) =>
  api.post<Product>('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id: number, data: FormData) =>
  api.put<Product>(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateStock = (id: number, stock: number) =>
  api.patch<Product>(`/products/${id}/stock`, { stock });

export const deleteProduct = (id: number) => api.delete(`/products/${id}`);

// Orders
export const getOrders = (status?: string) => api.get<Order[]>('/orders', { params: { status } });

export const getOrder = (id: number) => api.get<Order>(`/orders/${id}`);

export const createOrder = (items: { productId: number; quantity: number }[], notes?: string) =>
  api.post<Order>('/orders', { items, notes });

export const updateOrderStatus = (id: number, status: string) =>
  api.patch<Order>(`/orders/${id}/status`, { status });

// Dashboard
export const getDashboardStats = () => api.get<DashboardStats>('/orders/admin/stats');

export default api;
