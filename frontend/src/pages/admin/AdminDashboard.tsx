import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getOrders, getProducts } from '../../api';
import type { DashboardStats, Order, Product } from '../../types';
import { Package, Users, ShoppingBag, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        getDashboardStats(),
        getOrders('NEW'),
        getProducts(),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
      setLowStockProducts(productsRes.data.filter((p) => p.stock <= 5).slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Nowe zamówienia',
      value: stats?.newOrdersCount || 0,
      icon: ShoppingBag,
      color: 'bg-yellow-100 text-yellow-600',
      link: '/admin/orders?status=NEW',
    },
    {
      title: 'Wszystkie zamówienia',
      value: stats?.totalOrders || 0,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
      link: '/admin/orders',
    },
    {
      title: 'Niski stan magazynu',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      link: '/admin/products',
    },
    {
      title: 'Klienci',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-green-100 text-green-600',
      link: '/admin/customers',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Przegląd sklepu</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Nowe zamówienia</h2>
            <Link to="/admin/orders" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
              Zobacz wszystkie <ArrowRight size={16} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Brak nowych zamówień</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders`}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Zamówienie #{order.id}
                    </p>
                    <p className="text-sm text-gray-500">{order.user?.name}</p>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {order.totalPrice.toFixed(2)} zł
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Niski stan magazynu</h2>
            <Link to="/admin/products" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
              Zarządzaj produktami <ArrowRight size={16} />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Wszystkie produkty mają wystarczający stan</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                  <span className={`font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                    {product.stock} szt.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
