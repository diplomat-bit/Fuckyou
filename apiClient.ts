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
