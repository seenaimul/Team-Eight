import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import SellerSidebar from '../../components/seller/SellerSidebar';
import SellerHeader from '../../components/seller/SellerHeader';
import ProfileOverviewCard from '../../components/seller/ProfileOverviewCard';
import PersonalInfoForm from '../../components/seller/PersonalInfoForm';
import SecuritySettingsForm from '../../components/seller/SecuritySettingsForm';
import PreferencesSection from '../../components/seller/PreferencesSection';
import DangerZone from '../../components/seller/DangerZone';
import { User } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
}

export default function ProfileSettings() {
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Validate userId from URL matches current session user
  useEffect(() => {
    const validateUser = async () => {
      if (!urlUserId) {
        setIsAuthorized(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/signin');
        return;
      }

      if (session.user.id !== urlUserId) {
        navigate('/unauthorized');
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    };

    validateUser();
  }, [urlUserId, navigate]);

  // Fetch profile data
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('Failed to get authenticated user');
        }

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, phone, role, created_at')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw new Error(`Failed to fetch profile: ${profileError.message}`);
        }

        if (!profileData) {
          throw new Error('Profile not found');
        }

        setProfile(profileData as Profile);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthorized]);

  // Handle personal info update
  const handleSavePersonalInfo = async (data: { first_name: string; last_name: string; phone: string }) => {
    if (!profile) {
      throw new Error('Profile not loaded');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || null,
      })
      .eq('id', profile.id);

    if (updateError) {
      throw new Error(updateError.message || 'Failed to update profile. Please try again.');
    }

    // Update local profile state
    setProfile({
      ...profile,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || null,
    });
  };

  // Handle photo upload (placeholder for now)
  const handleUploadPhoto = () => {
    alert('Photo upload is not yet implemented.');
  };

  // Show loading while validating authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f7f9fc' }}>
      <div className="flex">
        {/* Sidebar */}
        <SellerSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Top Header */}
          <SellerHeader />

          {/* Page Content */}
          <div className="p-6 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              </div>
              <p className="text-gray-600 ml-14">Manage your personal information and account preferences</p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : profile ? (
              <>
                {/* Profile Overview Card */}
                <div className="mb-6">
                  <ProfileOverviewCard profile={profile} onUploadPhoto={handleUploadPhoto} />
                </div>

                {/* Personal Information Card */}
                <div className="mb-6">
                  <PersonalInfoForm profile={profile} onSave={handleSavePersonalInfo} />
                </div>

                {/* Security Settings Card */}
                <div className="mb-6">
                  <SecuritySettingsForm />
                </div>

                {/* Preferences Section */}
                <div className="mb-6">
                  <PreferencesSection />
                </div>

                {/* Danger Zone */}
                <div>
                  <DangerZone />
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

