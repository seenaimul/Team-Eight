export interface OverviewMetric {
  id: string;
  label: string;
  value: number;
  icon: string;
}

export interface PropertyListing {
  id: string;
  title: string;
  address: string;
  image: string;
  status: 'Active' | 'Pending' | 'Sold';
  views: number;
  offers: number;
  lastUpdated: string;
}

export interface RecentOffer {
  id: string;
  buyerName: string;
  property: string;
  offerAmount: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  timeAgo: string;
}

export interface WeeklyViewData {
  day: string;
  views: number;
}

export interface TopPerformer {
  title: string;
  address: string;
  image: string;
  views: number;
  offers: number;
  inquiries: number;
}

export const overviewMetrics: OverviewMetric[] = [
  { id: '1', label: 'Total Properties Listed', value: 12, icon: 'home' },
  { id: '2', label: 'Active Listings', value: 8, icon: 'trending-up' },
  { id: '3', label: 'Offers Received', value: 23, icon: 'file-text' },
  { id: '4', label: 'Average Property Views', value: 342, icon: 'eye' },
];

export const propertyListings: PropertyListing[] = [
  {
    id: '1',
    title: '4 Bedroom House',
    address: 'Albion Square',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    status: 'Active',
    views: 542,
    offers: 8,
    lastUpdated: '2 days ago',
  },
  {
    id: '2',
    title: '1 Bedroom Flat',
    address: 'Parker House, 5 Cuthbert Street',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    status: 'Active',
    views: 328,
    offers: 3,
    lastUpdated: '5 days ago',
  },
  {
    id: '3',
    title: '3 Bedroom Townhouse',
    address: 'Richmond Gardens',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    status: 'Pending',
    views: 891,
    offers: 12,
    lastUpdated: '1 week ago',
  },
  {
    id: '4',
    title: 'Studio Apartment',
    address: 'City Centre',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    status: 'Sold',
    views: 1203,
    offers: 15,
    lastUpdated: '2 weeks ago',
  },
];

export const recentOffers: RecentOffer[] = [
  {
    id: '1',
    buyerName: 'Sarah Johnson',
    property: '1 Bedroom Flat',
    offerAmount: '£620,000',
    status: 'Pending',
    timeAgo: '2 hours ago',
  },
  {
    id: '2',
    buyerName: 'Michael Chen',
    property: '4 Bedroom House',
    offerAmount: '£2,950,000',
    status: 'Pending',
    timeAgo: '1 day ago',
  },
  {
    id: '3',
    buyerName: 'Emma Wilson',
    property: '3 Bedroom Townhouse',
    offerAmount: '£1,800,000',
    status: 'Accepted',
    timeAgo: '3 days ago',
  },
  {
    id: '4',
    buyerName: 'David Brown',
    property: 'Studio Apartment',
    offerAmount: '£575,000',
    status: 'Rejected',
    timeAgo: '1 week ago',
  },
];

export const weeklyViewsData: WeeklyViewData[] = [
  { day: 'Mon', views: 130 },
  { day: 'Tue', views: 180 },
  { day: 'Wed', views: 250 },
  { day: 'Thu', views: 180 },
  { day: 'Fri', views: 310 },
  { day: 'Sat', views: 440 },
  { day: 'Sun', views: 380 },
];

export const topPerformer: TopPerformer = {
  title: '4 Bedroom House',
  address: 'Albion Square',
  image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
  views: 542,
  offers: 8,
  inquiries: 23,
};

