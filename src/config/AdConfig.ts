import { TestIds } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// Function to detect if running on emulator
const isRunningOnEmulator = (): boolean => {
  try {
    if (Platform.OS === 'android') {
      // Android emulator detection using Platform constants
      const { PlatformConstants } = require('react-native');
      const fingerprint = PlatformConstants?.Fingerprint || '';
      const model = PlatformConstants?.Model || '';
      const brand = PlatformConstants?.Brand || '';
      
      const isEmulator = (
        fingerprint.includes('generic') ||
        fingerprint.includes('unknown') ||
        model.includes('google_sdk') ||
        model.includes('Emulator') ||
        model.includes('Android SDK') ||
        model.toLowerCase().includes('emulator') ||
        brand.includes('generic') ||
        brand.includes('google')
      );
      
      console.log('🔍 Android Device Detection:', {
        fingerprint,
        model,
        brand,
        isEmulator
      });
      
      return isEmulator;
    } else if (Platform.OS === 'ios') {
      // iOS simulator detection
      const { PlatformConstants } = require('react-native');
      const isSimulator = PlatformConstants?.interfaceIdiom === 'simulator';
      
      console.log('🔍 iOS Device Detection:', {
        interfaceIdiom: PlatformConstants?.interfaceIdiom,
        isSimulator
      });
      
      return isSimulator;
    }
    
    return false;
  } catch (error) {
    console.log('⚠️ Error detecting emulator, defaulting to test ads:', error);
    return true; // Default to test ads if detection fails
  }
};

// Detect device type and log the result
const isEmulator = isRunningOnEmulator();
console.log(`🎯 AdMob Configuration: ${isEmulator ? 'EMULATOR' : 'REAL DEVICE'} detected`);
console.log(`📱 Using ${isEmulator ? 'TEST' : 'PRODUCTION'} ads`);

// Configuration for AdMob ads
export const AdConfig = {
  // Automatically detect if we should use test ads (true for emulator, false for real device)
  useTestAds: isEmulator,
  
  // Enable/disable banner ads (useful for troubleshooting)
  enableBannerAds: true,
  
  // Production Ad Unit IDs
  production: {
    appId: 'ca-app-pub-2620094529158311~3119034927',
    interstitialAdUnitId: 'ca-app-pub-2620094529158311/4564796774',
    bannerAdUnitId: 'ca-app-pub-2620094529158311/3043343845',
  },
  
  // Test Ad Unit IDs (provided by Google)
  test: {
    interstitialAdUnitId: TestIds.INTERSTITIAL,
    bannerAdUnitId: TestIds.BANNER,
  },
  
  // Get the appropriate ad unit ID based on current mode
  getInterstitialAdUnitId: () => {
    return AdConfig.useTestAds 
      ? AdConfig.test.interstitialAdUnitId 
      : AdConfig.production.interstitialAdUnitId;
  },
  
  getBannerAdUnitId: () => {
    return AdConfig.useTestAds 
      ? AdConfig.test.bannerAdUnitId 
      : AdConfig.production.bannerAdUnitId;
  },
};

export default AdConfig;
