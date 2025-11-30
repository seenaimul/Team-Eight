import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'seller' | 'buyer' | 'agent' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams<{ userId: string }>();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Step 1: Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log("ProtectedRoute: User not authenticated, redirecting to signin");
          navigate('/signin');
          return;
        }

        const authenticatedUserId = user.id;

        // Step 2: Validate userId from route params matches authenticated user
        if (routeUserId && routeUserId !== authenticatedUserId) {
          console.log("ProtectedRoute: Route userId mismatch. Route:", routeUserId, "Authenticated:", authenticatedUserId);
          // Redirect to correct dashboard with authenticated user's ID
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', authenticatedUserId)
            .single();

          if (profile) {
            if (profile.role === 'seller') {
              navigate(`/seller/dashboard/${authenticatedUserId}`);
            } else if (profile.role === 'buyer') {
              navigate(`/buyer/dashboard/${authenticatedUserId}`);
            } else if (profile.role === 'agent') {
              navigate(`/agent/dashboard/${authenticatedUserId}`);
            } else if (profile.role === 'admin') {
              navigate(`/admin/${authenticatedUserId}`);
            }
          }
          return;
        }

        // Step 3: Fetch user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authenticatedUserId)
          .single();

        if (profileError || !profile) {
          console.error("ProtectedRoute: Failed to fetch user profile", profileError);
          navigate('/signin');
          return;
        }

        console.log("ProtectedRoute: User role:", profile.role, "Required role:", requiredRole);

        // Step 4: Check if role matches required role (admin can access all)
        if (profile.role !== requiredRole && profile.role !== 'admin') {
          // Redirect to correct dashboard based on actual role
          console.log("ProtectedRoute: Role mismatch, redirecting to correct dashboard");
          if (profile.role === 'seller') {
            navigate(`/seller/dashboard/${authenticatedUserId}`);
          } else if (profile.role === 'buyer') {
            navigate(`/buyer/dashboard/${authenticatedUserId}`);
          } else if (profile.role === 'agent') {
            navigate(`/agent/dashboard/${authenticatedUserId}`);
          } else {
            // Unknown role, redirect to home
            navigate('/');
          }
          return;
        }

        // Role matches (or user is admin), allow access
        setAuthorized(true);
      } catch (err) {
        console.error("ProtectedRoute: Error checking auth", err);
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [navigate, requiredRole, routeUserId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}

