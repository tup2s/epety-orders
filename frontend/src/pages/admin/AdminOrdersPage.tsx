import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../api';
import type { Order, OrderStatus } from '../../types';
import { Package, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';

const statusLabels: Record<OrderStatus, string> = {
  NEW: 'Nowe',
  PROCESSING: 'W realizacji',
  SHIPPED: 'Wysłane',
  COMPLETED: 'Zrealizowane',
  CANCELLED: 'Anulowane',
};

const statusBadgeClass: Record<OrderStatus, string> = {
  NEW: 'badge-new',
  PROCESSING: 'badge-processing',
  SHIPPED: 'badge-shipped',
  COMPLETED: 'badge-completed',
  CANCELLED: 'badge-cancelled',
};

const statusOptions: OrderStatus[] = ['NEW', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
const filterOptions: OrderStatus[] = ['NEW', 'PROCESSING', 'SHIPPED', 'COMPLETED']; // No CANCELLED - they get deleted

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      const response = await getOrders(filterStatus || undefined);
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingOrder(orderId);
    try {
      const response = await updateOrderStatus(orderId, newStatus);
      
      // If order was cancelled and deleted, remove from list
      if ((response.data as { deleted?: boolean }).deleted) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      } else {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Zamówienia</h1>
        <p className="text-gray-400 mt-1">Zarządzaj zamówieniami klientów</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('')}
            className={`btn ${filterStatus === '' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Wszystkie
          </button>
          {filterOptions.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-secondary'}`}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Brak zamówień</h2>
          <p className="text-gray-400">Nie ma zamówień do wyświetlenia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between">
                <div
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package size={24} className="text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">
                        Zamówienie #{order.id}
                      </h3>
                      <span className={`badge ${statusBadgeClass[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {order.user?.name} ({order.user?.login})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-400">
                      {order.totalPrice.toFixed(2)} zł
                    </p>
                    <p className="text-sm text-gray-400">{order.items.length} produktów</p>
                  </div>
                  {expandedOrder === order.id ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="mt-4 pt-4 border-t border-[#333]">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Products */}
                    <div>
                      <h4 className="font-medium text-white mb-3">Produkty:</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                                {item.product?.images?.[0] ? (
                                  <img
                                    src={item.product.images[0]}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package size={16} className="text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <span className="text-gray-300">{item.product?.name || 'Produkt usunięty'}</span>
                              <span className="text-gray-500">x{item.quantity}</span>
                            </div>
                            <span className="font-medium text-white">
                              {(item.priceAtOrder * item.quantity).toFixed(2)} zł
                            </span>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                          <p className="text-sm text-yellow-400">
                            <span className="font-medium">Uwagi:</span> {order.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Change */}
                    <div>
                      <h4 className="font-medium text-white mb-3">Zmień status:</h4>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(order.id, status)}
                            disabled={updatingOrder === order.id || order.status === status}
                            className={`btn ${
                              order.status === status
                                ? 'btn-primary'
                                : 'btn-secondary'
                            }`}
                          >
                            {updatingOrder === order.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              statusLabels[status]
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
