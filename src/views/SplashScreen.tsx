import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SplashScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Splash'
>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    // Navigate to Home screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="#f3892b" 
        barStyle="light-content" 
        translucent={false}
      />
      <View style={styles.logoContainer}>
        <Image
          source={require('../Asset/image/henai.png')}
          style={[
            styles.logo,
            {
              width: Math.min(width * 0.4, 200),
              height: Math.min(width * 0.4, 200),
            }
          ]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3892b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
});

export default SplashScreen;
