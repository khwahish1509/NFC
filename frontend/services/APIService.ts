import axios from 'axios';

// Base URL should be configured based on environment - set a default for now
// For development with actual devices, this should be the IP address of your computer on the local network
// In a real production app, this would come from environment variables
let API_BASE_URL = 'http://localhost:5000/api';

// Function to set the API base URL
export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
};

// Types for our data models
export interface ProductData {
  productId: string;
  productName: string;
  origin: string;
  batchNumber: string;
  dateProduced: string;
  createdBy: string;
  currentLocation: string;
  transferHistory?: TransferData[];
}

export interface TransferData {
  location: string;
  transferredBy: string;
  timestamp?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Mock data for web testing - won't affect real API calls
const mockProducts: Record<string, ProductData> = {
  'test-product-1': {
    productId: 'test-product-1',
    productName: 'Organic Tomatoes',
    origin: 'Green Valley Farm',
    batchNumber: 'B12345',
    dateProduced: '2023-10-15',
    createdBy: 'John Farmer',
    currentLocation: 'Green Valley Farm',
    transferHistory: [
      {
        location: 'Green Valley Farm',
        transferredBy: 'John Farmer',
        timestamp: '2023-10-15T10:30:00Z'
      }
    ]
  }
};

// API service class
class APIService {
  // Create a new product
  createProduct = async (productData: ProductData) => {
    try {
      // Handle web environment with mock data
      if (typeof window !== 'undefined' && window.navigator.userAgent.includes('ReactNativeDebugger')) {
        console.log('Mock API call - createProduct', productData);
        mockProducts[productData.productId] = productData;
        return productData;
      }

      const response = await axios.post(
        `${API_BASE_URL}/products`,
        productData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  // Get product by its ID
  getProductById = async (productId: string) => {
    try {
      // Handle web environment with mock data
      if (typeof window !== 'undefined' && window.navigator.userAgent.includes('ReactNativeDebugger')) {
        console.log('Mock API call - getProductById', productId);
        // Return mock data for testing
        if (mockProducts[productId]) {
          return mockProducts[productId];
        }
        // Return test product if ID doesn't exist in mock data
        return mockProducts['test-product-1'];
      }

      const response = await axios.get(
        `${API_BASE_URL}/products/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  };

  // Get all products
  getAllProducts = async () => {
    try {
      // Handle web environment with mock data
      if (typeof window !== 'undefined' && window.navigator.userAgent.includes('ReactNativeDebugger')) {
        console.log('Mock API call - getAllProducts');
        return Object.values(mockProducts);
      }

      const response = await axios.get(`${API_BASE_URL}/products`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  };

  // Update product transfer history
  updateProductTransfer = async (
    productId: string,
    transferData: TransferData
  ) => {
    try {
      // Handle web environment with mock data
      if (typeof window !== 'undefined' && window.navigator.userAgent.includes('ReactNativeDebugger')) {
        console.log('Mock API call - updateProductTransfer', productId, transferData);
        
        if (mockProducts[productId]) {
          const product = mockProducts[productId];
          product.currentLocation = transferData.location;
          
          if (!product.transferHistory) {
            product.transferHistory = [];
          }
          
          product.transferHistory.push({
            ...transferData,
            timestamp: new Date().toISOString()
          });
          
          return product;
        }
        
        return mockProducts['test-product-1'];
      }

      const response = await axios.patch(
        `${API_BASE_URL}/products/${productId}/transfer`,
        transferData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating product transfer:', error);
      throw error;
    }
  };
}

export default new APIService(); 