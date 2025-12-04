import { useState } from 'react';
import { Bell, Mail, FileText, MessageSquare, TrendingUp } from 'lucide-react';

interface Preference {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  enabled: boolean;
}

export default function PreferencesSection() {
  const [preferences, setPreferences] = useState<Preference[]>([
    {
      id: 'email',
      label: 'Email Notifications',
      description: 'Receive updates via email',
      icon: Mail,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      enabled: true,
    },
    {
      id: 'offer-alerts',
      label: 'Offer Alerts',
      description: 'Get notified when you receive new offers',
      icon: FileText,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      enabled: true,
    },
    {
      id: 'message-alerts',
      label: 'New Message Alerts',
      description: 'Receive notifications for new messages',
      icon: MessageSquare,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      enabled: false,
    },
    {
      id: 'market-reports',
      label: 'Market Trend Reports',
      description: 'Weekly market insights and analytics',
      icon: TrendingUp,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      enabled: true,
    },
  ]);

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref))
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
      </div>

      <div className="space-y-4">
        {preferences.map((preference) => {
          const Icon = preference.icon;
          return (
            <div
              key={preference.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 ${preference.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${preference.iconColor}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{preference.label}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{preference.description}</p>
                </div>
              </div>
              <button
                onClick={() => togglePreference(preference.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preference.enabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Toggle ${preference.label}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preference.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

