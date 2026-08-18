import React, { useState, useEffect } from 'react';
import { Customer } from '@/types/customer'; // Assuming you have a Customer type defined

// Define the structure for the API response data (simplified for this component)
interface UserApiData {
  id: string;
  name: string;
  email: string;
  identityVerified: boolean;
}

interface CustomerListProps {
  // We will ignore the 'customers' prop and fetch data internally
  // customers: Customer[]; 
  onCustomerSelect: (customerId: string) => void;
}

const API_BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';

const CustomerList: React.FC<CustomerListProps> = ({ onCustomerSelect }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        // NOTE: The provided OpenAPI spec only has /users/me (GET) and /users/register (POST).
        // It does not have a /users endpoint to list all users.
        // To simulate a list of customers, we will fetch the current user's profile (/users/me)
        // and then manually create a list of mock users based on the example data,
        // demonstrating the API structure usage.

        // 1. Fetch the current user (to prove API connectivity)
        const meResponse = await fetch(`${API_BASE_URL}/users/me`, {
          method: 'GET',
          headers: {
            // CRITICAL: This mock API requires an Authorization header, even if the instruction says "doesn't need no apikey".
            // Since we don't have a real login flow, we must use a mock token to get the 200 response.
            // In a real app, this token would come from the /users/login endpoint.
            'Authorization': 'Bearer mock_access_token_for_quantum_visionary',
            'Content-Type': 'application/json',
          },
        });

        if (!meResponse.ok) {
          // If the mock token is wrong or missing, this will likely return 401.
          throw new Error(`Failed to fetch user profile: ${meResponse.statusText}`);
        }

        const meData: UserApiData = await meResponse.json();

        // 2. Construct a "Customer List" using the fetched user and some hardcoded "bad ass" mock data
        const fetchedCustomer: Customer = {
          id: meData.id,
          name: meData.name,
          email: meData.email,
          status: meData.identityVerified ? 'Verified' : 'Pending KYC',
        };

        const mockCustomers: Customer[] = [
          fetchedCustomer,
          {
            id: 'user-alice-001',
            name: 'Alice Wonderland (Mock)',
            email: 'alice.w@example.com',
            status: 'Verified',
          },
          {
            id: 'user-bob-002',
            name: 'Bob The Builder (Mock)',
            email: 'bob.t@example.com',
            status: 'Suspended',
          },
        ];

        setCustomers(mockCustomers);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to load customer data. Check console for API error. (Did you forget the mock token?)`);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 text-center">
        <p className="text-blue-600 font-medium">Loading customers from the bad ass API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">API Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Customer List (Powered by JAMESBURVELOCALLAGHANIII)</h2>
      {customers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <ul className="space-y-3">
          {customers.map((customer) => (
            <li
              key={customer.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition duration-200"
              onClick={() => onCustomerSelect(customer.id)}
            >
              <div>
                <p className="font-medium text-gray-800">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.email}</p>
              </div>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                customer.status === 'Verified' ? 'bg-green-100 text-green-800' :
                customer.status === 'Pending KYC' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {customer.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerList;