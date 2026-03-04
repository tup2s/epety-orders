export type Role = 'ADMIN' | 'CUSTOMER';

export type OrderStatus = 'NEW' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: number;
  login: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Customer {
  id: number;
  login: string;
  name: string;
  createdAt: string;
  _count?: { orders: number };
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  _count?: { products: number };
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: number;
  category?: { id: number; name: string };
  createdAt?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtOrder: number;
  product?: { id: number; name: string; images: string[]; price?: number };
}

export interface Order {
  id: number;
  userId: number;
  user?: { id: number; login: string; name: string };
  status: OrderStatus;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DashboardStats {
  newOrdersCount: number;
  totalOrders: number;
  lowStockProducts: number;
  totalCustomers: number;
}
