import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';
import SellerSidebar from '../../components/seller/SellerSidebar';
import SellerHeader from '../../components/seller/SellerHeader';
import MyPropertyCard from '../../components/seller/MyPropertyCard';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import type { Property } from '../../types';

interface PropertyWithStatus extends Property {
  status?: 'Active' | 'Pending' | 'Sold';
  views?: number;
  offers?: number;
}

export default function MyProperties() {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // State
  const [properties, setProperties] = useState<PropertyWithStatus[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [minBedrooms, setMinBedrooms] = useState<number | ''>('');
  const [maxBedrooms, setMaxBedrooms] = useState<number | ''>('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortOption, setSortOption] = useState<string>('Latest');

  // Validate userId from URL matches current session user
  useEffect(() => {
    const validateUser = async () => {
      if (!urlUserId) {
        setIsAuthorized(false);
        return;
      }

      // Fetch the logged-in user from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate('/signin');
        return;
      }

      // If user.id !== userId, redirect to correct dashboard
      if (user.id !== urlUserId) {
        navigate(`/seller/${user.id}/dashboard`);
        return;
      }

      setIsAuthorized(true);
    };

    validateUser();
  }, [urlUserId, navigate]);

  // Fetch properties from Supabase
  useEffect(() => {
    if (!isAuthorized || !urlUserId) return;

    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the logged-in user from Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Auth error:', userError);
          setError('You must be logged in to view your properties.');
          setLoading(false);
          return;
        }

        // Check authorization again
        if (user.id !== urlUserId) {
          navigate(`/seller/${user.id}/dashboard`);
          return;
        }

        // Load properties only for that user
        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('RLS ERROR:', fetchError.message);
          
          // Check if it's an RLS error
          if (fetchError.message.includes('Row Level Security') || fetchError.message.includes('policy') || fetchError.code === '42501') {
            setError('You are not allowed to insert or view this data. Please check your permissions.');
          } else {
            setError(fetchError.message || 'Failed to load properties');
          }
          setLoading(false);
          return;
        }

        // Transform data to include status, views, offers
        // In a real app, these would come from the database
        const propertiesWithStatus: PropertyWithStatus[] = (data || []).map((prop) => ({
          ...prop,
          status: (prop as any).status || 'Active', // Default to Active if no status
          views: (prop as any).views || Math.floor(Math.random() * 2000) + 100, // Mock data
          offers: (prop as any).offers || Math.floor(Math.random() * 20), // Mock data
        }));

        setProperties(propertiesWithStatus);
      } catch (err: any) {
        console.error('Error fetching properties:', err);
        setError(err.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [isAuthorized, urlUserId, navigate]);

  // Apply search, filter, and sort
  useEffect(() => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (prop) =>
          prop.title.toLowerCase().includes(query) ||
          prop.description?.toLowerCase().includes(query) ||
          prop.city.toLowerCase().includes(query) ||
          prop.location.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter((prop) => prop.status === selectedStatus);
    }

    // Property type filter
    if (selectedType !== 'All') {
      filtered = filtered.filter((prop) => prop.property_type === selectedType);
    }

    // Bedrooms filter
    if (minBedrooms !== '') {
      filtered = filtered.filter((prop) => prop.bedrooms >= Number(minBedrooms));
    }
    if (maxBedrooms !== '') {
      filtered = filtered.filter((prop) => prop.bedrooms <= Number(maxBedrooms));
    }

    // Price filter
    if (minPrice !== '') {
      filtered = filtered.filter((prop) => prop.price >= Number(minPrice));
    }
    if (maxPrice !== '') {
      filtered = filtered.filter((prop) => prop.price <= Number(maxPrice));
    }

    // Sort
    switch (sortOption) {
      case 'Latest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'Oldest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateA - dateB;
        });
        break;
      case 'Price (Low to High)':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'Price (High to Low)':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, searchQuery, selectedStatus, selectedType, minBedrooms, maxBedrooms, minPrice, maxPrice, sortOption]);

  const clearFilters = () => {
    setSelectedStatus('All');
    setSelectedType('All');
    setMinBedrooms('');
    setMaxBedrooms('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedStatus !== 'All' ||
    selectedType !== 'All' ||
    minBedrooms !== '' ||
    maxBedrooms !== '' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    searchQuery.trim() !== '';

  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  };

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

          {/* Page Content */}
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Properties</h1>
              <p className="text-gray-600">Manage and track your property listings.</p>
            </div>

            {/* Search, Filter, Sort Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Filter Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowFilterMenu(!showFilterMenu);
                      setShowSortMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Filter Dropdown */}
                  {showFilterMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowFilterMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={selectedStatus}
                              onChange={(e) => setSelectedStatus(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="All">All Status</option>
                              <option value="Active">Active</option>
                              <option value="Pending">Pending</option>
                              <option value="Sold">Sold</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Property Type
                            </label>
                            <select
                              value={selectedType}
                              onChange={(e) => setSelectedType(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="All">All Types</option>
                              <option value="House">House</option>
                              <option value="Flat">Flat</option>
                              <option value="Studio">Studio</option>
                              <option value="Cottage">Cottage</option>
                              <option value="Bungalow">Bungalow</option>
                              <option value="Detached">Detached</option>
                              <option value="Semi-detached">Semi-detached</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Min Bedrooms
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={minBedrooms}
                                onChange={(e) => setMinBedrooms(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Bedrooms
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={maxBedrooms}
                                onChange={(e) => setMaxBedrooms(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="Any"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Min Price (£)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Price (£)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="Any"
                              />
                            </div>
                          </div>

                          {hasActiveFilters && (
                            <button
                              onClick={clearFilters}
                              className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Sort Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSortMenu(!showSortMenu);
                      setShowFilterMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {sortOption}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Sort Dropdown */}
                  {showSortMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <button
                          onClick={() => {
                            setSortOption('Latest');
                            setShowSortMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg"
                        >
                          Latest
                        </button>
                        <button
                          onClick={() => {
                            setSortOption('Oldest');
                            setShowSortMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          Oldest
                        </button>
                        <button
                          onClick={() => {
                            setSortOption('Price (Low to High)');
                            setShowSortMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          Price (Low to High)
                        </button>
                        <button
                          onClick={() => {
                            setSortOption('Price (High to Low)');
                            setShowSortMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 last:rounded-b-lg"
                        >
                          Price (High to Low)
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading properties...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredProperties.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                  <p className="text-gray-600 mb-6">
                    {hasActiveFilters
                      ? 'Try adjusting your search or filters.'
                      : "You haven't added any properties yet."}
                  </p>
                  {!hasActiveFilters && urlUserId && (
                    <button
                      onClick={() => navigate(`/seller/${urlUserId}/add`)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Property
                    </button>
                  )}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Properties List */}
            {!loading && !error && filteredProperties.length > 0 && (
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <MyPropertyCard
                    key={property.id}
                    property={{
                      ...property,
                      lastUpdated: formatTimeAgo(property.created_at),
                    }}
                  />
                ))}

                {/* Pagination Info */}
                <div className="text-center text-sm text-gray-600 mt-6">
                  Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
                  {properties.length !== filteredProperties.length &&
                    ` out of ${properties.length} total`}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

