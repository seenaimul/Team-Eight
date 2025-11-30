import { useParams } from 'react-router-dom';

export default function AgentDashboard() {
  const { userId } = useParams<{ userId: string }>();
  
  // Use userId to fetch agent-specific data
  // Example: const { data } = await supabase.from('clients').select('*').eq('agent_id', userId);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Dashboard</h1>
          <p className="text-gray-600 mb-8">Welcome to your agent dashboard. Manage your clients and listings.</p>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Agent dashboard content coming soon...</p>
            <p className="text-sm text-gray-400 mt-2">User ID: {userId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

