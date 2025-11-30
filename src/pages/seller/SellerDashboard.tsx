import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { supabase } from '../../supabase/client';
import SellerSidebar from '../../components/seller/SellerSidebar';
import SellerHeader from '../../components/seller/SellerHeader';
import OverviewCard from '../../components/seller/OverviewCard';
import PropertyCard from '../../components/seller/PropertyCard';
import RecentOfferCard from '../../components/seller/RecentOfferCard';
import WeeklyViewsChart from '../../components/seller/WeeklyViewsChart';
import TopPerformerCard from '../../components/seller/TopPerformerCard';
import {
  overviewMetrics,
  propertyListings,
  recentOffers,
  weeklyViewsData,
  topPerformer,
} from '../../data/mockSellerData';

export default function SellerDashboard() {
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

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
  
  // Use userId to fetch seller-specific data
  // Example: const { data } = await supabase.from('properties').select('*').eq('seller_id', urlUserId);

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
              
              <div className="space-y-3">
                {propertyListings.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
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

