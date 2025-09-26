import { Style, StylesResponse, StylesByCategory, ApiError } from '../models/StyleModel';
import { Platform } from 'react-native';

// API Configuration - Different URLs for different platforms
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine's localhost
      return 'http://10.0.2.2:3000/api/v1';
    } else if (Platform.OS === 'ios') {
      // iOS simulator can use localhost
      return 'http://localhost:3000/api/v1';
    }
  }
  
  // Production - replace with your actual server URL
  return 'http://your-production-server.com/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log('🔧 ApiService initialized with URL:', this.baseUrl);
    console.log('📱 Platform:', Platform.OS);
    console.log('🛠️ Development mode:', __DEV__);
  }

  /**
   * Fetch all styles from the backend
   */
  async getAllStyles(): Promise<Style[]> {
    try {
      const url = `${this.baseUrl}/styles?limit=100`;
      console.log('🔄 Fetching all styles from API...');
      console.log('🌐 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data: StylesResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch styles');
      }
      
      console.log('✅ Successfully fetched styles:', data.data.length);
      return data.data;
      
    } catch (error) {
      console.error('❌ Error fetching styles:', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Fetch styles organized by category
   */
  async getStylesByCategory(): Promise<StylesByCategory> {
    try {
      const allStyles = await this.getAllStyles();
      
      // Filter and sort styles by category
      const stylesByCategory: StylesByCategory = {
        objects: allStyles
          .filter(style => style.category === 'objects' && style.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder),
        female: allStyles
          .filter(style => style.category === 'female' && style.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder),
        male: allStyles
          .filter(style => style.category === 'male' && style.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      };
      
      console.log('📊 Styles by category:', {
        objects: stylesByCategory.objects.length,
        female: stylesByCategory.female.length,
        male: stylesByCategory.male.length,
      });
      
      return stylesByCategory;
      
    } catch (error) {
      console.error('❌ Error organizing styles by category:', error);
      throw error;
    }
  }

  /**
   * Fetch styles for a specific category
   */
  async getStylesBySpecificCategory(category: 'objects' | 'female' | 'male'): Promise<Style[]> {
    try {
      console.log(`🔄 Fetching ${category} styles...`);
      
      const response = await fetch(`${this.baseUrl}/styles?category=${category}&limit=50`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: StylesResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || `Failed to fetch ${category} styles`);
      }
      
      // Filter active styles and sort by sortOrder
      const activeStyles = data.data
        .filter(style => style.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      
      console.log(`✅ Successfully fetched ${category} styles:`, activeStyles.length);
      return activeStyles;
      
    } catch (error) {
      console.error(`❌ Error fetching ${category} styles:`, error);
      throw error;
    }
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default ApiService;
