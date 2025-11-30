import { useParams } from 'react-router-dom';

export default function AdminDashboard() {
  const { userId } = useParams<{ userId: string }>();
  
  // Use userId for admin operations
  // Admin can access all data, but userId can be used for audit logs, etc.
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">Welcome to the admin dashboard. Manage users, properties, and system settings.</p>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Admin dashboard content coming soon...</p>
            <p className="text-sm text-gray-400 mt-2">Admin User ID: {userId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

