

// --- CONSOLIDATED FROM: ./apiClient.ts ---

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unexpected error occurred.');
  }
  return response.json();
};

export const apiClient = {
  get: async <T>(path: string, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`, { ...config, method: 'GET' });
    return handleResponse(response);
  },
  post: async <T>(path: string, body: any, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {}),
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },
  put: async <T>(path: string, body: any, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...config,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {}),
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },
  delete: async <T>(path: string, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`, { ...config, method: 'DELETE' });
    return handleResponse(response);
  },
};


// --- CONSOLIDATED FROM: ./lib/apiClient.ts ---

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unexpected error occurred.');
  }
  return response.json();
};

export const apiClient = {
  get: async <T>(path: string, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`, { ...config, method: 'GET' });
    return handleResponse(response);
  },
  post: async <T>(path: string, body: any, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {}),
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },
  put: async <T>(path: string, body: any, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...config,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {}),
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },
  delete: async <T>(path: string, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${BASE_URL}${path}`, { ...config, method: 'DELETE' });
    return handleResponse(response);
  },
};


// --- CONSOLIDATED FROM: ./src/lib/apiClient.ts ---

const apiClient = {
  get: async (url: string, config?: any) => {
    console.warn(`MOCK API Client: GET ${url}`);
    return { data: [] }; // Return a default empty array for GET requests
  },
  post: async (url: string, data?: any, config?: any) => {
    console.warn(`MOCK API Client: POST ${url}`, data);
    return { data: {} }; // Return a default empty object for POST requests
  },
  put: async (url: string, data?: any, config?: any) => {
    console.warn(`MOCK API Client: PUT ${url}`, data);
    return { data: {} };
  },
  delete: async (url: string, config?: any) => {
    console.warn(`MOCK API Client: DELETE ${url}`);
    return { data: {} };
  },
};

export default apiClient;