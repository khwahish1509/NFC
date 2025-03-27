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
  }

  // Method to update the API base URL
  setApiBaseUrl(url: string) {
    this.apiBaseUrl = url;
    console.log('API base URL set to:', url);
  }

  // Create a new product
  async createProduct(productData: NewProductData): Promise<ProductData> {
    // For web environment (testing), use mock data
    if (isWebMockEnvironment()) {
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
      const response = await axios.post(`${this.apiBaseUrl}/products`, productData);
      return response.data;
    } catch (error) {
      console.error('API Error - Create Product:', error);
      throw new Error('Failed to create product');
    }
  }

  // Get a product by ID
  async getProductById(productId: string): Promise<ProductData> {
    // For web environment (testing), use mock data
    if (isWebMockEnvironment()) {
      const mockProduct = mockProducts[productId];
      if (mockProduct) {
        return { ...mockProduct }; // Return a copy to avoid mutation
      }
      throw new Error('Product not found');
    }
    
    // For native environments, call the actual API
    try {
      const response = await axios.get(`${this.apiBaseUrl}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - Get Product:', error);
      throw new Error('Failed to get product');
    }
  }

  // Get all products
  async getAllProducts(): Promise<ProductData[]> {
    // For web environment (testing), use mock data
    if (isWebMockEnvironment()) {
      return Object.values(mockProducts);
    }
    
    // For native environments, call the actual API
    try {
      const response = await axios.get(`${this.apiBaseUrl}/products`);
      return response.data;
    } catch (error) {
      console.error('API Error - Get All Products:', error);
      throw new Error('Failed to get products');
    }
  }

  // Update a product's transfer history
  async updateProductTransfer(productId: string, transferData: TransferData): Promise<ProductData> {
    // For web environment (testing), use mock data
    if (isWebMockEnvironment()) {
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
      const response = await axios.post(
        `${this.apiBaseUrl}/products/${productId}/transfers`,
        transferData
      );
      return response.data;
    } catch (error) {
      console.error('API Error - Update Transfer:', error);
      throw new Error('Failed to update product transfer');
    }
  }
}

export default new APIService(); 