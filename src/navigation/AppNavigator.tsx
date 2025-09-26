import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen, PromptScreen, SplashScreen } from '../views';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  PromptScreen: {
    promptId: string;
    prompt: string;
    title: string;
    imageUrl?: string;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
