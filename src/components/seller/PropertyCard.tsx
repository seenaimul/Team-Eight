import { MoreVertical, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import type { PropertyListing } from '../../data/mockSellerData';

interface PropertyCardProps {
  property: PropertyListing;
}

const statusColors = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Sold: 'bg-gray-100 text-gray-700',
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch the logged-in user from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Handle menu action here if needed
  };

  if (!userId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const propertyLink = `/seller/${userId}/property/${property.id}`;

  return (
    <Link
      to={propertyLink}
      className="block w-full"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 hover:shadow-md transition-all duration-200 cursor-pointer">
      {/* Mobile Layout */}
      <div className="md:hidden flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
          <p className="text-sm text-gray-600 truncate">{property.address}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}>
              {property.status}
            </span>
            <div className="flex items-center gap-1 text-gray-600">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{property.views}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <FileText className="w-4 h-4" />
              <span className="text-sm">{property.offers}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleActionClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
        {/* Property Column */}
        <div className="col-span-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
            <p className="text-sm text-gray-600 truncate">{property.address}</p>
          </div>
        </div>

        {/* Status Column */}
        <div className="col-span-1 flex justify-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}>
            {property.status}
          </span>
        </div>

        {/* Views Column */}
        <div className="col-span-1 flex items-center justify-center gap-1 text-gray-600">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">{property.views}</span>
        </div>

        {/* Offers Column */}
        <div className="col-span-1 flex items-center justify-center gap-1 text-gray-600">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">{property.offers}</span>
        </div>

        {/* Last Updated Column */}
        <div className="col-span-2 text-center text-sm text-gray-500">
          {property.lastUpdated}
        </div>

        {/* Actions Column */}
        <div className="col-span-3 flex justify-end">
          <button
            onClick={handleActionClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      </div>
    </Link>
  );
}

