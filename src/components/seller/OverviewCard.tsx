import { Home, TrendingUp, FileText, Eye } from 'lucide-react';
import type { OverviewMetric } from '../../data/mockSellerData';

interface OverviewCardProps {
  metric: OverviewMetric;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  'trending-up': TrendingUp,
  'file-text': FileText,
  eye: Eye,
};

export default function OverviewCard({ metric }: OverviewCardProps) {
  const Icon = iconMap[metric.icon] || Home;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
          <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
        </div>
      </div>
    </div>
  );
}

