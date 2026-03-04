import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api';
import { useCart } from '../context/CartContext';
import type { Product, Category } from '../types';
import { ShoppingCart, Search, Package, Plus, Minus, X } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      setSelectedProduct(product);
      setQuantity(1);
    }
  };

  const confirmAddToCart = () => {
    if (selectedProduct) {
      addItem(selectedProduct, quantity);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setQuantity(1);
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
        <h1 className="text-3xl font-bold text-white">Produkty</h1>
        <p className="text-gray-400 mt-1">Przeglądaj naszą ofertę</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Szukaj produktów..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`btn ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
          >
            Wszystkie
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Nie znaleziono produktów</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow">
              <Link to={`/products/${product.id}`}>
                <div className="aspect-square mb-4 bg-[#2a2a2a] rounded-lg overflow-hidden">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={48} className="text-gray-600" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-1">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{product.category?.name}</p>
              </Link>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xl font-bold text-indigo-400">
                  {product.price.toFixed(2)} zł
                </span>
                {product.stock > 0 ? (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    Dodaj
                  </button>
                ) : (
                  <span className="text-red-500 text-sm font-medium">Brak w magazynie</span>
                )}
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-sm text-orange-500 mt-2">Ostatnie {product.stock} szt.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quantity Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">Dodaj do koszyka</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-24 h-24 bg-[#2a2a2a] rounded-lg overflow-hidden flex-shrink-0">
                {selectedProduct.images[0] ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={32} className="text-gray-600" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">{selectedProduct.name}</h3>
                <p className="text-indigo-400 font-bold">{selectedProduct.price.toFixed(2)} zł</p>
                <p className="text-sm text-gray-400">Dostępne: {selectedProduct.stock} szt.</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Ilość</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn btn-secondary p-2"
                  disabled={quantity <= 1}
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(1, val), selectedProduct.stock));
                  }}
                  className="input w-20 text-center"
                  min="1"
                  max={selectedProduct.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  className="btn btn-secondary p-2"
                  disabled={quantity >= selectedProduct.stock}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4 p-3 bg-[#2a2a2a] rounded-lg">
              <span className="text-gray-300">Suma:</span>
              <span className="text-xl font-bold text-indigo-400">
                {(selectedProduct.price * quantity).toFixed(2)} zł
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={closeModal} className="btn btn-secondary flex-1">
                Anuluj
              </button>
              <button onClick={confirmAddToCart} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                <ShoppingCart size={18} />
                Dodaj do koszyka
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
