import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import SellerSidebar from '../../components/seller/SellerSidebar';
import SellerHeader from '../../components/seller/SellerHeader';
import { Card } from '../../components/ui/Card';
import {
  MoreVertical,
  MapPin,
  Upload,
  DollarSign,
  FileText,
  Bed,
  Bath,
  Square,
  Home,
  Eye,
  Camera,
  ExternalLink,
  Edit,
  Trash2,
  TreePine,
  GraduationCap,
  Volume2,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Property } from '../../types';

interface Offer {
  id: number;
  user_id: string;
  property_id: number;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface OfferWithUser extends Offer {
  users: {
    first_name: string;
    last_name: string;
  };
}

interface PropertyWithOffers extends Property {
  offers?: OfferWithUser[];
  status?: string;
  views?: number;
  bathrooms?: number;
  size?: number;
}

export default function PropertyDetailsPage() {
  const { userId, propertyId } = useParams<{ userId: string; propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyWithOffers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!userId || !propertyId) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the logged-in user from Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          navigate('/signin');
          return;
        }

        // If user.id !== userId, redirect to correct dashboard
        if (user.id !== userId) {
          navigate(`/seller/${user.id}/dashboard`);
          return;
        }

        // Fetch property with both id and user_id filters
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', Number(propertyId))
          .eq('user_id', user.id)
          .single();

        if (propertyError || !propertyData) {
          console.error('Error fetching property:', propertyError);
          // If no result, redirect back to properties page
          navigate(`/seller/${user.id}/properties`);
          return;
        }

        // Fetch offers separately with user data
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select(`
            id,
            user_id,
            property_id,
            amount,
            status,
            created_at
          `)
          .eq('property_id', Number(propertyId))
          .order('created_at', { ascending: false });

        // Fetch user data for each offer
        const transformedOffers: OfferWithUser[] = [];
        if (offersData && !offersError) {
          for (const offer of offersData) {
            const { data: userData } = await supabase
              .from('users')
              .select('first_name, last_name')
              .eq('id', offer.user_id)
              .single();

            transformedOffers.push({
              ...offer,
              users: userData || { first_name: 'Unknown', last_name: 'User' },
            });
          }
        }

        setProperty({
          ...propertyData,
          offers: transformedOffers,
          status: (propertyData as any).status || 'active',
          views: (propertyData as any).views || 0,
          bathrooms: (propertyData as any).bathrooms || 2, // Default fallback
          size: (propertyData as any).size || null,
        });
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [userId, propertyId, navigate]);

  const handleDelete = async () => {
    if (!userId || !propertyId || !property) return;

    try {
      setDeleting(true);
      
      // Fetch the logged-in user from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate('/signin');
        return;
      }

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', Number(propertyId))
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting property:', error);
        setError('Failed to delete property. Please try again.');
        setDeleting(false);
        return;
      }

      // Redirect to my properties page
      navigate(`/seller/${user.id}/properties`);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to delete property.');
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!userId || !propertyId) return;
    navigate(`/seller/${userId}/edit-property/${propertyId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'd MMM yyyy');
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    const statusLower = (status || 'active').toLowerCase();
    if (statusLower === 'active') return 'bg-green-100 text-green-700';
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (statusLower === 'sold' || statusLower === 'inactive') return 'bg-gray-100 text-gray-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getOfferStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <SellerSidebar />
          <main className="flex-1 lg:ml-0">
            <SellerHeader />
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading property details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <SellerSidebar />
          <main className="flex-1 lg:ml-0">
            <SellerHeader />
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go Back
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const imageUrl = property.image_url || '/placeholder.jpg';
  const imageUrls = property.image_urls && property.image_urls.length > 0 
    ? property.image_urls 
    : [imageUrl];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 lg:ml-0">
          <SellerHeader />

          <div className="p-6 max-w-7xl mx-auto">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Property Header */}
            <Card className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(property.status)}`}
                    >
                      {property.status ? property.status.charAt(0).toUpperCase() + property.status.slice(1) : 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {property.location}, {property.city}, {property.postcode}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleEdit();
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowDeleteModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Property Images Section */}
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Property Images</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload More Photos
                </button>
              </div>
              <div className="space-y-4">
                {/* Main Image */}
                <div className="w-full h-96 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imageUrls[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg';
                    }}
                  />
                </div>
                {/* Thumbnail Row */}
                {imageUrls.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {imageUrls.slice(1, 6).map((url, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={url}
                          alt={`${property.title} ${index + 2}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Property Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Asking Price */}
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(property.price)}</p>
                  <p className="text-sm text-gray-600 mt-1">Asking Price</p>
                </div>
              </Card>

              {/* Listing Type */}
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{property.listing_type || 'Sell'}</p>
                  <p className="text-sm text-gray-600 mt-1">Listing Type</p>
                </div>
              </Card>

              {/* Bedrooms */}
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-3">
                    <Bed className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.bedrooms || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mt-1">Bedrooms</p>
                </div>
              </Card>

              {/* Bathrooms */}
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                    <Bath className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.bathrooms || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mt-1">Bathrooms</p>
                </div>
              </Card>

              {/* Size */}
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-3">
                    <Square className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.size ? `${property.size}` : '—'}</p>
                  <p className="text-sm text-gray-600 mt-1">sq ft</p>
                </div>
              </Card>

              {/* Property Type */}
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.property_type || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mt-1">Property Type</p>
                </div>
              </Card>

              {/* Total Views */}
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{(property.views || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Views</p>
                </div>
              </Card>

              {/* Offers Received */}
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.offers?.length || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Offers Received</p>
                </div>
              </Card>
            </div>

            {/* Description and Key Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Description Section */}
              <div className="md:col-span-2">
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Description</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {property.description || 'No description available.'}
                  </p>
                  <p className="text-sm text-gray-500">Listed on {formatDate(property.created_at)}</p>
                </Card>
              </div>

              {/* Key Highlights */}
              <div>
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Highlights</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Bed className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{property.bedrooms || 'N/A'} Bedrooms</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{property.property_type || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{property.listing_type || 'Sell'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">
                        {property.noise_level || 'Low'} Noise Level
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TreePine className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{property.near_park ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{property.near_school ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  {property.virtual_tour_link && (
                    <button
                      onClick={() => window.open(property.virtual_tour_link, '_blank')}
                      className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      View Virtual Tour
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </Card>
              </div>
            </div>

            {/* Location Map Placeholder */}
            <Card className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              </div>
              <div className="space-y-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Street Address</p>
                  <p className="text-gray-900">{property.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">City</p>
                    <p className="text-gray-900">{property.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Postcode</p>
                    <p className="text-gray-900">{property.postcode}</p>
                  </div>
                </div>
              </div>
              <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 mb-1">Map Preview</p>
                <p className="text-sm text-gray-400">
                  Coordinates: {property.latitude}, {property.longitude}
                </p>
              </div>
            </Card>

            {/* Offers Received Section */}
            {property.offers && property.offers.length > 0 && (
              <Card className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Offers Received ({property.offers.length})
                </h2>
                <div className="space-y-4">
                  {property.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {offer.users.first_name?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {offer.users.first_name} {offer.users.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Made an offer on {formatDate(offer.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice(offer.amount)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getOfferStatusBadgeColor(offer.status)}`}
                        >
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </span>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Bottom Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Property
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Listing
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Property Listing</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this property listing? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

