import { MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface Property {
  id: number;
  title: string;
  location: string;
  city: string;
  image_url?: string;
}

interface Offer {
  id: number;
  property_id: number;
  offer_type: string;
  offer_amount: number | string;
  status: 'pending' | 'accepted' | 'rejected';
  submitted_at: string;
  properties?: Property;
}

interface OfferListItemProps {
  offer: Offer;
}

export default function OfferListItem({ offer }: OfferListItemProps) {

  const formatPrice = (amount: number | string) => {
    if (typeof amount === 'string') {
      return amount;
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeStyle = (status: string) => {
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

  const property = offer.properties;
  if (!property) return null;

  const location = `${property.location || ''}${property.city ? (property.location ? ', ' : '') + property.city : ''}`;
  const formattedDate = format(new Date(offer.submitted_at), 'MMM d, yyyy');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex gap-6">
        {/* Property Image */}
        <div className="flex-shrink-0">
          <img
            src={property.image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop'}
            alt={property.title}
            className="w-32 h-24 object-cover rounded-lg"
          />
        </div>

        {/* Property and Offer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{property.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{location}</p>
            </div>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Offer Amount</p>
              <p className="text-lg font-semibold text-gray-900">{formatPrice(offer.offer_amount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Offer Type</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{offer.offer_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
              <p className="text-sm text-gray-700">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0 flex items-start">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeStyle(offer.status)}`}
          >
            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

