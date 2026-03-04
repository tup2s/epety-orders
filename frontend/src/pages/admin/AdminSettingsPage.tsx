import { useState } from 'react';
import { Key, UserPlus, Shield, Check, AlertCircle } from 'lucide-react';
import * as api from '../../api';

export default function AdminSettingsPage() {
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
    </div>
  );
}
