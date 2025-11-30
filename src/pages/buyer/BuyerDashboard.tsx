import { useParams } from 'react-router-dom';

export default function BuyerDashboard() {
  const { userId } = useParams<{ userId: string }>();
  
  // Use userId to fetch buyer-specific data
  // Example: const { data } = await supabase.from('favorites').select('*').eq('buyer_id', userId);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Dashboard</h1>
          <p className="text-gray-600 mb-8">Welcome to your buyer dashboard. Browse properties and manage your preferences.</p>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Buyer dashboard content coming soon...</p>
            <p className="text-sm text-gray-400 mt-2">User ID: {userId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

