import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import SellerSidebar from '../../components/seller/SellerSidebar';
import SellerHeader from '../../components/seller/SellerHeader';
import OfferStats from '../../components/seller/OfferStats';
import OfferFilters from '../../components/seller/OfferFilters';
import OfferCard from '../../components/seller/OfferCard';

interface Buyer {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface Property {
  id: number;
  title: string;
  image_url: string;
  location: string;
  city: string;
  price: number;
}

interface Offer {
  id: number;
  user_id: string; // buyer_id
  property_id: number;
  offer_type: string;
  status: string;
  submitted_at: string;
  offer_amount?: number | string | null;
}

interface CombinedOfferData {
  offerId: number;
  status: string;
  offerType: string;
  submittedAt: string;
  offerAmount: number | string;
  buyer: Buyer;
  property: Property;
}

export default function OffersReceived() {
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offersData, setOffersData] = useState<CombinedOfferData[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [offerTypeFilter, setOfferTypeFilter] = useState('all');

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

  // Fetch offers data
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get logged-in seller
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('Failed to get authenticated user');
        }

        // Step 2: Get seller properties
        const { data: sellerProperties, error: propertiesError } = await supabase
          .from('properties')
          .select('id, title, image_url, location, city, price')
          .eq('user_id', user.id);

        if (propertiesError) {
          throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
        }

        if (!sellerProperties || sellerProperties.length === 0) {
          setOffersData([]);
          setLoading(false);
          return;
        }

        // Step 3: Extract property IDs
        const propertyIds = sellerProperties.map((p) => p.id);

        // Step 4: Fetch offers for these properties
        const { data: offers, error: offersError } = await supabase
          .from('offers')
          .select('*')
          .in('property_id', propertyIds)
          .order('submitted_at', { ascending: false });

        if (offersError) {
          throw new Error(`Failed to fetch offers: ${offersError.message}`);
        }

        if (!offers || offers.length === 0) {
          setOffersData([]);
          setLoading(false);
          return;
        }

        // Step 5: For each offer, fetch buyer info and combine data
        const combinedData: CombinedOfferData[] = await Promise.all(
          offers.map(async (offer: Offer) => {
            // Fetch buyer info
            const { data: buyer, error: buyerError } = await supabase
              .from('users')
              .select('first_name, last_name, email, phone')
              .eq('id', offer.user_id)
              .single();

            if (buyerError || !buyer) {
              console.error(`Failed to fetch buyer for offer ${offer.id}:`, buyerError);
              // Return a placeholder buyer if fetch fails
              return {
                offerId: offer.id,
                status: offer.status,
                offerType: offer.offer_type,
                submittedAt: offer.submitted_at,
                offerAmount: offer.offer_amount || 0,
                buyer: {
                  first_name: 'Unknown',
                  last_name: 'Buyer',
                  email: 'N/A',
                },
                property: sellerProperties.find((p) => p.id === offer.property_id) || {
                  id: offer.property_id,
                  title: 'Unknown Property',
                  image_url: '',
                  location: '',
                  city: '',
                  price: 0,
                },
              };
            }

            // Find the property for this offer
            const property = sellerProperties.find((p) => p.id === offer.property_id);
            if (!property) {
              console.error(`Property not found for offer ${offer.id}`);
              return null;
            }

            return {
              offerId: offer.id,
              status: offer.status,
              offerType: offer.offer_type,
              submittedAt: offer.submitted_at,
              offerAmount: offer.offer_amount ?? (offer.offer_type?.toLowerCase() === 'rent' ? '£0/month' : 0),
              buyer: {
                first_name: buyer.first_name || '',
                last_name: buyer.last_name || '',
                email: buyer.email || '',
                phone: buyer.phone || undefined,
              },
              property: {
                id: property.id,
                title: property.title,
                image_url: property.image_url || '',
                location: property.location || '',
                city: property.city || '',
                price: property.price || 0,
              },
            };
          })
        );

        // Filter out null values
        const validData = combinedData.filter((item): item is CombinedOfferData => item !== null);
        setOffersData(validData);
      } catch (err: any) {
        console.error('Error fetching offers:', err);
        setError(err.message || 'Failed to load offers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [isAuthorized]);

  // Filter and sort offers
  const filteredAndSortedOffers = offersData
    .filter((offer) => {
      // Search filter (buyer name or property title)
      const searchLower = searchQuery.toLowerCase();
      const buyerName = `${offer.buyer.first_name} ${offer.buyer.last_name}`.toLowerCase();
      const propertyTitle = offer.property.title.toLowerCase();
      const matchesSearch =
        searchQuery === '' || buyerName.includes(searchLower) || propertyTitle.includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || offer.status.toLowerCase() === statusFilter.toLowerCase();

      // Offer type filter
      const matchesOfferType =
        offerTypeFilter === 'all' || offer.offerType.toLowerCase() === offerTypeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesOfferType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'oldest':
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        case 'amount-high':
          const amountA = typeof a.offerAmount === 'number' ? a.offerAmount : 0;
          const amountB = typeof b.offerAmount === 'number' ? b.offerAmount : 0;
          return amountB - amountA;
        case 'amount-low':
          const amountA2 = typeof a.offerAmount === 'number' ? a.offerAmount : 0;
          const amountB2 = typeof b.offerAmount === 'number' ? b.offerAmount : 0;
          return amountA2 - amountB2;
        default:
          return 0;
      }
    });

  // Calculate statistics
  const totalOffers = offersData.length;
  const pendingOffers = offersData.filter((o) => o.status.toLowerCase() === 'pending').length;
  const acceptedOffers = offersData.filter((o) => o.status.toLowerCase() === 'accepted').length;
  const rejectedOffers = offersData.filter((o) => o.status.toLowerCase() === 'rejected').length;

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
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f7f9fc' }}>
      <div className="flex">
        {/* Sidebar */}
        <SellerSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Top Header */}
          <SellerHeader />

          {/* Page Content */}
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Offers Received</h1>
              <p className="text-gray-600">Manage and respond to offers from potential buyers</p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading offers...</p>
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="mb-8">
                  <OfferStats
                    total={totalOffers}
                    pending={pendingOffers}
                    accepted={acceptedOffers}
                    rejected={rejectedOffers}
                  />
                </div>

                {/* Search and Filters */}
                <div className="mb-6">
                  <OfferFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    offerTypeFilter={offerTypeFilter}
                    onOfferTypeFilterChange={setOfferTypeFilter}
                  />
                </div>

                {/* Offers List */}
                {filteredAndSortedOffers.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-gray-500 text-lg">
                      {offersData.length === 0
                        ? 'No offers received yet. Offers will appear here once buyers submit them.'
                        : 'No offers match your current filters.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedOffers.map((offer) => (
                      <OfferCard
                        key={offer.offerId}
                        offer={{
                          id: offer.offerId,
                          offer_type: offer.offerType,
                          status: offer.status,
                          submitted_at: offer.submittedAt,
                          offer_amount: offer.offerAmount,
                        }}
                        buyer={offer.buyer}
                        property={offer.property}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

