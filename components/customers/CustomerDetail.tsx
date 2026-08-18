import React, { useState, useEffect } from 'react';

// Define the structure of the user profile based on the /users/me API response
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  loyaltyTier?: string;
  loyaltyPoints?: number;
  gamificationLevel?: number;
  aiPersona?: string;
  securityStatus?: {
    twoFactorEnabled?: boolean;
    biometricsEnrolled?: boolean;
    lastLogin?: string;
    lastLoginIp?: string;
  };
  preferences?: {
    preferredLanguage?: string;
    theme?: string;
    aiInteractionMode?: string;
    notificationChannels?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
      inApp?: boolean;
    };
    dataSharingConsent?: boolean;
    transactionGrouping?: string;
  };
  identityVerified?: boolean;
}

interface CustomerDetailProps {
  // This component is now designed to fetch and display the *current* authenticated user's details.
  // The original 'customer' prop is no longer directly used for fetching,
  // as the /users/me endpoint does not take a user ID.
  // If a specific user's details were needed, the API would require an endpoint like /users/{userId}.
}

const CustomerDetail: React.FC<CustomerDetailProps> = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // The base URL for the mock API provided in the instruction
  const API_BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        // As per instruction "doesn't need no apikey", we make a direct fetch without auth headers.
        const response = await fetch(`${API_BASE_URL}/users/me`);
        if (!response.ok) {
          // Attempt to parse a more detailed error message from the response body
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data: UserProfile = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array ensures this effect runs only once on component mount

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-600">
        Loading user details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <p className="text-sm mt-2">Please ensure the mock API server is running and accessible.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-600">
        No user data available.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">User Profile (Quantum Core 3.0)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase mb-1">ID</p>
          <p className="text-lg text-gray-900">{user.id}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Name</p>
          <p className="text-lg text-gray-900">{user.name}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Email</p>
          <p className="text-lg text-gray-900">{user.email}</p>
        </div>
        {user.phone && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Phone</p>
            <p className="text-lg text-gray-900">{user.phone}</p>
          </div>
        )}
        {user.dateOfBirth && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Date of Birth</p>
            <p className="text-lg text-gray-900">{new Date(user.dateOfBirth).toLocaleDateString()}</p>
          </div>
        )}
        {user.address && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Address</p>
            <p className="text-lg text-gray-900">
              {user.address.street}, {user.address.city}, {user.address.state} {user.address.zip}, {user.address.country}
            </p>
          </div>
        )}
        {user.loyaltyTier && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Loyalty Tier</p>
            <p className="text-lg text-gray-900">{user.loyaltyTier}</p>
          </div>
        )}
        {user.loyaltyPoints !== undefined && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Loyalty Points</p>
            <p className="text-lg text-gray-900">{user.loyaltyPoints}</p>
          </div>
        )}
        {user.gamificationLevel !== undefined && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Gamification Level</p>
            <p className="text-lg text-gray-900">{user.gamificationLevel}</p>
          </div>
        )}
        {user.aiPersona && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">AI Persona</p>
            <p className="text-lg text-gray-900">{user.aiPersona}</p>
          </div>
        )}
        {user.identityVerified !== undefined && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Identity Verified</p>
            <span className={`text-lg font-medium px-3 py-1 rounded-full ${
              user.identityVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.identityVerified ? 'Yes' : 'No'}
            </span>
          </div>
        )}

        {/* Security Status */}
        {user.securityStatus && (
          <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-xl font-bold mb-3 text-gray-800">Security Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.securityStatus.twoFactorEnabled !== undefined && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Two-Factor Enabled</p>
                  <span className={`text-lg font-medium px-3 py-1 rounded-full ${
                    user.securityStatus.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.securityStatus.twoFactorEnabled ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
              {user.securityStatus.biometricsEnrolled !== undefined && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Biometrics Enrolled</p>
                  <span className={`text-lg font-medium px-3 py-1 rounded-full ${
                    user.securityStatus.biometricsEnrolled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.securityStatus.biometricsEnrolled ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
              {user.securityStatus.lastLogin && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Last Login</p>
                  <p className="text-lg text-gray-900">{new Date(user.securityStatus.lastLogin).toLocaleString()}</p>
                </div>
              )}
              {user.securityStatus.lastLoginIp && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Last Login IP</p>
                  <p className="text-lg text-gray-900">{user.securityStatus.lastLoginIp}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preferences */}
        {user.preferences && (
          <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-xl font-bold mb-3 text-gray-800">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.preferences.preferredLanguage && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Preferred Language</p>
                  <p className="text-lg text-gray-900">{user.preferences.preferredLanguage}</p>
                </div>
              )}
              {user.preferences.theme && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Theme</p>
                  <p className="text-lg text-gray-900">{user.preferences.theme}</p>
                </div>
              )}
              {user.preferences.aiInteractionMode && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">AI Interaction Mode</p>
                  <p className="text-lg text-gray-900">{user.preferences.aiInteractionMode}</p>
                </div>
              )}
              {user.preferences.dataSharingConsent !== undefined && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Data Sharing Consent</p>
                  <span className={`text-lg font-medium px-3 py-1 rounded-full ${
                    user.preferences.dataSharingConsent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.preferences.dataSharingConsent ? 'Granted' : 'Denied'}
                  </span>
                </div>
              )}
              {user.preferences.transactionGrouping && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Transaction Grouping</p>
                  <p className="text-lg text-gray-900">{user.preferences.transactionGrouping}</p>
                </div>
              )}
              {user.preferences.notificationChannels && (
                <div className="md:col-span-2 mt-2">
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Notification Channels</p>
                  <ul className="list-disc list-inside text-lg text-gray-900">
                    {Object.entries(user.preferences.notificationChannels).map(([channel, enabled]) => (
                      <li key={channel}>
                        {channel.charAt(0).toUpperCase() + channel.slice(1)}: {enabled ? 'Enabled' : 'Disabled'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;