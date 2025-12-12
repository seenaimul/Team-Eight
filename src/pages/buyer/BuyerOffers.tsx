import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import BuyerSidebar from "../../components/buyer/BuyerSidebar";
import BuyerHeader from "../../components/buyer/BuyerHeader";
import OfferListItem from "../../components/buyer/OfferListItem";

interface Offer {
  id: number;
  user_id: string;
  property_id: number;
  offer_type: string;
  offer_amount: number | string;
  status: "pending" | "accepted" | "rejected";
  submitted_at: string;
  properties?: {
    id: number;
    title: string;
    location: string;
    city: string;
    image_url?: string;
  };
}

type BuyerOffer = {
  id: number;
  user_id: string;
  property_id: number;
  offer_amount: number;
  offer_type: string;
  status: string;
  submitted_at: string;
  properties: {
    id: number;
    title: string;
    location: string;
    image_url: string;
  };
};

export default function BuyerOffers() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [offers, setOffers] = useState<BuyerOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Validate user access
  useEffect(() => {
    const validate = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate("/signin");
        return;
      }

      if (session.user.id !== userId) {
        navigate("/unauthorized");
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    };

    validate();
  }, [userId, navigate]);

  // Fetch offers
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchOffers = async () => {
      setLoading(true);

      // Get current user from session instead of URL param
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;

      if (!currentUserId) {
        setOffers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("offers")
        .select(`
          id,
          user_id,
          property_id,
          offer_amount,
          offer_type,
          status,
          submitted_at,
          properties (
            id,
            title,
            location,
            image_url
          )
        `)
        .eq("user_id", currentUserId)
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
        setOffers([]);
      } else {
        setOffers(data || []);
      }

      setLoading(false);
    };

    fetchOffers();
  }, [isAuthorized]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 rounded-full border-blue-600"></div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Unauthorized</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">

        {/* Sidebar */}
        <BuyerSidebar />

        <main className="flex-1">
          {/* Top Header */}
          <BuyerHeader />

          <div className="px-8 py-6">

            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Offers</h1>
              <p className="text-gray-600">
                Review, track, and manage all your property offers in one place.
              </p>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your offers...</p>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">You haven’t made any offers yet.</p>
                <button
                  onClick={() => navigate(`/buyer/${userId}/search`)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Start Searching
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <OfferListItem key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
