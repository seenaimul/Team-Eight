import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { supabase } from '../../supabase/client';

export default function SellerHeader() {
  const [firstName, setFirstName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error('SellerHeader: Failed to get authenticated user', authError);
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.error('SellerHeader: Failed to fetch user profile', profileError);
          setLoading(false);
          return;
        }

        setFirstName(profile.first_name || '');
      } catch (err) {
        console.error('SellerHeader: Error fetching user data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 w-full px-6 py-4 shadow-sm">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <span className="text-sm font-medium text-gray-900">
                {firstName || 'User'}
              </span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

