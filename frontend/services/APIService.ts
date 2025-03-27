import axios from 'axios';
import { Platform } from 'react-native';

// Types
export interface ProductData {
  productId: string;
  productName: string;
  origin: string;
  batchNumber: string;
  dateProduced: string;
  currentLocation: string;
  transferHistory?: TransferData[];
}

export interface NewProductData {
  productName: string;
  origin: string;
  batchNumber: string;
  dateProduced: string;
  currentLocation: string;
  initialGpsCoordinates?: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface TransferData {
  location: string;
  transferredBy: string;
  timestamp?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  } | null;
}

// Safely check if code is running in a web environment for mocking
const isWebMockEnvironment = () => {
  try {
    return Platform.OS === 'web';
  } catch (error) {
    return false;
  }
};

// Mock data for web testing
const mockProducts: { [key: string]: ProductData } = {
  'test-product-1': {
    productId: 'test-product-1',
    productName: 'Organic Apples',
    origin: 'Green Valley Farm',
    batchNumber: 'B12345',
    dateProduced: '2023-04-15',
    currentLocation: 'Distribution Center A',
    transferHistory: [
      {
        location: 'Green Valley Farm',
        transferredBy: 'John Smith',
        timestamp: '2023-04-15T09:00:00Z',
        gpsCoordinates: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
      },
      {
        location: 'Distribution Center A',
        transferredBy: 'Alice Johnson',
        timestamp: '2023-04-18T14:30:00Z',
        gpsCoordinates: {
          latitude: 37.3382,
          longitude: -121.8863,
        },
      },
    ],
  },
};

class APIService {
  private apiBaseUrl: string = 'http://localhost:5000/api';

  constructor() {
    // Default API URL will be set by context
    console.log('API Service initialized with base URL:', this.apiBaseUrl);
  }

  // Method to update the API base URL
  setApiBaseUrl(url: string) {
    this.apiBaseUrl = url;
    console.log('API base URL set to:', url);
  }

  // Create a new product
  async createProduct(productData: NewProductData): Promise<ProductData> {
    console.log('Creating product:', productData);
    // For web environment (testing), use mock data
    if (isWebMockEnvironment()) {
      console.log('Using mock data for createProduct');
      const mockProductId = `test-product-${Date.now()}`;
      const mockProduct: ProductData = {
        ...productData,
        productId: mockProductId,
        transferHistory: [
          {
            location: productData.origin,
            transferredBy: 'Farmer App User',
            timestamp: new Date().toISOString(),
            gpsCoordinates: productData.initialGpsCoordinates || undefined,
          },
        ],
      };
      
      mockProducts[mockProductId] = mockProduct;
      return mockProduct;
    }
    
    // For native environments, call the actual API
    try {
      console.log(`Calling API: POST ${this.apiBaseUrl}/products`);
      const response = await axios.post(`${this.apiBaseUrl}/products`, productData);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error - Create Product:', error);
      
      // Create a mock product as fallback
      console.log('Creating fallback mock product due to API error');
      const mockProductId = `offline-product-${Date.now()}`;
      const mockProduct: ProductData = {
        ...productData,
        productId: mockProductId,
        transferHistory: [
          {
            location: productData.origin,
            transferredBy: 'Farmer App User (Offline)',
            timestamp: new Date().toISOString(),
          },
        ],
      };
      return mockProduct;
    }
  }

  // Get a product by ID
  async getProductById(productId: string): Promise<ProductData> {
    console.log('Getting product by ID:', productId);
    // For web environment (testing), use mock data
    if (isWebMockEnvironment()) {
      console.log('Using mock data for getProductById');
      const mockProduct = mockProducts[productId];
      if (mockProduct) {
        return { ...mockProduct }; // Return a copy to avoid mutation
      }
      
      if (productId === 'simulated-tag-id' || productId === 'tag-id') {
        return { ...mockProducts['test-product-1'], productId };
      }
      
      throw new Error('Product not found');
    }
    
    // For native environments, call the actual API
    try {
      console.log(`Calling API: GET ${this.apiBaseUrl}/products/${productId}`);
      const response = await axios.get(`${this.apiBaseUrl}/products/${productId}`);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error - Get Product:', error);
      
      // Check if we have a mock version as fallback
      if (productId === 'simulated-tag-id' || productId === 'tag-id' || productId.startsWith('tag-')) {
        console.log('Returning mock product as fallback');
        return { 
          ...mockProducts['test-product-1'], 
          productId, 
          productName: 'Fallback Product (Offline Mode)'
        };
      }
      
      throw new Error('Failed to get product');
    }
  }

  // Get all products
  async getAllProducts(): Promise<ProductData[]> {
    console.log('Getting all products');
    // For web environment (testing), use mock data
    if (isWebMockEnvironment()) {
      console.log('Using mock data for getAllProducts');
      return Object.values(mockProducts);
    }
    
    // For native environments, call the actual API
    try {
      console.log(`Calling API: GET ${this.apiBaseUrl}/products`);
      const response = await axios.get(`${this.apiBaseUrl}/products`);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error - Get All Products:', error);
      
      // Return mock data as fallback
      console.log('Returning mock products as fallback');
      return Object.values(mockProducts);
    }
  }

  // Update a product's transfer history
  async updateProductTransfer(productId: string, transferData: TransferData): Promise<ProductData> {
    console.log('Updating product transfer:', productId, transferData);
    // For web environment (testing), use mock data
    if (isWebMockEnvironment()) {
      console.log('Using mock data for updateProductTransfer');
      const mockProduct = mockProducts[productId];
      if (!mockProduct) {
        throw new Error('Product not found');
      }
      
      // Add timestamp if not provided
      const transfer = {
        ...transferData,
        timestamp: transferData.timestamp || new Date().toISOString(),
      };
      
      // Update the mock product
      mockProduct.currentLocation = transfer.location;
      mockProduct.transferHistory = [
        ...(mockProduct.transferHistory || []),
        transfer,
      ];
      
      return { ...mockProduct }; // Return a copy to avoid mutation
    }
    
    // For native environments, call the actual API
    try {
      console.log(`Calling API: POST ${this.apiBaseUrl}/products/${productId}/transfers`);
      const response = await axios.post(
        `${this.apiBaseUrl}/products/${productId}/transfers`,
        transferData
      );
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error - Update Transfer:', error);
      
      // Try to find the product in mock data as fallback
      let product = mockProducts[productId];
      
      // If not found in mock, create a temporary one
      if (!product) {
        product = {
          productId,
          productName: 'Offline Product',
          origin: 'Unknown (Offline Mode)',
          batchNumber: 'OFFLINE',
          dateProduced: new Date().toISOString().split('T')[0],
          currentLocation: transferData.location,
          transferHistory: [],
        };
      }
      
      // Add the new transfer
      const transfer = {
        ...transferData,
        timestamp: new Date().toISOString(),
      };
      
      product.currentLocation = transfer.location;
      product.transferHistory = [
        ...(product.transferHistory || []),
        transfer,
      ];
      
      return { ...product };
    }
  }
}

export default new APIService(); 