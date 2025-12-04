import { AlertTriangle } from 'lucide-react';

export default function DangerZone() {
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion is not yet implemented.');
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 border border-pink-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Danger Zone</h2>
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
        <p className="text-red-700 text-sm font-medium">
          Warning: Deleting your account is irreversible. All property listings and offer data will be permanently removed.
        </p>
      </div>

      <button
        onClick={handleDeleteAccount}
        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium text-sm"
      >
        <AlertTriangle className="w-4 h-4" />
        Delete My Account
      </button>
    </div>
  );
}

