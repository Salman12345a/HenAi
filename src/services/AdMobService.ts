import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AdConfig } from '../config/AdConfig';

class AdMobService {
  private interstitialAd: InterstitialAd | null = null;
  private isAdLoaded = false;
  private isAdLoading = false;

  // Get the appropriate ad unit ID based on configuration
  private readonly adUnitId = AdConfig.getInterstitialAdUnitId();

  constructor() {
    console.log('🚀 AdMobService initializing...');
    console.log(`🎯 Device Type: ${AdConfig.useTestAds ? 'EMULATOR (Test Ads)' : 'REAL DEVICE (Production Ads)'}`);
    console.log(`📺 Interstitial Ad Unit ID: ${this.adUnitId}`);
    this.initializeAd();
  }

  private initializeAd() {
    try {
      this.interstitialAd = InterstitialAd.createForAdRequest(this.adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      this.setupAdEventListeners();
      this.loadAd();
    } catch (error) {
      console.error('Error initializing interstitial ad:', error);
    }
  }

  private setupAdEventListeners() {
    if (!this.interstitialAd) return;

    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
      this.isAdLoaded = true;
      this.isAdLoading = false;
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad error:', error);
      this.isAdLoaded = false;
      this.isAdLoading = false;
      // Retry loading after 30 seconds
      setTimeout(() => this.loadAd(), 30000);
    });

    this.interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
      console.log('Interstitial ad opened');
    });

    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      this.isAdLoaded = false;
      // Load a new ad for next time
      this.loadAd();
    });
  }

  private loadAd() {
    if (!this.interstitialAd || this.isAdLoading || this.isAdLoaded) return;

    try {
      this.isAdLoading = true;
      this.interstitialAd.load();
    } catch (error) {
      console.error('Error loading interstitial ad:', error);
      this.isAdLoading = false;
    }
  }

  public async showAd(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.interstitialAd || !this.isAdLoaded) {
        console.log('Interstitial ad not ready');
        resolve(false);
        return;
      }

      try {
        // Add a one-time listener for when the ad is closed
        const unsubscribe = this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
          unsubscribe();
          // Add a small delay to ensure the ad is fully dismissed before resolving
          setTimeout(() => {
            resolve(true);
          }, 200);
        });

        // Add a one-time listener for errors during show
        const errorUnsubscribe = this.interstitialAd.addAdEventListener(AdEventType.ERROR, () => {
          errorUnsubscribe();
          resolve(false);
        });

        this.interstitialAd.show();
      } catch (error) {
        console.error('Error showing interstitial ad:', error);
        resolve(false);
      }
    });
  }

  public isReady(): boolean {
    return this.isAdLoaded;
  }

  public preloadAd() {
    this.loadAd();
  }
}

// Export a singleton instance
export const adMobService = new AdMobService();
export default AdMobService;
