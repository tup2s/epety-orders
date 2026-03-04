import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getOrders } from '../api';
import type { Order, OrderStatus } from '../types';
import { Package, Calendar, CheckCircle } from 'lucide-react';

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const location = useLocation();
  const showSuccess = location.state?.success;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Moje zamówienia</h1>
        <p className="text-gray-500 mt-1">Historia Twoich zamówień</p>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle size={20} />
          Zamówienie zostało złożone pomyślnie!
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Brak zamówień</h2>
          <p className="text-gray-500">Nie złożyłeś jeszcze żadnego zamówienia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Zamówienie #{order.id}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`badge ${statusBadgeClass[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                  <span className="font-bold text-blue-600">
                    {order.totalPrice.toFixed(2)} zł
                  </span>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Produkty:</h4>
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
                                <Package size={16} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <span>{item.product?.name || 'Produkt usunięty'}</span>
                          <span className="text-gray-500">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">
                          {(item.priceAtOrder * item.quantity).toFixed(2)} zł
                        </span>
                      </div>
                    ))}
                  </div>
                  {order.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Uwagi:</span> {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
