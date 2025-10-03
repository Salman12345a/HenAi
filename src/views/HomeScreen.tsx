import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { adMobService } from '../services/AdMobService';
import { apiService } from '../services/ApiService';
import { Style, StylesByCategory } from '../models/StyleModel';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Object');
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [stylesData, setStylesData] = useState<StylesByCategory>({
    objects: [],
    female: [],
    male: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Preload interstitial ad when component mounts
    adMobService.preloadAd();
    
    // Load styles from API
    loadStyles();
  }, []);

  const loadStyles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading styles from API...');
      
      const stylesByCategory = await apiService.getStylesByCategory();
      setStylesData(stylesByCategory);
      
      console.log('✅ Styles loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load styles:', error);
      setError('Failed to load styles. Please check your connection.');
      
      // Fallback to hardcoded data if API fails
      setStylesData(getHardcodedStyles());
    } finally {
      setIsLoading(false);
    }
  };

  // Minimal fallback styles (only used if API completely fails)
  const getHardcodedStyles = (): StylesByCategory => {
    return {
      objects: [
        {
          id: 'fallback-1',
          title: 'Sample Style',
          description: 'Sample AI style',
          prompt: 'Create an amazing AI-generated image based on the uploaded photo.',
          category: 'objects' as const,
          imageUrl: '',
          isActive: true,
          sortOrder: 1,
          metadata: { tags: [], difficulty: 'Medium' as const, estimatedTime: 15 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      female: [],
      male: [],
    };
  };

  // Refresh styles function for pull-to-refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      const stylesByCategory = await apiService.getStylesByCategory();
      setStylesData(stylesByCategory);
      setError(null);
      console.log('✅ Styles refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh styles:', error);
      // Don't show error on refresh, just keep existing data
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get current styles based on active tab
  const getCurrentStyles = (): Style[] => {
    switch (activeTab) {
      case 'Object':
        return stylesData.objects;
      case 'Female':
        return stylesData.female;
      case 'Male':
        return stylesData.male;
      default:
        return stylesData.objects;
    }
  };

  const handlePromptPress = async (styleId: string, prompt: string, title: string, imageUrl?: string) => {
    try {
      // Show loading state
      setIsShowingAd(true);
      
      // Show interstitial ad before navigation
      if (adMobService.isReady()) {
        console.log('Showing interstitial ad...');
        const adShown = await adMobService.showAd();
        
        if (adShown) {
          console.log('Ad was shown and closed, navigating to PromptScreen');
          // Navigate immediately since AdMobService already handles the delay
          setIsShowingAd(false);
          navigation.navigate('PromptScreen', { promptId: styleId, prompt, title, imageUrl });
        } else {
          console.log('Ad failed to show, navigating anyway');
          setIsShowingAd(false);
          navigation.navigate('PromptScreen', { promptId: styleId, prompt, title, imageUrl });
        }
      } else {
        console.log('Ad not ready, navigating without ad');
        setIsShowingAd(false);
        navigation.navigate('PromptScreen', { promptId: styleId, prompt, title, imageUrl });
      }
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      // Navigate anyway if there's an error
      setIsShowingAd(false);
      navigation.navigate('PromptScreen', { promptId: styleId, prompt, title, imageUrl });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#4285f4']}
            tintColor="#4285f4"
          />
        }>
        {/* Modern Tab Navigation with Icons */}
        <View style={styles.modernTabContainer}>
          <TouchableOpacity
            style={[
              styles.modernTabButton,
              activeTab === 'Object' && styles.activeModernTabButton
            ]}
            onPress={() => setActiveTab('Object')}
            activeOpacity={0.8}>
            <Text style={[
              styles.tabIcon,
              activeTab === 'Object' && styles.activeTabIcon
            ]}>🎨</Text>
            <Text style={[
              styles.modernTabText,
              activeTab === 'Object' && styles.activeModernTabText
            ]}>Objects</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modernTabButton,
              activeTab === 'Female' && styles.activeModernTabButton
            ]}
            onPress={() => setActiveTab('Female')}
            activeOpacity={0.8}>
            <Text style={[
              styles.tabIcon,
              activeTab === 'Female' && styles.activeTabIcon
            ]}>👩</Text>
            <Text style={[
              styles.modernTabText,
              activeTab === 'Female' && styles.activeModernTabText
            ]}>Female</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modernTabButton,
              activeTab === 'Male' && styles.activeModernTabButton
            ]}
            onPress={() => setActiveTab('Male')}
            activeOpacity={0.8}>
            <Text style={[
              styles.tabIcon,
              activeTab === 'Male' && styles.activeTabIcon
            ]}>👨</Text>
            <Text style={[
              styles.modernTabText,
              activeTab === 'Male' && styles.activeModernTabText
            ]}>Male</Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285f4" />
            <Text style={styles.loadingText}>Loading styles...</Text>
          </View>
        ) : error ? (
          /* Error State */
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Prompt Buttons Grid */
          <View style={styles.content}>
            <View style={styles.gridContainer}>
              {getCurrentStyles().map((style: Style) => (
                <TouchableOpacity
                  key={style.id}
                  style={styles.promptButton}
                  onPress={() => handlePromptPress(style.id, style.prompt, style.title, style.imageUrl)}
                  activeOpacity={0.8}>
                  <View style={styles.buttonContent}>
                    {style.imageUrl ? (
                      <Image 
                        source={{ uri: style.imageUrl }} 
                        style={styles.buttonImage} 
                        resizeMode="cover" 
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>No Image</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      
      
      {/* Floating Action Button for Kids Categories */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('KidsCategories')}
        activeOpacity={0.8}
      >
        <View style={styles.floatingButtonContent}>
          <Text style={styles.floatingButtonIcon}>👶</Text>
          <Text style={styles.floatingButtonText}>Kids</Text>
        </View>
      </TouchableOpacity>

      {/* Loading Overlay for Ad Display */}
      {isShowingAd && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4285f4" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ===== MODERN/NEW STYLES (Latest additions) =====
  
  // Modern Header Styles
  modernHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    alignItems: 'center',
  },
  modernTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a202c',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  modernSubtitle: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  
  // Modern Tab Styles
  modernTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f7fafc',
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 24,
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modernTabButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeModernTabButton: {
    backgroundColor: '#4285f4',
    shadowColor: '#4285f4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 6,
    opacity: 0.7,
  },
  activeTabIcon: {
    opacity: 1,
  },
  modernTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
    letterSpacing: 0.2,
  },
  activeModernTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  
  // Loading Overlay Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  
  // Loading Container Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  // Error Container Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // ===== CORE/ORIGINAL STYLES (Base components) =====
  
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2d3748',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  promptButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#4a5568',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    transform: [{ scale: 1 }],
  },
  buttonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    overflow: 'hidden',
    borderRadius: 20,
    position: 'relative',
  },
  buttonImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  zoomedImage: {
    width: '120%',
    height: '120%',
    top: '-10%',
    left: '-10%',
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Legacy Tab Styles (kept for backward compatibility)
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#4285f4',
    shadowColor: '#4285f4',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#ffffff',
  },
  
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6c757d',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  
  // Floating Action Button Styles
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6C5CE7',
    shadowColor: '#6C5CE7',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
  },
  floatingButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  floatingButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default HomeScreen;
