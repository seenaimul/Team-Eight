import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import SellerSidebar from '../../components/seller/SellerSidebar';
import SellerHeader from '../../components/seller/SellerHeader';
import OfferCard from '../../components/seller/OfferCard';

interface CombinedOfferData {
  offerId: number;
  status: string;
  offerType: string;
  submittedAt: string;
  offerAmount: string | number;
  buyer: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  property: {
    id: number;
    title: string;
    image_url: string;
    location: string;
    city: string;
    price: number;
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
}

export default function OffersReceived() {
  const { userId } = useParams<{ userId: string }>();
  const [offersData, setOffersData] = useState<CombinedOfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Step 1: Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Failed to get authenticated user');
      }

      // Step 2: Verify userId matches
      if (user.id !== userId) {
        throw new Error('Unauthorized');
      }

      // Step 3: Fetch seller's properties
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, image_url, location, city, price')
        .eq('user_id', user.id);

      if (propertiesError) {
        throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
      }

      const sellerProperties = properties || [];

      // Step 4: Fetch offers for seller's properties
      const propertyIds = sellerProperties.map((p: any) => p.id);
      if (propertyIds.length === 0) {
        setOffersData([]);
        setLoading(false);
        return;
      }

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
      const combinedData = await Promise.all(
        (offers as Offer[]).map(async (offer: Offer): Promise<CombinedOfferData | null> => {
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
              property: sellerProperties.find((p: any) => p.id === offer.property_id) || {
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
          const property = sellerProperties.find((p: any) => p.id === offer.property_id);
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
      setOffersData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [userId]);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 lg:ml-0">
          <SellerHeader />
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Offers Received</h1>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading offers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : offersData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No offers received yet.</p>
                <p className="text-gray-400 text-sm mt-2">Offers on your properties will appear here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {offersData.map((offerData) => (
                  <OfferCard
                    key={offerData.offerId}
                    offer={{
                      id: offerData.offerId,
                      offer_type: offerData.offerType,
                      status: offerData.status,
                      submitted_at: offerData.submittedAt,
                      offer_amount: offerData.offerAmount,
                    }}
                    buyer={offerData.buyer}
                    property={offerData.property}
                    onStatusUpdate={() => {
                      // Refresh offers after status update
                      fetchOffers();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
