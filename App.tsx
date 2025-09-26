/**
 * HenAi - AI Assistant App
 * Main App Component with MV Architecture
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialize Google Mobile Ads SDK
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob SDK initialized:', adapterStatuses);
      })
      .catch(error => {
        console.error('AdMob SDK initialization failed:', error);
      });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#f8f9fa"
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
