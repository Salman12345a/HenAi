import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type KidsCategoriesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'KidsCategories'
>;

interface Props {
  navigation: KidsCategoriesScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const KidsCategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const kidsCategories = [
    {
      id: 'kid',
      name: 'Kid (0-6)',
      icon: '👶',
      description: 'AI styles for kids aged 0-6 years',
      color: '#FF6B9D',
      gradient: ['#FF6B9D', '#C44569'],
    },
    {
      id: 'twez',
      name: 'Twez (7-16)',
      icon: '🧒',
      description: 'AI styles for tweens aged 7-16 years',
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#44A08D'],
    },
    {
      id: 'teen',
      name: 'Teen (13-18)',
      icon: '🧑',
      description: 'AI styles for teens aged 13-18 years',
      color: '#45B7D1',
      gradient: ['#45B7D1', '#96CEB4'],
    },
  ];

  const handleCategoryPress = (category: 'kid' | 'twez' | 'teen', categoryName: string) => {
    navigation.navigate('KidsCategoryScreen', { category, categoryName });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C5CE7" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kids Categories</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Categories Grid */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Choose an age-appropriate category</Text>
        
        <View style={styles.categoriesContainer}>
          {kidsCategories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { backgroundColor: category.color }
              ]}
              onPress={() => handleCategoryPress(category.id as 'kid' | 'twez' | 'teen', category.name)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
              
              {/* Decorative elements */}
              <View style={[styles.decorativeCircle, styles.circle1]} />
              <View style={[styles.decorativeCircle, styles.circle2]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6C5CE7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#6C5CE7',
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
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginLeft: -40, // Compensate for back button width
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  categoriesContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  categoryCard: {
    height: 160,
    borderRadius: 24,
    marginBottom: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  circle1: {
    width: 100,
    height: 100,
    top: -30,
    right: -30,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: -20,
    left: -20,
  },
});

export default KidsCategoriesScreen;
