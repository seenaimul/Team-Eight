import AiSearchBar from '../components/AiSearchBar.tsx'
import QuickFilter from '../components/QuickFilter.tsx'
import SmartAlerts from '../components/SmartAlerts.tsx';
import WhatWeOffer from '../components/WhatWeOffer.tsx';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <AiSearchBar />
        <QuickFilter />
        <SmartAlerts />
        <WhatWeOffer />
    </div>
  );
}
