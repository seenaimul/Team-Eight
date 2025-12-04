import { MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

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
  offer_type: string;
  status: string;
  submitted_at: string;
  offer_amount: number | string;
}

interface OfferCardProps {
  offer: Offer;
  buyer: Buyer;
  property: Property;
}

export default function OfferCard({ offer, buyer, property }: OfferCardProps) {
  const buyerName = `${buyer.first_name} ${buyer.last_name}`;
  const location = `${property.location}, ${property.city}`;
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format offer amount (could be number or string like "£2,500/month")
  const formatOfferAmount = (amount: number | string) => {
    if (typeof amount === 'string') {
      return amount;
    }
    return formatPrice(amount);
  };

  // Format date
  const formattedDate = format(new Date(offer.submitted_at), 'd MMM yyyy');

  // Status badge styling
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Block - Property Information */}
        <div className="flex-shrink-0">
          <img
            src={property.image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop'}
            alt={property.title}
            className="w-full md:w-48 h-32 object-cover rounded-lg"
          />
          <div className="mt-3">
            <h3 className="font-semibold text-gray-900">{property.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{location}</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formatPrice(property.price)}
            </p>
          </div>
        </div>

        {/* Middle Block - Buyer and Offer Information */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <p className="font-semibold text-gray-900">{buyerName}</p>
            <p className="text-sm text-gray-600 mt-1">{buyer.email}</p>
          </div>
          
          <div className="mt-4 space-y-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Offer Amount</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatOfferAmount(offer.offer_amount)}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Submitted</p>
              <p className="text-sm text-gray-700 mt-1">{formattedDate}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Offer Type</p>
              <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                {offer.offer_type}
              </p>
            </div>
          </div>
        </div>

        {/* Right Block - Status Badge (top) and Menu (bottom) */}
        <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-between md:min-h-full">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(offer.status)}`}
          >
            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
          </span>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

