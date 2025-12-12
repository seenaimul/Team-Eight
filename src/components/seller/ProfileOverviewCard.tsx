import { User, Mail, Phone, Calendar, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
}

interface ProfileOverviewCardProps {
  profile: Profile;
  onUploadPhoto?: () => void;
}

export default function ProfileOverviewCard({ profile, onUploadPhoto }: ProfileOverviewCardProps) {
  const fullName = `${profile.first_name} ${profile.last_name}`;
  const roleCapitalized = profile.role.charAt(0).toUpperCase() + profile.role.slice(1).toLowerCase();
  const memberSince = format(new Date(profile.created_at), 'MMMM yyyy');

  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-10 h-10 text-white" />
        </div>

        {/* Profile Information */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {roleCapitalized}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Upload Photo Button */}
        <button
          onClick={onUploadPhoto}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Upload className="w-4 h-4" />
          Upload Photo
        </button>
      </div>
    </div>
  );
}






