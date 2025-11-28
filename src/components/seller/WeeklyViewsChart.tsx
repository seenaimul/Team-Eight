import { TrendingUp } from 'lucide-react';
import type { WeeklyViewData } from '../../data/mockSellerData';

interface WeeklyViewsChartProps {
  data: WeeklyViewData[];
}

export default function WeeklyViewsChart({ data }: WeeklyViewsChartProps) {
  const maxViews = 600;
  const chartHeight = 200;

  // Calculate points for the line chart (normalized to 0-100)
  const normalizedData = data.map((item) => ({
    ...item,
    normalized: (item.views / maxViews) * 100,
  }));

  // Create path for the line
  const pathData = normalizedData
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - item.normalized;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weekly Views</h3>
          <p className="text-sm text-gray-600">Property views over the last 7 days</p>
        </div>
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2 w-10">
          <span>600</span>
          <span>450</span>
          <span>300</span>
          <span>150</span>
          <span>0</span>
        </div>

        {/* Chart SVG */}
        <div className="ml-12 h-full pr-4">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
            style={{ height: `${chartHeight}px` }}
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="0.3"
              />
            ))}
            
            {/* Line chart */}
            <path
              d={pathData}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {normalizedData.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - item.normalized;
              return (
                <circle
                  key={item.day}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#3B82F6"
                />
              );
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="ml-12 pr-4 flex justify-between mt-2">
          {data.map((item) => (
            <span key={item.day} className="text-xs text-gray-600">
              {item.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

