import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { RecentOffer } from '../../data/mockSellerData';

interface RecentOfferCardProps {
  offer: RecentOffer;
}

const statusConfig = {
  Pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700',
    iconColor: 'text-yellow-600',
  },
  Accepted: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700',
    iconColor: 'text-green-600',
  },
  Rejected: {
    icon: XCircle,
    color: 'bg-red-100 text-red-700',
    iconColor: 'text-red-600',
  },
};

export default function RecentOfferCard({ offer }: RecentOfferCardProps) {
  const config = statusConfig[offer.status];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-900">{offer.buyerName}</h4>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
              <Icon className={`w-3 h-3 ${config.iconColor}`} />
              {offer.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">{offer.property}</p>
          <p className="text-sm font-semibold text-blue-600">{offer.offerAmount}</p>
        </div>
        <div className="text-xs text-gray-500 ml-4">{offer.timeAgo}</div>
      </div>
    </div>
  );
}

