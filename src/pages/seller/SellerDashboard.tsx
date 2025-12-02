import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { formatDistanceToNow } from 'date-fns';
import SellerSidebar from '../../components/seller/SellerSidebar';
import SellerHeader from '../../components/seller/SellerHeader';
import OverviewCard from '../../components/seller/OverviewCard';
import PropertyCard from '../../components/seller/PropertyCard';
import RecentOfferCard from '../../components/seller/RecentOfferCard';
import WeeklyViewsChart from '../../components/seller/WeeklyViewsChart';
import TopPerformerCard from '../../components/seller/TopPerformerCard';
import type { PropertyListing, OverviewMetric } from '../../data/mockSellerData';
import {
  recentOffers,
  weeklyViewsData,
  topPerformer,
} from '../../data/mockSellerData';

export default function SellerDashboard() {
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [propertyListings, setPropertyListings] = useState<PropertyListing[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetric[]>([
    { id: '1', label: 'Total Properties Listed', value: 0, icon: 'home' },
    { id: '2', label: 'Active Listings', value: 0, icon: 'trending-up' },
    { id: '3', label: 'Offers Received', value: 0, icon: 'file-text' },
    { id: '4', label: 'Average Property Views', value: 0, icon: 'eye' },
  ]);

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
        // User trying to access another user's data - unauthorized
        navigate('/unauthorized');
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    };

    validateUser();
  }, [urlUserId, navigate]);

  // Fetch properties for the logged-in user
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        
        // Get logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoadingProperties(false);
          return;
        }

        // Fetch properties filtered by user_id
        const { data: properties, error: propertiesError } = await supabase
          .from("properties")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (propertiesError) {
          console.error('Error fetching properties:', propertiesError);
          setPropertyListings([]);
          setOverviewMetrics([
            { id: '1', label: 'Total Properties Listed', value: 0, icon: 'home' },
            { id: '2', label: 'Active Listings', value: 0, icon: 'trending-up' },
            { id: '3', label: 'Offers Received', value: 0, icon: 'file-text' },
            { id: '4', label: 'Average Property Views', value: 0, icon: 'eye' },
          ]);
        } else if (properties) {
          // Fetch offers for all seller's properties
          const propertyIds = properties.map((p: any) => p.id);
          let offersCountMap: Record<number, number> = {};
          let offersReceived = 0;
          
          if (propertyIds.length > 0) {
            const { data: offersData, error: offersError } = await supabase
              .from('offers')
              .select('property_id')
              .in('property_id', propertyIds);

            if (!offersError && offersData) {
              offersReceived = offersData.length;
              offersData.forEach((offer: any) => {
                const propId = offer.property_id;
                offersCountMap[propId] = (offersCountMap[propId] || 0) + 1;
              });
            }
          }

          // Compute dashboard statistics
          const totalProperties = properties.length;
          const activeListings = properties.filter((p: any) => {
            const status = (p.status || 'active').toLowerCase();
            return status === 'active';
          }).length;
          
          const avgViews = properties.length > 0
            ? Math.round(properties.reduce((sum: number, p: any) => sum + (p.views || 0), 0) / properties.length)
            : 0;

          // Update overview metrics with computed values
          setOverviewMetrics([
            { id: '1', label: 'Total Properties Listed', value: totalProperties, icon: 'home' },
            { id: '2', label: 'Active Listings', value: activeListings, icon: 'trending-up' },
            { id: '3', label: 'Offers Received', value: offersReceived, icon: 'file-text' },
            { id: '4', label: 'Average Property Views', value: avgViews, icon: 'eye' },
          ]);

          // Transform properties to match PropertyListing interface
          const transformedProperties: PropertyListing[] = properties.map((prop: any) => {
            const address = prop.location 
              ? `${prop.location}${prop.city ? `, ${prop.city}` : ''}`
              : prop.city || '';
            
            const status = (prop.status || 'Active').charAt(0).toUpperCase() + (prop.status || 'Active').slice(1).toLowerCase();
            const validStatus = status === 'Active' || status === 'Pending' || status === 'Sold' 
              ? status as 'Active' | 'Pending' | 'Sold'
              : 'Active';

            return {
              id: String(prop.id),
              title: prop.title || 'Untitled Property',
              address: address,
              image: prop.image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
              status: validStatus,
              views: prop.views || 0,
              offers: offersCountMap[prop.id] || 0,
              lastUpdated: prop.created_at 
                ? formatDistanceToNow(new Date(prop.created_at), { addSuffix: true })
                : 'Recently',
            };
          });

          setPropertyListings(transformedProperties);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setPropertyListings([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <SellerSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Top Header */}
          <SellerHeader />

          {/* Dashboard Content */}
          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Seller Dashboard</h2>
              <p className="text-gray-600 mt-1">Manage your property listings and track performance.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewMetrics.map((metric) => (
                <OverviewCard key={metric.id} metric={metric} />
              ))}
            </div>

            {/* Add New Property CTA & Performance Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <button
                onClick={() => urlUserId && navigate(`/seller/${urlUserId}/add`)}
                className="lg:col-span-2 bg-blue-600 rounded-xl shadow-lg p-6 text-white hover:bg-blue-700 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Add New Property</h3>
                    <p className="text-blue-100 text-sm">
                      List a new property and reach thousands of potential buyers instantly.
                    </p>
                  </div>
                </div>
              </button>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Performance Tips</h3>
                    <p className="text-sm text-gray-600">Boost your listing visibility.</p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                  Learn More
                </button>
              </div>
            </div>

            {/* My Properties Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Properties</h3>
                <p className="text-sm text-gray-600 mt-1">Manage and track your property listings.</p>
              </div>
              
              {/* Table Header - Hidden on mobile, shown on larger screens */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <div className="col-span-4">PROPERTY</div>
                <div className="col-span-1 text-center">STATUS</div>
                <div className="col-span-1 text-center">VIEWS</div>
                <div className="col-span-1 text-center">OFFERS</div>
                <div className="col-span-2 text-center">LAST UPDATED</div>
                <div className="col-span-3 text-right">ACTIONS</div>
              </div>
              
              {loadingProperties ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading properties...</p>
                </div>
              ) : propertyListings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No properties found. Add your first property to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {propertyListings.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Offers & Weekly Views */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Offers */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Offers</h3>
                  <p className="text-sm text-gray-600 mt-1">Latest offers from potential buyers</p>
                </div>
                <div className="space-y-3">
                  {recentOffers.map((offer) => (
                    <RecentOfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
                <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View All Offers
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Weekly Views Chart */}
              <WeeklyViewsChart data={weeklyViewsData} />
            </div>

            {/* Top Performer */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <TopPerformerCard performer={topPerformer} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

