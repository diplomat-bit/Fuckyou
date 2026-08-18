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