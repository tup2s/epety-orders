import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../api';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import { ShoppingCart, ArrowLeft, Plus, Minus, Package } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id));
    }
  }, [id]);

  const loadProduct = async (productId: number) => {
    try {
      const response = await getProduct(productId);
      setProduct(response.data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addItem(product, quantity);
      setQuantity(1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Produkt nie znaleziony</h2>
        <Link to="/products" className="btn btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Wróć do produktów
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/products" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
        <ArrowLeft size={18} />
        Wróć do produktów
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {product.images[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={64} className="text-gray-300" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="text-sm text-blue-600 font-medium">{product.category?.name}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          
          <p className="text-3xl font-bold text-blue-600 mt-4">
            {product.price.toFixed(2)} zł
          </p>

          {product.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Opis</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Dostępność</h3>
            {product.stock > 0 ? (
              <p className="text-green-600">
                Dostępne: {product.stock} szt.
              </p>
            ) : (
              <p className="text-red-500">Produkt niedostępny</p>
            )}
          </div>

          {product.stock > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-medium">Ilość:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="btn btn-secondary p-2"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="btn btn-secondary p-2"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                <ShoppingCart size={20} />
                Dodaj do koszyka
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
