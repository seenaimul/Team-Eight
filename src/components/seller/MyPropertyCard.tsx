import { MoreVertical, Eye, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import type { Property } from '../../types';

interface PropertyWithExtras extends Property {
  status?: 'Active' | 'Pending' | 'Sold';
  views?: number;
  offers?: number;
  lastUpdated?: string;
}

interface MyPropertyCardProps {
  property: PropertyWithExtras;
}

const statusColors = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Sold: 'bg-gray-100 text-gray-700',
};

export default function MyPropertyCard({ property }: MyPropertyCardProps) {
  const { userId } = useParams<{ userId: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch the logged-in user from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getUser();
  }, []);

  const activeUserId = userId || currentUserId;

  // Get the first image from image_urls or use image_url or placeholder
  // Handle both image_url (singular) and image_urls (plural) for compatibility
  const imageUrl =
    (property.image_urls && property.image_urls.length > 0 && property.image_urls[0]) ||
    (property as any).image_url ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop';

  const status = property.status || 'Active';
  const views = property.views || 0;
  const offers = property.offers || 0;
  const lastUpdated = property.lastUpdated || 'Recently';

  // Format location string
  const locationString = property.location
    ? `${property.location}, ${property.city}`
    : property.city;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Handle menu action here if needed
  };

  if (!activeUserId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const propertyLink = `/seller/${activeUserId}/property/${property.id}`;

  return (
    <Link
      to={propertyLink}
      className="block w-full"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 hover:shadow-md transition-all duration-200 cursor-pointer rounded-lg">
      <div className="flex items-start gap-4">
        {/* Property Image */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop';
            }}
          />
        </div>

        {/* Property Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                {property.title}
              </h3>

              {/* Location */}
              <p className="text-sm text-gray-600 mb-2 truncate">{locationString}</p>

              {/* Price */}
              <p className="text-lg font-semibold text-blue-600 mb-3">
                £{property.price.toLocaleString()}
              </p>

              {/* Property Details */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                <span className="text-gray-300">•</span>
                <span>{property.property_type}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{views.toLocaleString()} views</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>{offers} {offers === 1 ? 'offer' : 'offers'}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">Updated {lastUpdated}</span>
              </div>
            </div>

            {/* Status Badge and More Options */}
            <div className="flex items-start gap-2 flex-shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  statusColors[status] || statusColors.Active
                }`}
              >
                {status}
              </span>
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
      </div>
      </div>
    </Link>
  );
}

