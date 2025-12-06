import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import BuyerSidebar from '../../components/buyer/BuyerSidebar';
import BuyerHeader from '../../components/buyer/BuyerHeader';
import SummaryCard from '../../components/buyer/SummaryCard';
import SearchSection from '../../components/buyer/SearchSection';
import SavedPropertyCard from '../../components/buyer/SavedPropertyCard';
import OfferListItem from '../../components/buyer/OfferListItem';
import AlertListItem from '../../components/buyer/AlertListItem';
import { Heart, FileText, CheckCircle, Bell } from 'lucide-react';

interface SavedProperty {
  id: number;
  property_id: number;
  user_id: string;
  created_at: string;
  properties: {
    id: number;
    title: string;
    location: string;
    city: string;
    price: number;
    image_url?: string;
    bedrooms?: number;
    bathrooms?: number;
    size?: number;
    updated_at?: string;
    created_at?: string;
  };
}

interface Offer {
  id: number;
  user_id: string;
  property_id: number;
  offer_type: string;
  offer_amount: number | string;
  status: 'pending' | 'accepted' | 'rejected';
  submitted_at: string;
  properties?: {
    id: number;
    title: string;
    location: string;
    city: string;
    image_url?: string;
  };
}

interface Alert {
  id: number;
  user_id: string;
  alert_type: 'price_drop' | 'new_match' | 'offer_update' | 'market_insight';
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function BuyerDashboard() {
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Validate userId from URL matches current session user
  useEffect(() => {
    const validateUser = async () => {
      if (!urlUserId) {
        setIsAuthorized(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/signin');
        return;
      }

      if (session.user.id !== urlUserId) {
        navigate('/unauthorized');
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    };

    validateUser();
  }, [urlUserId, navigate]);

  // Fetch all dashboard data
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch saved properties with property details
        const { data: saved, error: savedError } = await supabase
          .from('saved_properties')
          .select('id, property_id, user_id, created_at, properties(*)')
          .eq('user_id', user.id);

        if (savedError) {
          console.error('Error fetching saved properties:', savedError);
        } else if (saved) {
          // Transform Supabase data to match SavedProperty interface
          const transformedSaved: SavedProperty[] = saved.map((item: any) => {
            // Handle properties - could be array or single object from Supabase join
            const propertyData = Array.isArray(item.properties) 
              ? item.properties[0] 
              : item.properties;
            
            return {
              id: item.id,
              property_id: item.property_id,
              user_id: item.user_id,
              created_at: item.created_at,
              properties: propertyData || {
                id: item.property_id,
                title: '',
                location: '',
                city: '',
                price: 0,
              },
            };
          });
          setSavedProperties(transformedSaved);
        }

        // Fetch offers with property details
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*, properties(*)')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false });

        if (offersError) {
          console.error('Error fetching offers:', offersError);
        } else if (offersData) {
          setOffers(offersData as Offer[]);
        }

        // Fetch alerts
        const { data: alertsData, error: alertsError } = await supabase
          .from('alerts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (alertsError) {
          console.error('Error fetching alerts:', alertsError);
        } else if (alertsData) {
          setAlerts(alertsData as Alert[]);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthorized]);

  // Show loading while validating authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const savedCount = savedProperties.length;
  const offersSubmitted = offers.length;
  const offersAccepted = offers.filter(o => o.status === 'accepted').length;
  const newAlerts = alerts.filter(a => !a.is_read).length;

  // Get recent saved properties (first 4)
  const recentSavedProperties = savedProperties.slice(0, 4);

  // Get recent offers (first 3)
  const recentOffers = offers.slice(0, 3);

  // Get recent alerts (first 4)
  const recentAlerts = alerts.slice(0, 4);

  // Check for new price or updated badges
  const getPropertyBadge = (savedProperty: SavedProperty) => {
    const property = savedProperty.properties;
    if (!property) return null;

    // Check if property was recently updated (within last 7 days)
    if (property.updated_at) {
      const updatedDate = new Date(property.updated_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (updatedDate > sevenDaysAgo) {
        // Check if it's very recent (within 1 day) for "New Price"
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        if (updatedDate > oneDayAgo) {
          return { show: true, text: 'New Price' };
        }
        return { show: true, text: 'Updated' };
      }
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <BuyerSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Top Header */}
          <BuyerHeader />

          {/* Dashboard Content */}
          <div className="px-8 py-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer / Renter Dashboard</h1>
              <p className="text-gray-600">Manage your saved homes, offers, alerts, and preferences.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SummaryCard icon={Heart} value={savedCount} label="Saved Properties" />
              <SummaryCard icon={FileText} value={offersSubmitted} label="Offers Submitted" />
              <SummaryCard icon={CheckCircle} value={offersAccepted} label="Offers Accepted" />
              <SummaryCard icon={Bell} value={newAlerts} label="New Alerts" />
            </div>

            {/* Search Section */}
            <div className="mb-12">
              <SearchSection />
            </div>

            {/* Saved Properties Section */}
            {loading ? (
              <div className="mb-12 text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading properties...</p>
              </div>
            ) : savedProperties.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Saved Properties</h2>
                    <p className="text-gray-600">Properties you've saved for later.</p>
                  </div>
                  <button
                    onClick={() => urlUserId && navigate(`/buyer/${urlUserId}/saved`)}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    View All <span>→</span>
                  </button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {recentSavedProperties.map((savedProperty) => {
                    const badge = getPropertyBadge(savedProperty);
                    return (
                      <SavedPropertyCard
                        key={savedProperty.id}
                        property={savedProperty.properties}
                        savedId={savedProperty.id}
                        showBadge={badge?.show || false}
                        badgeText={badge?.text}
                        onRemove={() => {
                          setSavedProperties(prev => prev.filter(sp => sp.id !== savedProperty.id));
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Offers and Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Your Offers Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Your Offers</h2>
                  <p className="text-sm text-gray-600">Track the status of your submitted offers</p>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading offers...</p>
                  </div>
                ) : recentOffers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No offers submitted yet.</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-4">
                      {recentOffers.map((offer) => (
                        <OfferListItem key={offer.id} offer={offer} />
                      ))}
                    </div>
                    {offers.length > 3 && (
                      <button
                        onClick={() => urlUserId && navigate(`/buyer/${urlUserId}/offers`)}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
                      >
                        View All Offers <span>→</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Alerts & Notifications Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Alerts & Notifications</h2>
                  <p className="text-sm text-gray-600">Stay updated with property alerts and insights</p>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading alerts...</p>
                  </div>
                ) : recentAlerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No alerts yet.</p>
                ) : (
                  <>
                    <div className="space-y-0">
                      {recentAlerts.map((alert) => (
                        <AlertListItem key={alert.id} alert={alert} />
                      ))}
                    </div>
                    {alerts.length > 4 && (
                      <button
                        onClick={() => urlUserId && navigate(`/buyer/${urlUserId}/alerts`)}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm mt-4"
                      >
                        View All Alerts <span>→</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
