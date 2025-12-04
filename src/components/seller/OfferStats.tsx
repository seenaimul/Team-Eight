import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface OfferStatsProps {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

export default function OfferStats({ total, pending, accepted, rejected }: OfferStatsProps) {
  const stats = [
    {
      label: 'Total Offers',
      value: total,
      icon: FileText,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pending Offers',
      value: pending,
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Accepted',
      value: accepted,
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Rejected',
      value: rejected,
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

