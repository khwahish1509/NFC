import axios from 'axios';

// Base URL should be configured based on environment
const API_BASE_URL = 'http://192.168.1.100:5000/api';

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

// API service class
class APIService {
  // Create a new product
  createProduct = async (productData: ProductData) => {
    try {
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