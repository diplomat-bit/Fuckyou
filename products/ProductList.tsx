import React, { useEffect, useState } from 'react';
import { Product } from '../../types/Product'; // Assuming Product type is defined here
import ProductCard from './ProductCard';

interface ProductListProps {
  // This component now fetches its own products, so no 'products' prop is needed.
  // If you want to allow external control or initial data, you could re-add it.
}

const ProductList: React.FC<ProductListProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // The API endpoint from the provided OpenAPI specification
        const API_BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';
        const endpoint = '/marketplace/products';
        const queryParams = new URLSearchParams({
          limit: '10', // Fetch 10 products for demonstration
          // category: 'insurance', // Example: filter by category
          // minRating: '4',        // Example: filter by minimum rating
        }).toString();

        const response = await fetch(`${API_BASE_URL}${endpoint}?${queryParams}`);

        if (!response.ok) {
          // Attempt to read error message from response body if available
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        // The API returns an object with a 'data' array containing the products
        setProducts(data.data);
      } catch (err: any) {
        console.error("Failed to fetch products:", err);
        setError(err.message || 'Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this effect runs once on component mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Loading awesome products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-md">
        <p className="font-bold text-xl mb-2">Oops! Something went wrong.</p>
        <p>Error: {error}</p>
        <p className="mt-4">Please check your internet connection or try refreshing the page.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-xl font-semibold mb-2">No products found.</p>
        <p>It seems there are no marketplace products available right now. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;