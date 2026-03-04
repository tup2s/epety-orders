import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Package } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (items.length === 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      await createOrder(orderItems, notes || undefined);
      clearCart();
      navigate('/orders', { state: { success: true } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Błąd podczas składania zamówienia');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag size={64} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Twój koszyk jest pusty</h2>
        <p className="text-gray-400 mb-6">Dodaj produkty, aby złożyć zamówienie</p>
        <Link to="/products" className="btn btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Przeglądaj produkty
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Koszyk</h1>
        <p className="text-gray-400 mt-1">{items.length} produktów</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="card flex gap-4">
              <div className="w-24 h-24 bg-[#2a2a2a] rounded-lg overflow-hidden flex-shrink-0">
                {item.product.images[0] ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={32} className="text-gray-600" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link
                  to={`/products/${item.product.id}`}
                  className="font-semibold text-white hover:text-indigo-400"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-400">{item.product.category?.name}</p>
                <p className="text-indigo-400 font-semibold mt-1">
                  {item.product.price.toFixed(2)} zł
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="btn btn-secondary p-1"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="btn btn-secondary p-1"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <p className="font-semibold text-white">
                  {(item.product.price * item.quantity).toFixed(2)} zł
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold text-white mb-4">Podsumowanie</h2>

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {item.product.name} x{item.quantity}
                  </span>
                  <span className="text-white">{(item.product.price * item.quantity).toFixed(2)} zł</span>
                </div>
              ))}
            </div>

            <hr className="my-4 border-[#333]" />

            <div className="flex justify-between text-lg font-bold mb-6">
              <span className="text-white">Razem:</span>
              <span className="text-indigo-400">{totalPrice.toFixed(2)} zł</span>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Uwagi do zamówienia (opcjonalnie)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                rows={3}
                placeholder="Np. preferowany termin dostawy..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Złóż zamówienie
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
