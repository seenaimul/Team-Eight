import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import BuyerSidebar from '../../components/buyer/BuyerSidebar';
import BuyerHeader from '../../components/buyer/BuyerHeader';
import BuyerFiltersSidebar from '../../components/buyer/BuyerFiltersSidebar';
import BuyerPropertyCard from '../../components/buyer/BuyerPropertyCard';
import { Search, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Property } from '../../types';

interface ExtendedProperty extends Property {
  bathrooms?: number;
  size?: number;
  updated_at?: string;
  status?: string;
}

export default function SearchProperties() {
  // State management
  const [properties, setProperties] = useState<ExtendedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [nearPark, setNearPark] = useState(false);
  const [nearSchool, setNearSchool] = useState(false);
  const [quietArea, setQuietArea] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(false);

  const propertiesPerPage = 9;

  // Build query with all filters applied
  const buildQuery = (baseQuery: any) => {
    let query = baseQuery;

    // Location filter (city or postcode) - using ilike for partial match
    if (location) {
      query = query.or(`city.ilike.%${location}%,postcode.ilike.%${location}%`);
    }

    // Price filters
    if (minPrice) {
      query = query.gte('price', Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price', Number(maxPrice));
    }

    // Bedrooms filter
    if (bedrooms) {
      if (bedrooms === 'Studio') {
        query = query.eq('bedrooms', 0);
      } else if (bedrooms === '5+') {
        query = query.gte('bedrooms', 5);
      } else {
        query = query.eq('bedrooms', Number(bedrooms));
      }
    }

    // Property type filter
    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }

    // Toggle filters
    if (nearPark) {
      query = query.eq('near_park', true);
    }
    if (nearSchool) {
      query = query.eq('near_school', true);
    }
    if (quietArea) {
      // Quiet area means noise_level equals 'low' (case-insensitive)
      query = query.ilike('noise_level', '%low%');
    }

    return query;
  };

  // Fetch properties with filters
  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Build count query with all filters
      let countQuery = buildQuery(
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active')
      );
      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error('Error counting properties:', countError);
      }

      // Build data query with filters and sorting
      let dataQuery = buildQuery(
        supabase.from('properties').select('*').eq('status', 'active')
      );

      // Sorting
      switch (sortBy) {
        case 'price_low':
          dataQuery = dataQuery.order('price', { ascending: true });
          break;
        case 'price_high':
          dataQuery = dataQuery.order('price', { ascending: false });
          break;
        case 'bedrooms':
          dataQuery = dataQuery.order('bedrooms', { ascending: false });
          break;
        case 'newest':
          dataQuery = dataQuery.order('created_at', { ascending: false });
          break;
        case 'recommended':
        default:
          dataQuery = dataQuery.order('created_at', { ascending: false });
          break;
      }

      // Pagination
      const from = (page - 1) * propertiesPerPage;
      const to = from + propertiesPerPage - 1;
      dataQuery = dataQuery.range(from, to);

      const { data, error } = await dataQuery;

      if (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
        setTotalCount(0);
      } else {
        setProperties(data || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setProperties([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties when filters are applied or pagination/sorting changes
  useEffect(() => {
    if (appliedFilters) {
      fetchProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, appliedFilters]);

  // Initial load - fetch all properties
  useEffect(() => {
    const loadInitialProperties = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('properties')
          .select('*', { count: 'exact' })
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .range(0, propertiesPerPage - 1);

        const { data, error, count } = await query;

        if (error) {
          console.error('Error fetching properties:', error);
          setProperties([]);
          setTotalCount(0);
        } else {
          setProperties(data || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadInitialProperties();
  }, []);

  // Handle search from banner
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(searchQuery.trim());
      setPage(1);
      setAppliedFilters(true);
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters(true);
    fetchProperties();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setPropertyType('');
    setNearPark(false);
    setNearSchool(false);
    setQuietArea(false);
    setSortBy('recommended');
    setPage(1);
    setAppliedFilters(false);
    
    // Reset to show all properties
    const resetQuery = async () => {
      setLoading(true);
      try {
        const { data, error, count } = await supabase
          .from('properties')
          .select('*', { count: 'exact' })
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .range(0, propertiesPerPage - 1);

        if (error) {
          console.error('Error fetching properties:', error);
          setProperties([]);
          setTotalCount(0);
        } else {
          setProperties(data || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    resetQuery();
  };

  // Get property badge
  const getPropertyBadge = (property: ExtendedProperty) => {
    if (!property.updated_at) return null;

    const updatedDate = new Date(property.updated_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (updatedDate > sevenDaysAgo) {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      if (updatedDate > oneDayAgo) {
        return { show: true, text: 'New Price' };
      }
      return { show: true, text: 'Updated' };
    }

    return null;
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / propertiesPerPage);
  const pages = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1); // Limit to 10 pages max

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Properties</h1>
              <p className="text-gray-600">Discover homes that match your lifestyle, budget, and location.</p>
            </div>

            {/* Search Banner Section */}
            <div className="mb-8">
              <div className="w-full bg-blue-600 rounded-3xl p-8 flex flex-col gap-4 text-white">
                {/* First Row: Icon + Title/Subtitle */}
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-4 rounded-full flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold">Search for your next home</h2>
                    <p className="text-blue-100">
                      Use AI-powered search to explore homes tailored to you.
                    </p>
                  </div>
                </div>

                {/* Second Row: Search Input + Button */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white rounded-xl px-4 py-3 w-full">
                    <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Enter location, postcode, or keywords..."
                      className="ml-3 w-full text-gray-700 outline-none bg-transparent"
                    />
                  </div>

                  <button
                    onClick={handleSearch}
                    className="bg-blue-700 text-white font-semibold rounded-xl px-8 py-3 hover:bg-blue-800 transition whitespace-nowrap flex-shrink-0"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content: Filters + Properties */}
            <div className="flex gap-6">
              {/* Filters Sidebar */}
              <BuyerFiltersSidebar
                location={location}
                setLocation={setLocation}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                bedrooms={bedrooms}
                setBedrooms={setBedrooms}
                propertyType={propertyType}
                setPropertyType={setPropertyType}
                nearPark={nearPark}
                setNearPark={setNearPark}
                nearSchool={nearSchool}
                setNearSchool={setNearSchool}
                quietArea={quietArea}
                setQuietArea={setQuietArea}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />

              {/* Properties Grid */}
              <div className="flex-1">
                {/* Results Header */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {totalCount} {totalCount === 1 ? 'property' : 'properties'} found
                  </h2>
                  {location && (
                    <p className="text-sm text-gray-600">Showing results for {location}</p>
                  )}
                </div>

                {/* Loading State */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-xl h-96 animate-pulse" />
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No properties found.</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters.</p>
                  </div>
                ) : (
                  <>
                    {/* Property Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {properties.map((property) => {
                        const badge = getPropertyBadge(property);
                        return (
                          <BuyerPropertyCard
                            key={property.id}
                            property={property}
                            showBadge={badge?.show || false}
                            badgeText={badge?.text}
                          />
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        {pages.map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}

                        <button
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
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

