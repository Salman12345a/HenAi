import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen, PromptScreen, SplashScreen } from '../views';
import KidsCategoriesScreen from '../views/KidsCategoriesScreen';
import KidsCategoryScreen from '../views/KidsCategoryScreen';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  PromptScreen: {
    promptId: string;
    prompt: string;
    title: string;
    imageUrl?: string;
  };
  KidsCategories: undefined;
  KidsCategoryScreen: {
    category: 'kid' | 'twez' | 'teen';
    categoryName: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PromptScreen" component={PromptScreen} />
        <Stack.Screen name="KidsCategories" component={KidsCategoriesScreen} />
        <Stack.Screen name="KidsCategoryScreen" component={KidsCategoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
