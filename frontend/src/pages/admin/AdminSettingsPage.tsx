import { useState, useEffect } from 'react';
import { Key, UserPlus, Shield, Users, Edit, Trash2, X, Save, AlertCircle } from 'lucide-react';
import * as api from '../../api';
import { useAuth } from '../../context/AuthContext';

interface Admin {
  id: number;
  login: string;
  name: string;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Admin form
  const [adminName, setAdminName] = useState('');
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const response = await api.getAdmins();
      setAdmins(response.data);
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  // Password Modal
  const openPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Nowe hasła nie są identyczne');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Nowe hasło musi mieć minimum 6 znaków');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      closePasswordModal();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setPasswordError(error.response?.data?.error || 'Błąd zmiany hasła');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Admin Modal
  const openAdminModal = (admin?: Admin) => {
    if (admin) {
      setEditingAdmin(admin);
      setAdminName(admin.name);
      setAdminLogin(admin.login);
      setAdminPassword('');
    } else {
      setEditingAdmin(null);
      setAdminName('');
      setAdminLogin('');
      setAdminPassword('');
    }
    setAdminError('');
    setShowAdminModal(true);
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setEditingAdmin(null);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!editingAdmin && adminPassword.length < 6) {
      setAdminError('Hasło musi mieć minimum 6 znaków');
      return;
    }

    if (editingAdmin && adminPassword && adminPassword.length < 6) {
      setAdminError('Hasło musi mieć minimum 6 znaków');
      return;
    }

    setIsSubmittingAdmin(true);
    try {
      if (editingAdmin) {
        const data: { name?: string; login?: string; password?: string } = {
          name: adminName,
          login: adminLogin,
        };
        if (adminPassword) {
          data.password = adminPassword;
        }
        await api.updateAdmin(editingAdmin.id, data);
      } else {
        await api.createAdmin({ login: adminLogin, password: adminPassword, name: adminName });
      }
      closeAdminModal();
      loadAdmins();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setAdminError(error.response?.data?.error || 'Wystąpił błąd');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    if (admin.id === user?.id) {
      alert('Nie możesz usunąć samego siebie');
      return;
    }

    if (!confirm(`Czy na pewno chcesz usunąć administratora "${admin.name}"?`)) {
      return;
    }

    try {
      await api.deleteAdmin(admin.id);
      loadAdmins();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Błąd usuwania administratora');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Ustawienia</h1>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={openPasswordModal}
          className="card hover:border-indigo-500/50 transition-colors group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
              <Key className="text-indigo-400" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Zmień hasło</h3>
              <p className="text-sm text-gray-400">Zaktualizuj swoje hasło</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => openAdminModal()}
          className="card hover:border-purple-500/50 transition-colors group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
              <UserPlus className="text-purple-400" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Dodaj admina</h3>
              <p className="text-sm text-gray-400">Utwórz nowe konto</p>
            </div>
          </div>
        </button>

        <div className="card sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Shield className="text-green-400" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{admins.length}</h3>
              <p className="text-sm text-gray-400">Administratorów</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Users className="text-indigo-400" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-white">Administratorzy</h2>
          </div>
        </div>

        {isLoadingAdmins ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : admins.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Brak administratorów</p>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 bg-[#242424] rounded-xl hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-400 font-semibold text-lg">
                      {admin.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{admin.name}</h3>
                      {admin.id === user?.id && (
                        <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                          Ty
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">@{admin.login}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {new Date(admin.createdAt).toLocaleDateString('pl-PL')}
                  </span>
                  <button
                    onClick={() => openAdminModal(admin)}
                    className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                    title="Edytuj"
                  >
                    <Edit size={18} />
                  </button>
                  {admin.id !== user?.id && (
                    <button
                      onClick={() => handleDeleteAdmin(admin)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Usuń"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-xl max-w-md w-full border border-[#333]">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Key className="text-indigo-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Zmiana hasła</h2>
              </div>
              <button onClick={closePasswordModal} className="p-2 hover:bg-[#2a2a2a] rounded-lg text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passwordError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                  <AlertCircle size={18} />
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Obecne hasło
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nowe hasło
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  placeholder="Minimum 6 znaków"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Potwierdź nowe hasło
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closePasswordModal} className="btn btn-secondary">
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {isSubmittingPassword ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      Zmień hasło
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-xl max-w-md w-full border border-[#333]">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  {editingAdmin ? <Edit className="text-purple-400" size={20} /> : <UserPlus className="text-purple-400" size={20} />}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editingAdmin ? 'Edytuj administratora' : 'Nowy administrator'}
                </h2>
              </div>
              <button onClick={closeAdminModal} className="p-2 hover:bg-[#2a2a2a] rounded-lg text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
              {adminError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                  <AlertCircle size={18} />
                  {adminError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nazwa
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="input"
                  placeholder="np. Jan Kowalski"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Login
                </label>
                <input
                  type="text"
                  value={adminLogin}
                  onChange={(e) => setAdminLogin(e.target.value)}
                  className="input"
                  placeholder="np. jan.kowalski"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {editingAdmin ? 'Nowe hasło (opcjonalne)' : 'Hasło'}
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input"
                  placeholder={editingAdmin ? 'Pozostaw puste aby nie zmieniać' : 'Minimum 6 znaków'}
                  required={!editingAdmin}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeAdminModal} className="btn btn-secondary">
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdmin}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {isSubmittingAdmin ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingAdmin ? 'Zapisz zmiany' : 'Utwórz'}
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
