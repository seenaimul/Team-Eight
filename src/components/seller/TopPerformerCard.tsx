import { Award, Eye, FileText, MessageCircle } from 'lucide-react';
import type { TopPerformer } from '../../data/mockSellerData';

interface TopPerformerCardProps {
  performer: TopPerformer;
}

export default function TopPerformerCard({ performer }: TopPerformerCardProps) {
  return (
    <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Award className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold">TOP PERFORMER</h3>
      </div>

      <div className="mb-4">
        <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
          <img
            src={performer.image}
            alt={performer.title}
            className="w-full h-full object-cover"
          />
        </div>
        <h4 className="font-semibold text-lg mb-1">{performer.title}</h4>
        <p className="text-blue-100 text-sm">{performer.address}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">{performer.views}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">{performer.offers}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{performer.inquiries}</span>
        </div>
      </div>
    </div>
  );
}

