import React, { useState } from 'react';
import { X, Lock, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, displayName, changePassword } = useAuth();
  const { addNotification } = useNotification();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      addNotification('success', 'Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('For security, please logout and login again before changing your password.');
      } else {
        setError('Failed to update password. ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">My Profile</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold border-2 border-orange-200">
               {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{displayName}</h3>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Active Team Member</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                   <Lock size={16} className="text-slate-400"/> Change Password
                </h4>
                
                {error && (
                    <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100 flex items-center gap-2">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password (min 6 chars)"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                </div>
             </div>

             <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || !newPassword}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? 'Updating...' : <><Save size={16} /> Update Password</>}
                </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
