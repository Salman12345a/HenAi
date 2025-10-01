import { Style, StylesResponse, StylesByCategory, ApiError } from '../models/StyleModel';

// API Configuration - Production Cloud Run URL
const API_BASE_URL = 'https://henai-backend-b4ruhfkf3a-el.a.run.app/api/v1';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log('🔧 ApiService initialized with URL:', this.baseUrl);
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
      
      // Filter and sort styles by category (newest first)
      const stylesByCategory: StylesByCategory = {
        objects: allStyles
          .filter(style => style.category === 'objects' && style.isActive)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        female: allStyles
          .filter(style => style.category === 'female' && style.isActive)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        male: allStyles
          .filter(style => style.category === 'male' && style.isActive)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
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
      
      // Filter active styles and sort by creation date (newest first)
      const activeStyles = data.data
        .filter(style => style.isActive)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
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
