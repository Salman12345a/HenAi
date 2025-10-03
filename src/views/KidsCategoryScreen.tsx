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
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiService } from '../services/ApiService';
import { adMobService } from '../services/AdMobService';
import { Style } from '../models/StyleModel';

type KidsCategoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'KidsCategoryScreen'
>;

type KidsCategoryScreenRouteProp = RouteProp<
  RootStackParamList,
  'KidsCategoryScreen'
>;

interface Props {
  navigation: KidsCategoryScreenNavigationProp;
  route: KidsCategoryScreenRouteProp;
}

const KidsCategoryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { category, categoryName } = route.params;
  const [categoryStyles, setCategoryStyles] = useState<Style[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isShowingAd, setIsShowingAd] = useState(false);

  useEffect(() => {
    // Preload interstitial ad when component mounts
    adMobService.preloadAd();
    
    // Load styles for this category
    loadStyles();
  }, [category]);

  const loadStyles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`🔄 Loading ${category} styles from API...`);
      
      const stylesData = await apiService.getStylesBySpecificCategory(category);
      setCategoryStyles(stylesData);
      
      console.log(`✅ ${category} styles loaded successfully:`, stylesData.length);
    } catch (error) {
      console.error(`❌ Failed to load ${category} styles:`, error);
      setError(`Failed to load ${categoryName} styles. Please check your connection.`);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      const stylesData = await apiService.getStylesBySpecificCategory(category);
      setCategoryStyles(stylesData);
      setError(null);
      console.log(`✅ ${category} styles refreshed successfully`);
    } catch (error) {
      console.error(`❌ Failed to refresh ${category} styles:`, error);
      // Don't show error on refresh, just keep existing data
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStylePress = async (styleId: string, prompt: string, title: string, imageUrl?: string) => {
    try {
      // Show loading state
      setIsShowingAd(true);
      
      // Show interstitial ad before navigation
      if (adMobService.isReady()) {
        console.log('Showing interstitial ad...');
        const adShown = await adMobService.showAd();
        
        if (adShown) {
          console.log('Ad was shown and closed, navigating to PromptScreen');
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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'kid':
        return '#FF6B9D';
      case 'twez':
        return '#4ECDC4';
      case 'teen':
        return '#45B7D1';
      default:
        return '#6C5CE7';
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'kid':
        return '👶';
      case 'twez':
        return '🧒';
      case 'teen':
        return '🧑';
      default:
        return '👶';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getCategoryColor() }]}>
      <StatusBar barStyle="light-content" backgroundColor={getCategoryColor()} />
      
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: getCategoryColor() }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
          <Text style={styles.headerTitle}>{categoryName}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[getCategoryColor()]}
              tintColor={getCategoryColor()}
            />
          }
        >
          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={getCategoryColor()} />
              <Text style={styles.loadingText}>Loading {categoryName} styles...</Text>
            </View>
          ) : error ? (
            /* Error State */
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: getCategoryColor() }]} 
                onPress={onRefresh}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : categoryStyles.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎨</Text>
              <Text style={styles.emptyTitle}>No Styles Available</Text>
              <Text style={styles.emptyText}>
                No AI styles found for {categoryName}. Check back later for new content!
              </Text>
            </View>
          ) : (
            /* Styles Grid */
            <View style={styles.stylesGrid}>
              {categoryStyles.map((style: Style) => (
                <TouchableOpacity
                  key={style.id}
                  style={styles.styleCard}
                  onPress={() => handleStylePress(style.id, style.prompt, style.title, style.imageUrl)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContent}>
                    {style.imageUrl ? (
                      <Image 
                        source={{ uri: style.imageUrl }} 
                        style={styles.styleImage} 
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
          )}
        </ScrollView>
      </View>
      
      {/* Loading Overlay for Ad Display */}
      {isShowingAd && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.overlayLoadingText}>Loading...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -40, // Compensate for back button width
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  styleCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    flex: 1,
    position: 'relative',
  },
  styleImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
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
  overlayLoadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
});

export default KidsCategoryScreen;
