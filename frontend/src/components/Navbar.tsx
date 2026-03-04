import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart,
  Package,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  History,
  Grid,
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  const customerLinks = (
    <>
      <Link to="/products" className={navLinkClass('/products')}>
        <Grid size={20} />
        <span>Produkty</span>
      </Link>
      <Link to="/orders" className={navLinkClass('/orders')}>
        <History size={20} />
        <span>Zamówienia</span>
      </Link>
      <Link to="/cart" className={navLinkClass('/cart')}>
        <ShoppingCart size={20} />
        <span>Koszyk</span>
        {totalItems > 0 && (
          <span className="ml-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {totalItems}
          </span>
        )}
      </Link>
    </>
  );

  const adminLinks = (
    <>
      <Link to="/admin" className={navLinkClass('/admin')}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </Link>
      <Link to="/admin/orders" className={navLinkClass('/admin/orders')}>
        <Package size={20} />
        <span>Zamówienia</span>
      </Link>
      <Link to="/admin/products" className={navLinkClass('/admin/products')}>
        <Grid size={20} />
        <span>Produkty</span>
      </Link>
      <Link to="/admin/customers" className={navLinkClass('/admin/customers')}>
        <Users size={20} />
        <span>Klienci</span>
      </Link>
    </>
  );

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={isAdmin ? '/admin' : '/products'} className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <img src="/logo.svg" alt="E-Pety" className="w-8 h-8" />
            E-Pety
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin ? adminLinks : customerLinks}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.name} ({user?.role === 'ADMIN' ? 'Admin' : 'Klient'})
            </span>
            <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2">
              <LogOut size={18} />
              Wyloguj
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {isAdmin ? adminLinks : customerLinks}
              <hr className="my-2" />
              <div className="px-3 py-2 text-sm text-gray-600">
                {user?.name} ({user?.role === 'ADMIN' ? 'Admin' : 'Klient'})
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={20} />
                Wyloguj
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
