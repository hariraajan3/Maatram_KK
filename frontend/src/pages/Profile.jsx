import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { user, onLogout } = useOutletContext();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Load user data from session
    try {
      const session = JSON.parse(localStorage.getItem('kk_session') || '{}');
      if (session?.user) {
        setProfileData(session.user);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, []);

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-black/70 font-medium">Loading profile...</p>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-maatram-yellow text-black border-2 border-black';
      case 'tutorlead':
        return 'bg-maatram-yellow text-black border-2 border-black';
      case 'tutor':
        return 'bg-maatram-yellow text-black border-2 border-black';
      case 'coordinator':
        return 'bg-maatram-yellow text-black border-2 border-black';
      default:
        return 'bg-maatram-yellow text-black border-2 border-black';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role?.toLowerCase()) {
      case 'tutorlead':
        return 'Tutor Lead';
      case 'admin':
        return 'Administrator';
      case 'tutor':
        return 'Tutor';
      case 'coordinator':
        return 'Coordinator';
      default:
        return role || 'User';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-2xl font-bold text-black">My Profile</h2>
        <p className="text-sm text-black/70 font-medium">View and manage your account information</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card - Left Side */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-maatram-yellow p-6">
            {/* Avatar Section */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-maatram-yellow text-black text-3xl font-bold mb-4 border-2 border-black">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(profileData.name)
                )}
              </div>
              <h3 className="text-xl font-bold text-black mb-1">{profileData.name}</h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(
                  profileData.role
                )}`}
              >
                {getRoleDisplayName(profileData.role)}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3 pt-6 border-t border-maatram-yellow">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black/70">Account Status</span>
                <span className="px-2 py-1 bg-maatram-yellow text-black border border-black text-xs font-semibold rounded-full">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black/70">Member Since</span>
                <span className="text-sm font-medium text-black">
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-maatram-yellow hover:bg-maatram-yellow-dark text-black border-2 border-black font-bold py-3 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={onLogout}
              className="w-full bg-black hover:bg-black/90 text-white border-2 border-black text-black font-semibold py-3 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Details Card - Right Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-maatram-yellow p-6">
            <h3 className="text-lg font-semibold text-black mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-black/60 uppercase tracking-wide mb-2">
                    Full Name
                  </label>
                  <div className="p-3 bg-maatram-yellow/20 rounded-lg border border-maatram-yellow">
                    <p className="text-sm font-medium text-black">{profileData.name}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/60 uppercase tracking-wide mb-2">
                    Email Address
                  </label>
                  <div className="p-3 bg-maatram-yellow/20 rounded-lg border border-maatram-yellow">
                    <p className="text-sm font-medium text-black">{profileData.email}</p>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-black/60 uppercase tracking-wide mb-2">
                    User ID
                  </label>
                  <div className="p-3 bg-maatram-yellow/20 rounded-lg border border-maatram-yellow">
                    <p className="text-sm font-medium text-black">{profileData.id || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/60 uppercase tracking-wide mb-2">
                    Role
                  </label>
                  <div className="p-3 bg-maatram-yellow/20 rounded-lg border border-maatram-yellow">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                        profileData.role
                      )}`}
                    >
                      {getRoleDisplayName(profileData.role)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-maatram-yellow p-6">
            <h3 className="text-lg font-semibold text-black mb-6">Account Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Profile Management</p>
                    <p className="text-xs text-blue-700 mt-1">
                      To update your profile information, please contact your administrator.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-amber-600 mt-0.5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-900">Password Security</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Use the "Forgot Password" option on the login page to reset your password.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-maatram-yellow p-6">
            <h3 className="text-lg font-semibold text-black mb-6">Activity Summary</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-maatram-yellow/20 rounded-lg border border-maatram-yellow">
                <p className="text-xs text-black/60 mb-1">Last Login</p>
                <p className="text-sm font-semibold text-black">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="p-4 bg-maatram-yellow/20 rounded-lg border border-maatram-yellow">
                <p className="text-xs text-black/60 mb-1">Account Type</p>
                <p className="text-sm font-semibold text-black">
                  {getRoleDisplayName(profileData.role)}
                </p>
              </div>
              <div className="p-4 bg-maatram-yellow/20 rounded-lg border border-maatram-yellow">
                <p className="text-xs text-black/60 mb-1">Status</p>
                <p className="text-sm font-semibold text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

