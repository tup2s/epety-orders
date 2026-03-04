import { useState, useEffect } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  resetCustomerPassword,
  deleteCustomer,
} from '../../api';
import type { Customer } from '../../types';
import { Plus, Edit, Trash2, Users, X, Save, Key } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    login: '',
    name: '',
    password: '',
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        login: customer.login,
        name: customer.name,
        password: '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        login: '',
        name: '',
        password: '',
      });
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const openPasswordModal = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setNewPassword('');
    setError('');
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedCustomerId(null);
    setNewPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, {
          login: formData.login,
          name: formData.name,
        });
      } else {
        if (!formData.password) {
          setError('Hasło jest wymagane');
          setIsSubmitting(false);
          return;
        }
        await createCustomer({
          login: formData.login,
          name: formData.name,
          password: formData.password,
        });
      }

      closeModal();
      loadCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Wystąpił błąd');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !newPassword) return;

    setIsSubmitting(true);
    setError('');

    try {
      await resetCustomerPassword(selectedCustomerId, newPassword);
      closePasswordModal();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Wystąpił błąd');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Czy na pewno chcesz usunąć klienta "${customer.name}"?`)) return;

    try {
      await deleteCustomer(customer.id);
      loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Klienci</h1>
          <p className="text-gray-400 mt-1">Zarządzaj kontami klientów</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Dodaj klienta
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Brak klientów</h2>
          <p className="text-gray-400">Dodaj pierwszego klienta</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] rounded-xl shadow-md overflow-hidden border border-[#333]">
          <table className="w-full">
            <thead className="bg-[#242424]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Klient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Data utworzenia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Zamówienia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-[#2a2a2a]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                        <span className="text-indigo-400 font-medium">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-white">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{customer.login}</td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(customer.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className="badge bg-blue-100 text-blue-800">
                      {customer._count?.orders || 0} zamówień
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openPasswordModal(customer.id)}
                        className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg"
                        title="Reset hasła"
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => openModal(customer)}
                        className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg"
                        title="Edytuj"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        title="Usuń"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-xl max-w-md w-full border border-[#333]">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <h2 className="text-xl font-bold text-white">
                {editingCustomer ? 'Edytuj klienta' : 'Nowy klient'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-[#2a2a2a] rounded-lg text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Imię / Nazwa *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="np. Jan Kowalski"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Login *
                </label>
                <input
                  type="text"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  className="input"
                  placeholder="np. jan"
                  required
                />
              </div>

              {!editingCustomer && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Hasło *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    placeholder="Hasło dla klienta"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingCustomer ? 'Zapisz zmiany' : 'Dodaj klienta'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-xl max-w-md w-full border border-[#333]">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <h2 className="text-xl font-bold text-white">Reset hasła</h2>
              <button onClick={closePasswordModal} className="p-2 hover:bg-[#2a2a2a] rounded-lg text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nowe hasło *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  placeholder="Wprowadź nowe hasło"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closePasswordModal} className="btn btn-secondary">
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Key size={18} />
                      Ustaw nowe hasło
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
