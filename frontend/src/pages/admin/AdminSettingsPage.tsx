import { useState, useEffect } from 'react';
import { Key, UserPlus, Shield, Check, AlertCircle, Users } from 'lucide-react';
import * as api from '../../api';

interface Admin {
  id: number;
  login: string;
  name: string;
  createdAt: string;
}

export default function AdminSettingsPage() {
  // Admin list state
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // New admin state
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Nowe hasła nie są identyczne');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Nowe hasło musi mieć minimum 6 znaków');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Hasło zostało zmienione');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setPasswordError(error.response?.data?.error || 'Błąd zmiany hasła');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    if (adminPassword.length < 6) {
      setAdminError('Hasło musi mieć minimum 6 znaków');
      return;
    }

    setIsCreatingAdmin(true);
    try {
      await api.createAdmin({ login: adminLogin, password: adminPassword, name: adminName });
      setAdminSuccess(`Administrator "${adminName}" został utworzony`);
      setAdminLogin('');
      setAdminPassword('');
      setAdminName('');
      loadAdmins();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setAdminError(error.response?.data?.error || 'Błąd tworzenia administratora');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Ustawienia</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Password Change */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Key className="text-indigo-400" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-white">Zmiana hasła</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                <AlertCircle size={18} />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
                <Check size={18} />
                {passwordSuccess}
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

            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn btn-primary w-full"
            >
              {isChangingPassword ? 'Zmieniam...' : 'Zmień hasło'}
            </button>
          </form>
        </div>

        {/* Create Admin */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="text-purple-400" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-white">Dodaj administratora</h2>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            {adminError && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                <AlertCircle size={18} />
                {adminError}
              </div>
            )}
            {adminSuccess && (
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
                <Check size={18} />
                {adminSuccess}
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
                Hasło
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isCreatingAdmin}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              {isCreatingAdmin ? 'Tworzę...' : 'Utwórz administratora'}
            </button>
          </form>
        </div>
      </div>

      {/* Admin List */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Users className="text-indigo-400" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-white">Lista administratorów</h2>
        </div>

        {isLoadingAdmins ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : admins.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Brak administratorów</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#242424]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nazwa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Login</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data utworzenia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-[#2a2a2a]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <span className="text-purple-400 font-medium text-sm">
                            {admin.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-white">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{admin.login}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(admin.createdAt).toLocaleDateString('pl-PL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
