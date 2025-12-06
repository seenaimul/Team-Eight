import { Home, Building2, PlusCircle, FileText, BarChart3, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathTemplate: string; // Template with :userId placeholder
  isLogout?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Home Dashboard', icon: Home, pathTemplate: '/seller/:userId/dashboard' },
  { id: 'properties', label: 'My Properties', icon: Building2, pathTemplate: '/seller/:userId/properties' },
  { id: 'add', label: 'Add New Property', icon: PlusCircle, pathTemplate: '/seller/:userId/add' },
  { id: 'offers', label: 'Offers Received', icon: FileText, pathTemplate: '/seller/:userId/offers' },
  { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3, pathTemplate: '/seller/:userId/analytics' },
  { id: 'settings', label: 'Profile Settings', icon: Settings, pathTemplate: '/seller/:userId/settings' },
];

export default function SellerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams<{ userId: string }>();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID from session as fallback
  useEffect(() => {
    if (!userId) {
      const getCurrentUserId = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
        }
      };
      getCurrentUserId();
    }
  }, [userId]);

  // Use userId from URL params (preferred), fallback to currentUserId from session
  const activeUserId = userId || currentUserId;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getPath = (pathTemplate: string) => {
    if (!activeUserId) return '#';
    return pathTemplate.replace(':userId', activeUserId);
  };

  const isActive = (pathTemplate: string) => {
    if (!activeUserId) return false;
    const fullPath = pathTemplate.replace(':userId', activeUserId);
    return location.pathname === fullPath;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">FindThatHome</h1>
                <p className="text-xs text-gray-500">Agent / Landlord Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 py-6 flex flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.pathTemplate);
              const path = getPath(item.pathTemplate);
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (activeUserId) {
                      navigate(path);
                      setIsMobileOpen(false);
                    }
                  }}
                  disabled={!activeUserId}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${!activeUserId ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-600'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button - Directly below menu items */}
          <div className="px-4 py-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </aside>
    </>
  );
}

