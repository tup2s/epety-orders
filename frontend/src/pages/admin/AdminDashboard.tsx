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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Nowe zamówienia',
      value: stats?.newOrdersCount || 0,
      icon: ShoppingBag,
      color: 'bg-yellow-500/20 text-yellow-400',
      link: '/admin/orders?status=NEW',
    },
    {
      title: 'Wszystkie zamówienia',
      value: stats?.totalOrders || 0,
      icon: Package,
      color: 'bg-indigo-500/20 text-indigo-400',
      link: '/admin/orders',
    },
    {
      title: 'Niski stan magazynu',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'bg-red-500/20 text-red-400',
      link: '/admin/products',
    },
    {
      title: 'Klienci',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-green-500/20 text-green-400',
      link: '/admin/customers',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Przegląd sklepu</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link} className="card hover:border-indigo-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Nowe zamówienia</h2>
            <Link to="/admin/orders" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm">
              Zobacz wszystkie <ArrowRight size={16} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Brak nowych zamówień</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders`}
                  className="flex items-center justify-between p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">
                      Zamówienie #{order.id}
                    </p>
                    <p className="text-sm text-gray-400">{order.user?.name}</p>
                  </div>
                  <span className="font-semibold text-indigo-400">
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
            <h2 className="text-lg font-semibold text-white">Niski stan magazynu</h2>
            <Link to="/admin/products" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm">
              Zarządzaj produktami <ArrowRight size={16} />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Wszystkie produkty mają wystarczający stan</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#333] rounded overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-white">{product.name}</span>
                  </div>
                  <span className={`font-semibold ${product.stock === 0 ? 'text-red-400' : 'text-orange-400'}`}>
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
