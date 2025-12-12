import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import BuyerSidebar from "../../components/buyer/BuyerSidebar";
import BuyerHeader from "../../components/buyer/BuyerHeader";
import SavedPropertyCard from "../../components/buyer/SavedPropertyCard";

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
  };
}

export default function SavedProperties() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Validate user and get current user ID
  useEffect(() => {
    const validateUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate("/signin");
        return;
      }

      const sessionUserId = session.user.id;
      setCurrentUserId(sessionUserId);

      // If userId param exists, validate it matches session user
      if (userId && sessionUserId !== userId) {
        navigate("/unauthorized");
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    };

    validateUser();
  }, [userId, navigate]);

  // Fetch saved properties
  useEffect(() => {
    if (!isAuthorized || !currentUserId) return;

    const fetchSaved = async () => {
      setLoading(true);

      // Use currentUserId from session instead of URL param
      const { data, error } = await supabase
        .from("saved_properties")
        .select(`
          id,
          property_id,
          user_id,
          created_at,
          properties (*)
        `)
        .eq("user_id", currentUserId);

      if (error) {
        console.error("Error fetching saved properties:", error);
        setSavedProperties([]);
      } else {
        const parsed = data.map((item: any) => ({
          ...item,
          properties: Array.isArray(item.properties)
            ? item.properties[0]
            : item.properties,
        }));

        setSavedProperties(parsed);
      }

      setLoading(false);
    };

    fetchSaved();
  }, [isAuthorized, currentUserId]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Saved Homes
              </h1>
              <p className="text-gray-600">
                All the properties you've saved for later.
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading saved homes...</p>
              </div>
            ) : savedProperties.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">You have no saved homes yet.</p>
                <button
                  onClick={() => navigate(currentUserId ? `/buyer/${currentUserId}/search` : '/search')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Searching
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map((saved) => (
                  <SavedPropertyCard
                    key={saved.id}
                    property={saved.properties}
                    savedId={saved.id}
                    showBadge={false}
                    onRemove={() =>
                      setSavedProperties((prev) =>
                        prev.filter((item) => item.id !== saved.id)
                      )
                    }
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
